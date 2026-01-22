// File: gsApi/Program.cs
using gsApi.data;
using gsApi.middleware;
using gsApi.Swagger;
using gsApi.services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using System;
using System.IO;
using System.Reflection;

var startupLogPath = Path.Combine(AppContext.BaseDirectory, "gsApi_startup_trace.log");
Action<string> earlyManualLog = (message) =>
{
    try { File.AppendAllText(startupLogPath, $"[{DateTime.UtcNow:o}] {message}{Environment.NewLine}"); }
    catch (Exception ex) { Console.WriteLine($"Falha ao escrever no log manual inicial: {ex.Message}"); }
};
ILogger? appLogger = null;

try
{
    earlyManualLog("INICIANDO SEQUNCIA DE STARTUP DA APLICAO GSAPI...");
    var builder = WebApplication.CreateBuilder(args);
    earlyManualLog($"WebApplication.CreateBuilder concludo. Argumentos: {string.Join(" ", args)}");

    // Configuração de Logging Inicial
    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.AddDebug();
    // Configura o logging a partir do appsettings.json para o builder também
    builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));
    earlyManualLog("Provedores de logging (Console, Debug) configurados no builder.Logging.");

    // Logger para estágios iniciais (antes de app.Services estar disponível)
    using var tempLoggerFactory = LoggerFactory.Create(logBuilder =>
    {
        logBuilder.AddConfiguration(builder.Configuration.GetSection("Logging"));
        logBuilder.AddConsole();
        logBuilder.AddDebug();
    });
    var earlyStageLogger = tempLoggerFactory.CreateLogger("StartupConfig");
    earlyStageLogger.LogInformation("Logger de estgio inicial ('StartupConfig') criado.");
    earlyStageLogger.LogInformation($"Nvel de Log Default: {builder.Configuration.GetValue<string>("Logging:LogLevel:Default", "N/A")}");
    earlyStageLogger.LogInformation($"Nvel de Log Microsoft.AspNetCore: {builder.Configuration.GetValue<string>("Logging:LogLevel:Microsoft.AspNetCore", "N/A")}");
    earlyStageLogger.LogInformation($"Nvel de Log Microsoft.EntityFrameworkCore.Database.Command: {builder.Configuration.GetValue<string>("Logging:LogLevel:Microsoft.EntityFrameworkCore.Database.Command", "N/A")}");

    earlyStageLogger.LogInformation("Iniciando configurao de servios (builder.Services)...");

    // --- INÍCIO DA CONFIGURAÇÃO DE CORS ---
    var MyAllowSpecificOrigins = "_myAllowSpecificOriginsGsApi";
    earlyStageLogger.LogInformation("Definindo política CORS com nome: {PolicyName}", MyAllowSpecificOrigins);

    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: MyAllowSpecificOrigins,
                          policy =>
                          {
                              policy.WithOrigins("http://localhost:3001", "http://localhost:3000") // Adicionei localhost:3000 também, caso seu frontend mude de porta
                                    .AllowAnyHeader()
                                    .AllowAnyMethod();
                          });
    });
    earlyStageLogger.LogInformation("Serviço AddCors() configurado para a política '{PolicyName}' permitindo origens como http://localhost:3001.", MyAllowSpecificOrigins);
    // --- FIM DA CONFIGURAÇÃO DE CORS ---

    builder.Services.AddControllers();
    earlyStageLogger.LogInformation("Servio AddControllers() adicionado.");
    builder.Services.AddEndpointsApiExplorer();
    earlyStageLogger.LogInformation("Servio AddEndpointsApiExplorer() adicionado.");

    var connectionString = builder.Configuration.GetConnectionString("OracleDb");
    string displayConnectionString = string.IsNullOrEmpty(connectionString) ?
                                     "NO ENCONTRADA" :
                                     (connectionString.ToLowerInvariant().Contains("password=") || connectionString.ToLowerInvariant().Contains("pwd=") ?
                                     "***SENHA OCULTADA NA STRING DE CONEXO***" :
                                     connectionString);
    earlyStageLogger.LogInformation("String de conexo 'OracleDb' lida: '{ConnString}'", displayConnectionString);

    if (string.IsNullOrEmpty(connectionString))
    {
        var errorMsg = "FATAL: String de conexo 'OracleDb' no encontrada ou vazia no appsettings.json.";
        earlyStageLogger.LogCritical(errorMsg); earlyManualLog(errorMsg);
        throw new InvalidOperationException(errorMsg);
    }

    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        earlyStageLogger.LogInformation("Configurando AppDbContext com provedor Oracle...");
        options.UseOracle(connectionString, oracleOptions =>
        {
            oracleOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
            earlyStageLogger.LogInformation("QuerySplittingBehavior.SplitQuery configurado para Oracle.");
        })
        .LogTo(logMessage => earlyStageLogger.LogInformation(logMessage),
               new[] {
                   DbLoggerCategory.Database.Command.Name, DbLoggerCategory.Query.Name,
                   DbLoggerCategory.Database.Connection.Name, DbLoggerCategory.Model.Validation.Name,
                   DbLoggerCategory.ChangeTracking.Name, DbLoggerCategory.Infrastructure.Name
               },
               LogLevel.Information, DbContextLoggerOptions.DefaultWithUtcTime);

        if (builder.Environment.IsDevelopment())
        {
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
            earlyStageLogger.LogInformation("EnableSensitiveDataLogging e EnableDetailedErrors HABILITADOS para AppDbContext (Dev).");
        }
        earlyStageLogger.LogInformation("AppDbContext configurado.");
    });

    // Registro dos Clientes HTTP e Serviços
    builder.Services.AddHttpClient<IViaCepClient, ViaCepClient>(client =>
    {
        var viaCepBaseUrl = builder.Configuration["ExternalServices:ViaCep:BaseUrl"];
        if (string.IsNullOrEmpty(viaCepBaseUrl))
        {
            earlyStageLogger.LogCritical("URL base para ViaCEP não configurada em ExternalServices:ViaCep:BaseUrl. O serviço ViaCepClient não funcionará corretamente.");
            throw new InvalidOperationException("URL base para ViaCEP não configurada em ExternalServices:ViaCep:BaseUrl.");
        }
        client.BaseAddress = new Uri(viaCepBaseUrl);
        earlyStageLogger.LogInformation("HttpClient para ViaCepClient configurado com BaseUrl: {ViaCepBaseUrl}", viaCepBaseUrl);
    });

    builder.Services.AddHttpClient<IGeoCodingClient, GeoCodingClient>(); // ApiKey e ApiUrl são lidos dentro do client via IConfiguration

    builder.Services.AddHttpClient<INasaEonetClient, NasaEonetClient>(client =>
    {
        var eonetBaseUrl = builder.Configuration["ExternalServices:NasaEonet:BaseUrl"];
        if (string.IsNullOrEmpty(eonetBaseUrl))
        {
            earlyStageLogger.LogCritical("URL base para NASA EONET não configurada em ExternalServices:NasaEonet:BaseUrl.");
            throw new InvalidOperationException("URL base para NASA EONET não configurada em ExternalServices:NasaEonet:BaseUrl.");
        }
        client.BaseAddress = new Uri(eonetBaseUrl);
        client.DefaultRequestHeaders.Add("User-Agent", "gsApi/1.0 (FIAP Global Solution)");
        earlyStageLogger.LogInformation("HttpClient para NasaEonetClient configurado com BaseUrl: {NasaEonetBaseUrl}", eonetBaseUrl);
    });
    builder.Services.AddTransient<IEmailNotificationService, EmailNotificationService>();
    earlyStageLogger.LogInformation("Servios de cliente HTTP (ViaCep, GeoCoding, NasaEonet) e EmailNotificationService registrados.");

    // <<< ADICIONADO: Registro do Serviço de Cache em Memória >>>
    builder.Services.AddMemoryCache();
    earlyStageLogger.LogInformation("Serviço AddMemoryCache() adicionado para cache em memória.");

    builder.Services.AddSwaggerGen(c =>
    {
        var description = "API RESTful desenvolvida como parte da Global Solution FIAP 2025/1 " +
                          "(2 Ano - Anlise e Desenvolvimento de Sistemas, Turmas de Fevereiro) para o desafio 'Eventos Extremos'. " +
                          "O projeto 'GS Alerta Desastres', da Equipe MetaMind, prope uma soluo tecnolgica para monitorar " +
                          "eventos de desastres naturais em tempo real (utilizando dados da API EONET da NASA), fornecer informaes " +
                          "cruciais e permitir o disparo de alertas para usurios cadastrados, visando ajudar pessoas e prevenir problemas " +
                          "maiores em cenrios impactados por eventos extremos da natureza. Esta API .NET, criada para a disciplina " +
                          "'Advanced Business Development with .NET', tem como objetivo atender aos requisitos de uma API REST robusta " +
                          "para tratar de problemas crticos e auxiliar as pessoas em perodos de extrema urgncia, incluindo persistncia " +
                          "de dados, relacionamentos, documentao Swagger." +
                          "\n\n**Equipe MetaMind:**" +
                          "\n- Paulo André Carminati (RM: 557881) - GitHub: [carmipa](https://github.com/carmipa)" +
                          "\n- Arthur Bispo de Lima (RM: 557568) - GitHub: [ArthurBispo00](https://github.com/ArthurBispo00)" +
                          "\n- João Paulo Moreira (RM: 557808) - GitHub: [joao1015](https://github.com/joao1015)" +
                          "\n" +
                          "\n- Repósritório do projéto - GitHub: [GS_FIAP_2025_1SM](https://github.com/carmipa/GS_FIAP_2025_1SM)" +
                          "\n" +
                          "\n- Repósritório dda matéria - GitHub: [Advanced_Business_Development_with.NET](https://github.com/carmipa/GS_FIAP_2025_1SM/tree/main/Advanced_Business_Development_with.NET)" +
                          "\n" +
                          "\n- Vídeo de Apresentação: [YOUTUBE](https://youtu.be/Ad20_tE9ccU)" +
                          "\n" +
                          "\n- Diagramas de relacionamento: [GitHub](https://github.com/carmipa/GS_FIAP_2025_1SM/tree/main/Advanced_Business_Development_with.NET/DIAGRAMAS)";

        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "GS Alerta Desastres - API (.NET) - Desafio Eventos Extremos",
            Version = "v1.0.0",
            Description = description,
            Contact = new OpenApiContact { Name = "Equipe MetaMind", Email = "equipe.metamind.fiap@example.com", Url = new Uri("https://github.com/carmipa/GS_FIAP_2025_1SM") },
            License = new OpenApiLicense { Name = "MIT License", Url = new Uri("https://github.com/carmipa/GS_FIAP_2025_1SM/blob/main/LICENSE") }
        });
        c.DocumentFilter<ExternalDocsDocumentFilter>();

        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            c.IncludeXmlComments(xmlPath);
            earlyStageLogger.LogInformation($"Comentrios XML para Swagger includos do arquivo: {xmlPath}");
        }
        else
        {
            earlyStageLogger.LogWarning($"Arquivo XML de comentrios Swagger no encontrado: {xmlPath}. Verifique se <GenerateDocumentationFile>true</GenerateDocumentationFile> está no .csproj e se o projeto foi compilado.");
        }
    });
    earlyStageLogger.LogInformation("Configurao de SwaggerGen concluda.");
    earlyStageLogger.LogInformation("Configurao de todos os servios finalizada.");

    var app = builder.Build();
    appLogger = app.Services.GetRequiredService<ILogger<Program>>();
    appLogger.LogInformation("Aplicao construda. Configurando pipeline HTTP...");

    app.UseMiddleware<TratadorGlobalExcecoesMiddleware>();
    appLogger.LogInformation("Middleware 'TratadorGlobalExcecoesMiddleware' adicionado.");

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(o =>
        {
            o.SwaggerEndpoint("/swagger/v1/swagger.json", "GS Alerta API V1");
            // o.RoutePrefix = string.Empty; // Para Swagger UI na raiz, se desejado
            appLogger.LogInformation("Swagger UI habilitado em Desenvolvimento.");
        });
    }
    else
    {
        app.UseHsts(); // Use HSTS em produção
        appLogger.LogInformation("HSTS habilitado para ambiente no-Desenvolvimento.");
    }

    app.UseHttpsRedirection();
    appLogger.LogInformation("HTTPS Redirection habilitado.");

    app.UseRouting(); // Adicionar UseRouting antes de UseCors e UseAuthorization
    appLogger.LogInformation("Routing middleware habilitado.");

    app.UseCors(MyAllowSpecificOrigins);
    appLogger.LogInformation("Middleware UseCors() com a política '{PolicyName}' adicionado ao pipeline.", MyAllowSpecificOrigins);

    app.UseAuthorization();
    appLogger.LogInformation("Authorization middleware habilitado.");

    app.MapControllers();
    appLogger.LogInformation("Controllers mapeados.");

    appLogger.LogInformation("Pipeline HTTP configurado. Iniciando aplicao...");
    earlyManualLog("TENTANDO EXECUTAR APP.RUN()...");
    app.Run();
}
catch (Exception ex)
{
    var fatalMsg = $"EXCEO FATAL NA INICIALIZAO: {ex.ToString()}";
    Console.ForegroundColor = ConsoleColor.Red; Console.Error.WriteLine(fatalMsg); Console.ResetColor();
    earlyManualLog(fatalMsg);
    if (appLogger != null) { appLogger.LogCritical(ex, "Falha CRTICA na inicializao."); }
    else { LoggerFactory.Create(lb => lb.AddConsole().AddDebug()).CreateLogger("StartupCrash").LogCritical(ex, "Falha CRTICA na inicializao (appLogger nulo)."); }
    // Environment.Exit(1); // Força a saída em caso de falha crítica no startup
    throw; // Relança a exceção para que o host do processo falhe como esperado
}
finally
{
    earlyManualLog("SEQUNCIA DE STARTUP FINALIZADA.");
}