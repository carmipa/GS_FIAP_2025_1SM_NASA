package br.com.fiap.gs.gsapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenApiConfig.class);

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${swagger.server.url:http://localhost:8080}")
    private String swaggerServerUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        log.info("🔧 Configuração personalizada do OpenAPI inicializada.");

        String serverUrl = swaggerServerUrl + contextPath;
        log.info("🔗 URL do Servidor para Swagger UI: {}", serverUrl);

        final String SECURITY_SCHEME_NAME = "bearerAuth";
        final String CONTATO_EMAIL_EQUIPE = "rm557881@fiap.com.br";

        return new OpenAPI()
                .info(new Info()
                        .title("GS API - Alertas de Desastres Naturais")
                        .version("v1.0.0")
                        .description(String.format("""
                                **API RESTful para o Global Solution FIAP 2025**
                                Esta API visa fornecer funcionalidades para o gerenciamento e alerta de desastres naturais,
                                utilizando dados da NASA EONET e informações de geolocalização de usuários.

                                ---
                                **FUNCIONALIDADES PRINCIPAIS DA API** ⚙️
                                - Cadastro e gerenciamento de clientes e seus endereços.
                                - Consulta de eventos de desastres naturais (via EONET).
                                - Sincronização de eventos da NASA para o banco de dados local.
                                - Busca de eventos próximos a coordenadas geográficas.
                                - Disparo de alertas para usuários específicos sobre eventos.

                                ---
                                **EQUIPE METAMIND** 👨‍💻
                                - **Paulo André Carminati** (RM: 557881) - GitHub: [carmipa](https://github.com/carmipa)
                                - **Arthur Bispo de Lima** (RM: 557568) - GitHub: [ArthurBispo00](https://github.com/ArthurBispo00)
                                - **João Paulo Moreira** (RM: 557808) - GitHub: [joao1015](https://github.com/joao1015)

                                ---
                                **RECURSOS DO PROJETO** 🛠️
                                - 📦 **Repositório do projeto (API):** [GS_FIAP_2025_1SM](https://github.com/carmipa/GS_FIAP_2025_1SM)
                                - 📚 **Repositório da matéria (Exemplo):** [Java_Advanced](https://github.com/carmipa/GS_FIAP_2025_1SM/tree/main/Java_Advanced)
                                - 🎬 **Vídeo de Apresentação:** [Assistir Vídeo](https://youtu.be/j_qpO5N5fVY)
                                - 📊 **Diagrama de Relacionamento:** [Acessar Diagramas](https://github.com/carmipa/GS_FIAP_2025_1SM/tree/main/Java_Advanced/DIAGRAMAS)
                                - 📝 **Documentação:** [Acessar README](https://github.com/carmipa/GS_FIAP_2025_1SM/blob/main/Java_Advanced/README.md)

                                ---
                                **MAIS INFORMAÇÕES** 🔗
                                - 🌐 [Equipe MetaMind - Website](https://github.com/carmipa/GS_FIAP_2025_1SM/tree/main/Java_Advanced/DIAGRAMAS)
                                - 📧 [Enviar email para Equipe MetaMind](mailto:%s)
                                - 📜 [MIT License](https://opensource.org/licenses/MIT)
                                - 🎓 [Global Solution FIAP](https://www.fiap.com.br/graduacao/global-solution/)
                                """, CONTATO_EMAIL_EQUIPE))
                        .contact(new Contact()
                                .name("Equipe MetaMind GS")
                                .email(CONTATO_EMAIL_EQUIPE)
                                .url("https://github.com/carmipa/GS_FIAP_2025_1SM"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT"))
                )
                .servers(List.of(
                        new Server().url(serverUrl).description("Servidor Swagger Ativo")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Insira o token JWT no formato: Bearer {seuTokenAqui}.")
                        )
                );
    }
}
