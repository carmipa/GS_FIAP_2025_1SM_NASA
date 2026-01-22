// File: gsApi/controller/EnderecosController.cs
using gsApi.data;
using gsApi.dto.request;
using gsApi.dto.response;
using gsApi.DTOs.Request;
using gsApi.DTOs.Response;
using gsApi.exceptions;
using gsApi.Exceptions;
using gsApi.model;
using gsApi.services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace gsApi.controller
{
    /// <summary>
    /// Gerencia as operações relacionadas a Endereços, incluindo consulta a serviços externos como ViaCEP e Google Geocoding.
    /// </summary>
    [ApiController]
    [Route("api/enderecos")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class EnderecosController : ControllerBase
    {
        private readonly ILogger<EnderecosController> _logger;
        private readonly AppDbContext _context;
        private readonly IViaCepClient _viaCepClient;
        private readonly IGeoCodingClient _geoCodingClient;

        /// <summary>
        /// Construtor do EnderecosController.
        /// </summary>
        public EnderecosController(
            ILogger<EnderecosController> logger,
            AppDbContext context,
            IViaCepClient viaCepClient,
            IGeoCodingClient geoCodingClient)
        {
            _logger = logger;
            _context = context;
            _viaCepClient = viaCepClient;
            _geoCodingClient = geoCodingClient;
        }

        private EnderecoResponseDto MapEnderecoToResponseDto(Endereco endereco)
        {
            return new EnderecoResponseDto
            {
                IdEndereco = endereco.IdEndereco,
                Cep = endereco.Cep,
                Numero = endereco.Numero,
                Logradouro = endereco.Logradouro,
                Bairro = endereco.Bairro,
                Localidade = endereco.Localidade,
                Uf = endereco.Uf,
                Complemento = endereco.Complemento,
                Latitude = endereco.Latitude,
                Longitude = endereco.Longitude
            };
        }

        /// <summary>
        /// Lista todos os endereços cadastrados de forma paginada.
        /// </summary>
        /// <param name="pageNumber">Número da página (padrão: 1).</param>
        /// <param name="pageSize">Quantidade de itens por página (padrão: 10).</param>
        /// <param name="sortBy">Campo para ordenação (padrão: "cep"). Opções: "localidade", "idEndereco".</param>
        /// <returns>Uma lista paginada de endereços.</returns>
        /// <response code="200">Retorna a lista paginada de endereços.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponse<EnderecoResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ListarTodosEnderecos(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "cep")
        {
            _logger.LogInformation("Endpoint GET /api/enderecos chamado. PageNumber: {PageNumber}, PageSize: {PageSize}, SortBy: {SortBy}", pageNumber, pageSize, sortBy);

            IQueryable<Endereco> query = _context.Enderecos.AsNoTracking();

            switch (sortBy.ToLowerInvariant())
            {
                case "localidade":
                    query = query.OrderBy(e => e.Localidade);
                    break;
                case "idendereco":
                    query = query.OrderBy(e => e.IdEndereco);
                    break;
                case "cep":
                default:
                    query = query.OrderBy(e => e.Cep);
                    break;
            }

            var totalCount = await query.CountAsync();
            var items = await query
                              .Skip((pageNumber - 1) * pageSize)
                              .Take(pageSize)
                              .ToListAsync();

            var enderecosDto = items.Select(MapEnderecoToResponseDto).ToList();
            var pagedResponse = new PaginatedResponse<EnderecoResponseDto>(enderecosDto, totalCount, pageNumber, pageSize);
            return Ok(pagedResponse);
        }

        /// <summary>
        /// Busca um endereço específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do endereço a ser buscado.</param>
        /// <returns>O endereço encontrado.</returns>
        /// <response code="200">Retorna o endereço encontrado.</response>
        /// <response code="404">Se o endereço com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(EnderecoResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BuscarEnderecoPorId(long id)
        {
            _logger.LogInformation("Endpoint GET /api/enderecos/{Id} chamado.", id);
            var endereco = await _context.Enderecos.AsNoTracking().FirstOrDefaultAsync(e => e.IdEndereco == id);

            if (endereco == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Endereço com ID {id} não encontrado." });
            }
            return Ok(MapEnderecoToResponseDto(endereco));
        }

        /// <summary>
        /// Consulta dados de um endereço a partir de um CEP utilizando o serviço ViaCEP.
        /// </summary>
        /// <param name="cep">O CEP a ser consultado (deve estar no formato XXXXXXXX ou XXXXX-XXX).</param>
        /// <returns>Os dados do endereço correspondente ao CEP, se encontrado.</returns>
        /// <response code="200">Dados do CEP encontrados e retornados com sucesso.</response>
        /// <response code="400">Se o formato do CEP fornecido for inválido (conforme validação do [RegularExpression]).</response>
        /// <response code="404">Se o CEP não for encontrado no serviço ViaCEP ou se for considerado inválido pelo serviço.</response>
        /// <response code="503">Se o serviço ViaCEP estiver indisponível ou ocorrer um erro na comunicação.</response>
        [HttpGet("consultar-cep/{cep}")]
        [ProducesResponseType(typeof(ViaCepResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> ConsultarCep(
            [FromRoute][RegularExpression(@"^\d{5}-?\d{3}$", ErrorMessage = "O formato do CEP é inválido. Use XXXXXXXX ou XXXXX-XXX.")] string cep)
        {
            _logger.LogInformation("ENDERECOS_CONTROLLER: Endpoint GET /api/enderecos/consultar-cep/{Cep} chamado.", cep);

            try
            {
                var enderecoViaCep = await _viaCepClient.GetEnderecoByCepAsync(cep);

                if (enderecoViaCep == null)
                {
                    _logger.LogWarning("ENDERECOS_CONTROLLER: Consulta ao ViaCEP para o CEP '{Cep}' não retornou dados ou CEP não encontrado pelo ViaCepClient.", cep);
                    return NotFound(new ProblemDetails
                    {
                        Status = StatusCodes.Status404NotFound,
                        Title = "CEP não encontrado",
                        Detail = $"O CEP '{cep}' não foi encontrado ou é inválido."
                    });
                }

                _logger.LogInformation("ENDERECOS_CONTROLLER: Dados do CEP '{Cep}' obtidos com sucesso.", cep);
                return Ok(enderecoViaCep);
            }
            catch (ServicoIndisponivelException ex)
            {
                _logger.LogError(ex, "ENDERECOS_CONTROLLER: ServicoIndisponivelException ao consultar CEP '{Cep}'. Mensagem: {ExceptionMessage}", cep, ex.Message);
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails
                {
                    Status = StatusCodes.Status503ServiceUnavailable,
                    Title = "Serviço ViaCEP indisponível",
                    Detail = ex.Message
                });
            }
        }

        /// <summary>
        /// Calcula as coordenadas geográficas (latitude e longitude) para um endereço.
        /// </summary>
        /// <param name="enderecoGeoRequestDto">Dados do endereço para geocodificação (Logradouro, Cidade, UF são obrigatórios).</param>
        /// <returns>As coordenadas geográficas calculadas.</returns>
        /// <response code="200">Coordenadas calculadas com sucesso.</response>
        /// <response code="400">Se os dados de entrada para geocodificação forem inválidos.</response>
        /// <response code="404">Se não for possível encontrar coordenadas para o endereço fornecido.</response>
        /// <response code="500">Se ocorrer um erro de configuração interna (ex: API Key do Google não configurada).</response>
        /// <response code="503">Se o serviço de geocodificação estiver indisponível.</response>
        [HttpPost("calcular-coordenadas")]
        [ProducesResponseType(typeof(GeoCoordinatesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> CalcularCoordenadas([FromBody] EnderecoGeoRequestDto enderecoGeoRequestDto)
        {
            _logger.LogInformation("Endpoint POST /api/enderecos/calcular-coordenadas chamado para: {Logradouro}, {Cidade}, {UF}",
                enderecoGeoRequestDto.Logradouro, enderecoGeoRequestDto.Cidade, enderecoGeoRequestDto.Uf);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }
            try
            {
                var coordenadas = await _geoCodingClient.GetCoordinatesFromAddressAsync(enderecoGeoRequestDto);
                if (coordenadas == null)
                {
                    return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Coordenadas não encontradas", Detail = "Não foi possível encontrar coordenadas para o endereço fornecido." });
                }
                return Ok(coordenadas);
            }
            catch (ServicoIndisponivelException ex)
            {
                _logger.LogError(ex, "Erro ao calcular coordenadas para o endereço: {Logradouro}, {Cidade}", enderecoGeoRequestDto.Logradouro, enderecoGeoRequestDto.Cidade);
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails { Status = StatusCodes.Status503ServiceUnavailable, Title = "Serviço de Geocodificação indisponível", Detail = ex.Message });
            }
            catch (InvalidOperationException ex) // Captura específica para API Key não configurada no GeoCodingClient
            {
                _logger.LogError(ex, "Erro de configuração ao calcular coordenadas (API Key ausente?): {Message}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Status = StatusCodes.Status500InternalServerError, Title = "Erro de configuração interna", Detail = "Não foi possível calcular as coordenadas devido a um erro de configuração do serviço de geocodificação." });
            }
        }

        /// <summary>
        /// Cria um novo endereço. Requer que latitude e longitude sejam fornecidas.
        /// </summary>
        /// <param name="enderecoRequestDto">Os dados do endereço a ser criado.</param>
        /// <returns>O endereço recém-criado.</returns>
        /// <response code="201">Retorna o endereço recém-criado com a localização do recurso.</response>
        /// <response code="400">Se os dados da requisição forem inválidos.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(EnderecoResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CriarEndereco([FromBody] EnderecoRequestDto enderecoRequestDto)
        {
            _logger.LogInformation("Endpoint POST /api/enderecos chamado para criar endereço com CEP: {Cep}", enderecoRequestDto.Cep);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var novoEndereco = new Endereco
            {
                Cep = new string(enderecoRequestDto.Cep.Where(char.IsDigit).ToArray()),
                Numero = enderecoRequestDto.Numero,
                Logradouro = enderecoRequestDto.Logradouro,
                Bairro = enderecoRequestDto.Bairro,
                Localidade = enderecoRequestDto.Localidade,
                Uf = enderecoRequestDto.Uf.ToUpper(),
                Complemento = enderecoRequestDto.Complemento,
                Latitude = enderecoRequestDto.Latitude,
                Longitude = enderecoRequestDto.Longitude
            };

            _context.Enderecos.Add(novoEndereco);
            await _context.SaveChangesAsync();

            var enderecoSalvoDto = MapEnderecoToResponseDto(novoEndereco);
            return CreatedAtAction(nameof(BuscarEnderecoPorId), new { id = enderecoSalvoDto.IdEndereco }, enderecoSalvoDto);
        }

        /// <summary>
        /// Atualiza um endereço existente.
        /// </summary>
        /// <param name="id">O ID do endereço a ser atualizado.</param>
        /// <param name="enderecoRequestDto">Os novos dados para o endereço.</param>
        /// <returns>O endereço atualizado.</returns>
        /// <response code="200">Retorna o endereço atualizado.</response>
        /// <response code="400">Se os dados da requisição forem inválidos.</response>
        /// <response code="404">Se o endereço com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(EnderecoResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AtualizarEndereco(long id, [FromBody] EnderecoRequestDto enderecoRequestDto)
        {
            _logger.LogInformation("Endpoint PUT /api/enderecos/{Id} chamado.", id);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var enderecoExistente = await _context.Enderecos.FirstOrDefaultAsync(e => e.IdEndereco == id);
            if (enderecoExistente == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Endereço com ID {id} não encontrado." });
            }

            enderecoExistente.Cep = new string(enderecoRequestDto.Cep.Where(char.IsDigit).ToArray());
            enderecoExistente.Numero = enderecoRequestDto.Numero;
            enderecoExistente.Logradouro = enderecoRequestDto.Logradouro;
            enderecoExistente.Bairro = enderecoRequestDto.Bairro;
            enderecoExistente.Localidade = enderecoRequestDto.Localidade;
            enderecoExistente.Uf = enderecoRequestDto.Uf.ToUpper();
            enderecoExistente.Complemento = enderecoRequestDto.Complemento;
            enderecoExistente.Latitude = enderecoRequestDto.Latitude;
            enderecoExistente.Longitude = enderecoRequestDto.Longitude;

            await _context.SaveChangesAsync();
            return Ok(MapEnderecoToResponseDto(enderecoExistente));
        }

        /// <summary>
        /// Deleta um endereço pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do endereço a ser deletado.</param>
        /// <response code="204">Endereço deletado com sucesso.</response>
        /// <response code="404">Se o endereço com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor (ex: violação de chave estrangeira se o endereço estiver em uso).</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletarEndereco(long id)
        {
            _logger.LogInformation("Endpoint DELETE /api/enderecos/{Id} chamado.", id);
            var endereco = await _context.Enderecos.FindAsync(id);
            if (endereco == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Endereço com ID {id} não encontrado." });
            }

            _context.Enderecos.Remove(endereco);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}