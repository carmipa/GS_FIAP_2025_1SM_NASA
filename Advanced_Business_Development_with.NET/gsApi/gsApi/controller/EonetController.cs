// File: gsApi/controller/EonetController.cs
using gsApi.data;
using gsApi.dto.request;
using gsApi.dto.response;
using gsApi.DTOs.Request;

using gsApi.DTOs.Response;

// Removidos usings duplicados para gsApi.DTOs... se gsApi.dto... já cobre
using gsApi.exceptions; // Para ServicoIndisponivelException
using gsApi.Exceptions;
using gsApi.model;
using gsApi.model.DTOs.Response;
using gsApi.services; // Para INasaEonetClient
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    /// Gerencia eventos EONET, incluindo sincronização com a NASA e buscas locais.
    /// </summary>
    [ApiController]
    [Route("api/eonet")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class EonetController : ControllerBase
    {
        private readonly ILogger<EonetController> _logger;
        private readonly AppDbContext _context;
        private readonly INasaEonetClient _nasaEonetClient;

        public EonetController(ILogger<EonetController> logger, AppDbContext context, INasaEonetClient nasaEonetClient)
        {
            _logger = logger;
            _context = context;
            _nasaEonetClient = nasaEonetClient;
        }

        /// <summary>
        /// Lista todos os eventos EONET armazenados localmente, de forma paginada.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ListarTodosEventosEonetLocalmente(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "data",
            [FromQuery] string sortDirection = "desc")
        {
            _logger.LogInformation("Endpoint GET /api/eonet (listar locais) chamado com pageNumber: {PageNumber}, pageSize: {PageSize}, sortBy: {SortBy}, sortDirection: {SortDirection}",
                pageNumber, pageSize, sortBy, sortDirection);

            IQueryable<EonetEvent> query = _context.EonetEvents.AsNoTracking();

            bool descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
            switch (sortBy.ToLowerInvariant())
            {
                case "eonetidapi":
                    query = descending ? query.OrderByDescending(e => e.EonetIdApi) : query.OrderBy(e => e.EonetIdApi);
                    break;
                case "data":
                default:
                    query = descending ? query.OrderByDescending(e => e.Data) : query.OrderBy(e => e.Data);
                    break;
            }

            var totalCount = await query.CountAsync();
            var items = await query
                              .Skip((pageNumber - 1) * pageSize)
                              .Take(pageSize)
                              .ToListAsync();

            var eventosDto = items.Select(e => new EonetResponseDto
            {
                IdEonet = e.IdEonet,
                EonetIdApi = e.EonetIdApi,
                Data = e.Data, // Agora DateTime?
                Json = e.Json
            }).ToList();

            var pagedResponse = new { Content = eventosDto, TotalElements = totalCount, PageNumber = pageNumber, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) };
            return Ok(pagedResponse);
        }

        /// <summary>
        /// Busca um evento EONET armazenado localmente pelo seu ID interno.
        /// </summary>
        [HttpGet("{idInterno}")]
        [ProducesResponseType(typeof(EonetResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> BuscarEventoLocalPorIdInterno(long idInterno)
        {
            _logger.LogInformation("Endpoint GET /api/eonet/{IdInterno} chamado.", idInterno);
            var evento = await _context.EonetEvents.AsNoTracking().FirstOrDefaultAsync(e => e.IdEonet == idInterno);

            if (evento == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Evento EONET local com ID interno {idInterno} não encontrado." });
            }
            var eventoDto = new EonetResponseDto
            {
                IdEonet = evento.IdEonet,
                EonetIdApi = evento.EonetIdApi,
                Data = evento.Data, // Agora DateTime?
                Json = evento.Json
            };
            return Ok(eventoDto);
        }

        /// <summary>
        /// Busca um evento EONET armazenado localmente pelo ID da API da NASA.
        /// </summary>
        [HttpGet("api-id/{eonetApiId}")]
        [ProducesResponseType(typeof(EonetResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> BuscarEventoLocalPorEonetApiId(string eonetApiId)
        {
            _logger.LogInformation("Endpoint GET /api/eonet/api-id/{EonetApiId} chamado.", eonetApiId);
            var evento = await _context.EonetEvents.AsNoTracking().FirstOrDefaultAsync(e => e.EonetIdApi == eonetApiId);

            if (evento == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Evento EONET local com ID da API {eonetApiId} não encontrado." });
            }
            var eventoDto = new EonetResponseDto
            {
                IdEonet = evento.IdEonet,
                EonetIdApi = evento.EonetIdApi,
                Data = evento.Data, // Agora DateTime?
                Json = evento.Json
            };
            return Ok(eventoDto);
        }

        /// <summary>
        /// Salva manualmente um novo evento EONET no banco de dados local.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(EonetResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SalvarEventoEonetManualmente([FromBody] EonetRequestDto eonetRequestDto)
        {
            _logger.LogInformation("Endpoint POST /api/eonet (salvar manual) chamado para EonetIdApi: {EonetIdApi}", eonetRequestDto.EonetIdApi);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (await _context.EonetEvents.AnyAsync(e => e.EonetIdApi == eonetRequestDto.EonetIdApi))
            {
                return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Requisição inválida", Detail = $"Já existe um evento EONET registrado com o API ID: {eonetRequestDto.EonetIdApi}" });
            }

            var novoEvento = new EonetEvent
            {
                EonetIdApi = eonetRequestDto.EonetIdApi,
                // EonetRequestDto.Data é DateTimeOffset. Convertendo para DateTime (UTC).
                Data = eonetRequestDto.Data.UtcDateTime,
                Json = eonetRequestDto.Json
            };

            _context.EonetEvents.Add(novoEvento);
            await _context.SaveChangesAsync();

            var eventoSalvoDto = new EonetResponseDto
            {
                IdEonet = novoEvento.IdEonet,
                EonetIdApi = novoEvento.EonetIdApi,
                Data = novoEvento.Data, // Agora DateTime?
                Json = novoEvento.Json // Ou "(Conteúdo JSON salvo)" para não retornar o JSON inteiro
            };
            return CreatedAtAction(nameof(BuscarEventoLocalPorIdInterno), new { idInterno = eventoSalvoDto.IdEonet }, eventoSalvoDto);
        }

        /// <summary>
        /// Atualiza manualmente um evento EONET existente no banco de dados local.
        /// </summary>
        [HttpPut("{idInterno}")]
        [ProducesResponseType(typeof(EonetResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AtualizarEventoEonetManualmente(long idInterno, [FromBody] EonetRequestDto eonetRequestDto)
        {
            _logger.LogInformation("Endpoint PUT /api/eonet/{IdInterno} (atualizar manual) chamado.", idInterno);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var eventoExistente = await _context.EonetEvents.FirstOrDefaultAsync(e => e.IdEonet == idInterno);
            if (eventoExistente == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Evento EONET local com ID interno {idInterno} não encontrado." });
            }

            if (eventoExistente.EonetIdApi != eonetRequestDto.EonetIdApi &&
                await _context.EonetEvents.AnyAsync(e => e.EonetIdApi == eonetRequestDto.EonetIdApi && e.IdEonet != idInterno))
            {
                return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Requisição inválida", Detail = $"Já existe outro evento EONET registrado com o API ID: {eonetRequestDto.EonetIdApi}" });
            }

            eventoExistente.EonetIdApi = eonetRequestDto.EonetIdApi;
            // EonetRequestDto.Data é DateTimeOffset. Convertendo para DateTime (UTC).
            eventoExistente.Data = eonetRequestDto.Data.UtcDateTime;
            eventoExistente.Json = eonetRequestDto.Json;

            await _context.SaveChangesAsync();

            var eventoAtualizadoDto = new EonetResponseDto
            {
                IdEonet = eventoExistente.IdEonet,
                EonetIdApi = eventoExistente.EonetIdApi,
                Data = eventoExistente.Data, // Agora DateTime?
                Json = eventoExistente.Json // Ou "(Conteúdo JSON atualizado)"
            };
            return Ok(eventoAtualizadoDto);
        }

        /// <summary>
        /// Deleta um evento EONET do banco de dados local pelo seu ID interno.
        /// </summary>
        [HttpDelete("{idInterno}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeletarEventoEonetLocal(long idInterno)
        {
            _logger.LogInformation("Endpoint DELETE /api/eonet/{IdInterno} chamado.", idInterno);
            var evento = await _context.EonetEvents.FindAsync(idInterno);
            if (evento == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Evento EONET local com ID interno {idInterno} não encontrado." });
            }

            _context.EonetEvents.Remove(evento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Busca eventos EONET armazenados localmente dentro de um intervalo de datas.
        /// </summary>
        [HttpGet("por-data")]
        [ProducesResponseType(typeof(List<EonetResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> BuscarEventosLocaisPorIntervaloDeData(
            [FromQuery, Required] DateTimeOffset dataInicialOffset, // Renomeado para clareza
            [FromQuery, Required] DateTimeOffset dataFinalOffset)   // Renomeado para clareza
        {
            _logger.LogInformation("Endpoint GET /api/eonet/por-data chamado com dataInicialOffset: {DataInicialOffset}, dataFinalOffset: {DataFinalOffset}", dataInicialOffset, dataFinalOffset);

            if (dataInicialOffset > dataFinalOffset)
            {
                return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Requisição inválida", Detail = "Data inicial não pode ser posterior à data final." });
            }

            // Convertendo os parâmetros DateTimeOffset para DateTime UTC para comparação com EonetEvent.Data (DateTime?)
            DateTime dataInicialUtc = dataInicialOffset.UtcDateTime;
            DateTime dataFinalUtc = dataFinalOffset.UtcDateTime;

            var eventos = await _context.EonetEvents
                                    .Where(e => e.Data.HasValue && e.Data.Value >= dataInicialUtc && e.Data.Value <= dataFinalUtc)
                                    .AsNoTracking()
                                    .OrderBy(e => e.Data) // Ou OrderByDescending(e => e.Data) dependendo da necessidade
                                    .ToListAsync();

            var eventosDto = eventos.Select(e => new EonetResponseDto
            {
                IdEonet = e.IdEonet,
                EonetIdApi = e.EonetIdApi,
                Data = e.Data, // Agora DateTime?
                Json = e.Json
            }).ToList();
            return Ok(eventosDto);
        }

        /// <summary>
        /// Busca novos eventos da API da NASA EONET e os persiste/atualiza localmente.
        /// </summary>
        [HttpPost("nasa/sincronizar")]
        [ProducesResponseType(typeof(List<EonetResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SincronizarEventosDaNasa(
            [FromQuery] int? limit,
            [FromQuery] int? days,
            [FromQuery] string? status = "open",
            [FromQuery] string? source = null)
        {
            _logger.LogInformation("Endpoint POST /api/eonet/nasa/sincronizar chamado. Limit: {Limit}, Days: {Days}, Status: {Status}, Source: {Source}", limit, days, status, source);
            NasaEonetApiResponseDto? respostaDaApi;
            try
            {
                respostaDaApi = await _nasaEonetClient.GetEventsAsync(limit, days, status, source);
            }
            catch (ServicoIndisponivelException ex)
            {
                _logger.LogError(ex, "Falha ao comunicar com a API da NASA EONET durante a sincronização.");
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails { Status = 503, Title = "Serviço Externo Indisponível", Detail = ex.Message });
            }

            if (respostaDaApi == null || respostaDaApi.Events == null || !respostaDaApi.Events.Any())
            {
                _logger.LogInformation("Nenhum evento recebido da API da NASA EONET para os parâmetros fornecidos ou resposta vazia.");
                return Ok(new List<EonetResponseDto>());
            }

            List<EonetResponseDto> eventosProcessadosLocalmente = new List<EonetResponseDto>();
            foreach (var eventoDtoDaApi in respostaDaApi.Events)
            {
                if (string.IsNullOrEmpty(eventoDtoDaApi.Id))
                {
                    _logger.LogWarning("Evento da API EONET recebido sem ID, pulando: {Title}", eventoDtoDaApi.Title);
                    continue;
                }

                var eventoLocal = await _context.EonetEvents.FirstOrDefaultAsync(e => e.EonetIdApi == eventoDtoDaApi.Id);
                bool isNew = eventoLocal == null;
                if (isNew)
                {
                    eventoLocal = new EonetEvent { EonetIdApi = eventoDtoDaApi.Id };
                }
                // else { // Opcional: Lógica para atualizar EonetIdApi se necessário, mas geralmente não muda }

                try
                {
                    eventoLocal.Json = JsonSerializer.Serialize(eventoDtoDaApi, new JsonSerializerOptions { WriteIndented = false });
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "Falha ao serializar NasaEonetEventDto para JSON para o evento API ID {ApiId}.", eventoDtoDaApi.Id);
                    eventoLocal.Json = $"{{\"error\":\"Falha ao serializar evento para JSON\", \"originalTitle\":\"{eventoDtoDaApi.Title?.Replace("\"", "\\\"")}\"}}";
                }

                var principalDateOffset = eventoDtoDaApi.Geometry?.FirstOrDefault(g => g != null)?.Date;
                // Converte para DateTime UTC ou usa DateTime.UtcNow se nulo
                eventoLocal.Data = principalDateOffset?.UtcDateTime ?? DateTime.UtcNow;

                if (isNew)
                {
                    _context.EonetEvents.Add(eventoLocal);
                }
                else
                {
                    _context.EonetEvents.Update(eventoLocal);
                }
                await _context.SaveChangesAsync(); // Salva cada evento individualmente para isolar possíveis erros

                eventosProcessadosLocalmente.Add(new EonetResponseDto
                {
                    IdEonet = eventoLocal.IdEonet,
                    EonetIdApi = eventoLocal.EonetIdApi,
                    Data = eventoLocal.Data, // Agora DateTime?
                    Json = "(Conteúdo JSON sincronizado)" // Evita retornar o JSON completo na resposta da sincronização
                });
            }

            _logger.LogInformation("{Count} eventos da NASA EONET processados e salvos/atualizados localmente.", eventosProcessadosLocalmente.Count);
            return Ok(eventosProcessadosLocalmente);
        }

        /// <summary>
        /// Busca eventos diretamente da API EONET da NASA com base em vários filtros.
        /// </summary>
        [HttpGet("nasa/proximos")]
        [ProducesResponseType(typeof(List<NasaEonetEventDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> BuscarEventosDaNasa(
            [FromQuery] double? latitude,
            [FromQuery] double? longitude,
            [FromQuery] double? raioKm,
            [FromQuery] string? startDate, // Formato YYYY-MM-DD
            [FromQuery] string? endDate,   // Formato YYYY-MM-DD
            [FromQuery] int? limit,
            [FromQuery] int? days,
            [FromQuery] string? status,
            [FromQuery] string? source)
        {
            _logger.LogInformation("Endpoint GET /api/eonet/nasa/proximos chamado com Lat: {Lat}, Lon: {Lon}, RaioKm: {Raio}, Start: {Start}, End: {End}, Limit: {Limit}, Days: {Days}, Status: {Status}, Source: {Source}",
                latitude, longitude, raioKm, startDate, endDate, limit, days, status, source);

            string? bbox = null;
            if (latitude.HasValue && longitude.HasValue && raioKm.HasValue && raioKm.Value > 0)
            {
                // A API EONET espera BBOX no formato: minLon,minLat,maxLon,maxLat
                // Implementar a lógica para calcular o BBOX a partir de lat/lon/raioKm é mais complexo.
                // A API EONET v3 não parece suportar lat/lon/radius diretamente.
                // Vamos focar nos outros parâmetros por agora, ou você precisará implementar o cálculo do BBOX.
                _logger.LogInformation("Busca por proximidade (lat/lon/raio) solicitada. A API EONET v3 espera um BBOX. Esta funcionalidade pode precisar de um cálculo de BBOX no backend.");
                // Por simplicidade, não usaremos BBOX nesta chamada de exemplo, a menos que o INasaEonetClient o construa.
            }

            try
            {
                var respostaDaApi = await _nasaEonetClient.GetEventsAsync(limit, days, status, source, bbox, startDate, endDate);
                if (respostaDaApi == null || respostaDaApi.Events == null || !respostaDaApi.Events.Any())
                {
                    _logger.LogInformation("Nenhum evento encontrado na API da NASA para os critérios fornecidos.");
                    return NoContent(); // Retorna 204 se não houver eventos
                }
                return Ok(respostaDaApi.Events);
            }
            catch (ServicoIndisponivelException ex)
            {
                _logger.LogError(ex, "Falha ao comunicar com a API da NASA EONET.");
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails { Status = 503, Title = "Serviço Externo Indisponível", Detail = ex.Message });
            }
        }
    }
}