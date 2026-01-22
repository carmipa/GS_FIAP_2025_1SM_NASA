// File: gsApi/controller/StatsController.cs
using gsApi.data;
using gsApi.dto.response; // Para NasaEonetEventDto (verifique se está correto)
using gsApi.DTOs.Response;
using gsApi.model.DTOs.Response; // <<< CORRIGIDO: Para CategoryCountDto
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace gsApi.controller
{
    /// <summary>
    /// Fornece endpoints para obter dados estatísticos sobre eventos EONET.
    /// </summary>
    [ApiController]
    [Route("api/stats")]
    [Produces("application/json")]
    public class StatsController : ControllerBase
    {
        private readonly ILogger<StatsController> _logger;
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;

        public StatsController(
            ILogger<StatsController> logger,
            AppDbContext context,
            IMemoryCache cache)
        {
            _logger = logger;
            _context = context;
            _cache = cache;
        }

        /// <summary>
        /// Obtém a contagem de eventos EONET locais por categoria para um determinado período em dias.
        /// </summary>
        /// <remarks>
        /// Calcula o número de eventos para cada categoria com base nos dados JSON armazenados
        /// para os eventos EONET dentro do período especificado. Os resultados são cacheados em memória.
        /// </remarks>
        /// <param name="days">Número de dias no passado a serem considerados para a estatística (ex: 365 para o último ano).
        /// Deve ser um número positivo. Padrão é 365.</param>
        /// <response code="200">Retorna as estatísticas de contagem de eventos por categoria.</response>
        /// <response code="400">Se o parâmetro 'days' for inválido (ex: não positivo).</response>
        /// <response code="500">Se ocorrer um erro interno inesperado no servidor durante o processamento.</response>
        [HttpGet("eonet/count-by-category")]
        [ProducesResponseType(typeof(List<CategoryCountDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetEonetCountByCategory(
            [FromQuery, Range(1, int.MaxValue, ErrorMessage = "O parâmetro 'days' deve ser um número positivo maior que zero.")] int days = 365)
        {
            _logger.LogInformation("Endpoint GET /api/stats/eonet/count-by-category chamado com days: {Days}", days);

            if (days <= 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Parâmetro Inválido",
                    Detail = "O parâmetro 'days' deve ser um número positivo maior que zero."
                });
            }

            string cacheKey = $"EonetCategoryStats_{days}";
            List<CategoryCountDto> statsResult; // Declarada aqui para ser acessível em ambos os escopos

            if (!_cache.TryGetValue(cacheKey, out statsResult))
            {
                _logger.LogInformation("Cache miss para a chave: {CacheKey}. Calculando estatísticas...", cacheKey);

                var dataFinal = DateTimeOffset.UtcNow;
                var dataInicial = dataFinal.AddDays(-days);
                _logger.LogInformation("Calculando estatísticas de eventos EONET por categoria de {DataInicial} até {DataFinal}", dataInicial, dataFinal);

                var eventosJsonNoPeriodo = await _context.EonetEvents
                                                     .Where(e => e.Data.HasValue && e.Data.Value >= dataInicial.UtcDateTime && e.Data.Value <= dataFinal.UtcDateTime && e.Json != null)
                                                     .Select(e => e.Json)
                                                     .AsNoTracking()
                                                     .ToListAsync();

                _logger.LogInformation("{Count} strings JSON de eventos locais encontradas entre {DataInicial} e {DataFinal} para contagem por categoria.",
                    eventosJsonNoPeriodo.Count, dataInicial, dataFinal);

                var categoryCounts = new Dictionary<string, long>();
                var jsonSerializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                foreach (var jsonString in eventosJsonNoPeriodo)
                {
                    if (string.IsNullOrEmpty(jsonString))
                    {
                        continue;
                    }
                    try
                    {
                        NasaEonetEventDto? eventoNasaDto = JsonSerializer.Deserialize<NasaEonetEventDto>(jsonString, jsonSerializerOptions);
                        if (eventoNasaDto?.Categories != null)
                        {
                            foreach (var category in eventoNasaDto.Categories)
                            {
                                if (!string.IsNullOrEmpty(category.Title))
                                {
                                    if (categoryCounts.ContainsKey(category.Title))
                                    {
                                        categoryCounts[category.Title]++;
                                    }
                                    else
                                    {
                                        categoryCounts[category.Title] = 1;
                                    }
                                }
                            }
                        }
                    }
                    catch (JsonException jsonEx)
                    {
                        _logger.LogWarning(jsonEx, "Falha ao desserializar JSON durante a contagem de categorias. JSON Snippet: {JsonSnippet}",
                            jsonString.Length > 200 ? jsonString.Substring(0, 200) + "..." : jsonString);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro inesperado ao processar categorias de um JSON.");
                    }
                }

                statsResult = categoryCounts
                                    .Select(kvp => new CategoryCountDto(kvp.Key, kvp.Value)) // O erro CS0246 ocorre aqui
                                    .OrderByDescending(dto => dto.Count)
                                    .ToList();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1));

                _cache.Set(cacheKey, statsResult, cacheEntryOptions);
                _logger.LogInformation("Estatísticas salvas no cache para a chave: {CacheKey}", cacheKey);
            }
            else
            {
                _logger.LogInformation("Cache hit para a chave: {CacheKey}. Retornando dados cacheados.", cacheKey);
            }

            _logger.LogInformation("Estatísticas de contagem por categoria prontas com {Count} categorias distintas.", statsResult?.Count ?? 0); // Adicionado null check para statsResult
            return Ok(statsResult);
        }
    }
}