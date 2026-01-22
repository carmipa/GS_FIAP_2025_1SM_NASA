// File: gsApi/controller/ClientesController.cs
using gsApi.data;
using gsApi.dto.request;
using gsApi.dto.response; // Padronizado
using gsApi.DTOs.Response;
using gsApi.model;
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
    /// Gerencia as operações relacionadas a Clientes (Usuários do sistema).
    /// Permite criar, listar, buscar, atualizar e deletar clientes,
    /// bem como gerenciar seus contatos e endereços associados.
    /// </summary>
    [ApiController]
    [Route("api/clientes")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class ClientesController : ControllerBase
    {
        private readonly ILogger<ClientesController> _logger;
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor do ClientesController.
        /// </summary>
        /// <param name="logger">Instância do logger para este controller.</param>
        /// <param name="context">Instância do AppDbContext para acesso ao banco de dados.</param>
        public ClientesController(ILogger<ClientesController> logger, AppDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        // Método auxiliar centralizado para mapear Cliente para ClienteResponseDto
        private ClienteResponseDto MapClienteToResponseDto(Cliente cliente)
        {
            if (cliente == null)
            {
                _logger.LogError("Tentativa de mapear um objeto Cliente nulo para ClienteResponseDto.");
                // Em um cenário real, isso não deveria acontecer se o cliente foi buscado corretamente.
                // Lançar exceção ou retornar um DTO com erro pode ser considerado.
                // Por simplicidade, vamos assumir que o chamador garantiu que cliente não é nulo.
                // No entanto, para segurança, vamos lançar ArgumentNullException.
                throw new ArgumentNullException(nameof(cliente), "Objeto Cliente fornecido para mapeamento é nulo.");
            }

            return new ClienteResponseDto
            {
                IdCliente = cliente.IdCliente,
                Nome = cliente.Nome,
                Sobrenome = cliente.Sobrenome,
                DataNascimento = cliente.DataNascimento,
                Documento = cliente.Documento,
                Contatos = cliente.Contatos?.Select(con => new ContatoResponseDto
                {
                    IdContato = con.IdContato,
                    Ddd = con.Ddd,
                    Telefone = con.Telefone,
                    Celular = con.Celular,
                    Whatsapp = con.Whatsapp,
                    Email = con.Email,
                    TipoContato = con.TipoContato
                }).ToList() ?? new List<ContatoResponseDto>(),
                Enderecos = cliente.Enderecos?.Select(end => new EnderecoResponseDto
                {
                    IdEndereco = end.IdEndereco,
                    Cep = end.Cep,
                    Numero = end.Numero,
                    Logradouro = end.Logradouro,
                    Bairro = end.Bairro,
                    Localidade = end.Localidade,
                    Uf = end.Uf,
                    Complemento = end.Complemento, // Complemento é 'required string' no modelo Endereco
                    Latitude = end.Latitude,
                    Longitude = end.Longitude
                }).ToList() ?? new List<EnderecoResponseDto>()
            };
        }

        /// <summary>
        /// Lista todos os clientes de forma paginada e ordenada.
        /// </summary>
        /// <param name="pageNumber">Número da página desejada (padrão: 1).</param>
        /// <param name="pageSize">Quantidade de clientes por página (padrão: 10).</param>
        /// <param name="sortBy">Campo pelo qual os clientes serão ordenados (padrão: "nome"). Outras opções: "documento", "idCliente".</param>
        /// <returns>Uma lista paginada de clientes.</returns>
        /// <response code="200">Retorna a lista paginada de clientes.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor durante a consulta.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponse<ClienteResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ListarTodosClientes(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "nome")
        {
            _logger.LogInformation("Endpoint GET /api/clientes chamado com pageNumber: {PageNumber}, pageSize: {PageSize}, sortBy: {SortBy}", pageNumber, pageSize, sortBy);

            IQueryable<Cliente> query = _context.Clientes
                                              .Include(c => c.Contatos)
                                              .Include(c => c.Enderecos)
                                              .AsNoTracking();

            switch (sortBy.ToLowerInvariant())
            {
                case "documento":
                    query = query.OrderBy(c => c.Documento);
                    break;
                case "idcliente":
                    query = query.OrderBy(c => c.IdCliente);
                    break;
                case "nome":
                default:
                    query = query.OrderBy(c => c.Nome).ThenBy(c => c.Sobrenome);
                    break;
            }

            var totalCount = await query.CountAsync();
            var clientes = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var clientesDto = clientes.Select(MapClienteToResponseDto).ToList();

            var pagedResponse = new PaginatedResponse<ClienteResponseDto>(
                clientesDto,
                totalCount,
                pageNumber,
                pageSize
            );
            return Ok(pagedResponse);
        }

        /// <summary>
        /// Busca um cliente específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do cliente a ser buscado.</param>
        /// <returns>O cliente encontrado.</returns>
        /// <response code="200">Retorna o cliente encontrado.</response>
        /// <response code="404">Se o cliente com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ClienteResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BuscarClientePorId(long id)
        {
            _logger.LogInformation("Endpoint GET /api/clientes/{Id} chamado.", id);
            var cliente = await _context.Clientes
                                      .Include(c => c.Contatos)
                                      .Include(c => c.Enderecos)
                                      .AsNoTracking()
                                      .FirstOrDefaultAsync(c => c.IdCliente == id);

            if (cliente == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Cliente com ID {id} não encontrado." });
            }
            return Ok(MapClienteToResponseDto(cliente));
        }

        /// <summary>
        /// Busca as coordenadas principais (latitude e longitude) de um cliente.
        /// </summary>
        /// <param name="id">O ID do cliente.</param>
        /// <returns>As coordenadas do endereço principal do cliente.</returns>
        /// <response code="200">Retorna as coordenadas encontradas.</response>
        /// <response code="404">Se o cliente ou um endereço com coordenadas válidas não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet("{id}/coordenadas-principais")]
        [ProducesResponseType(typeof(GeoCoordinatesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCoordenadasPrincipaisDoCliente(long id)
        {
            _logger.LogInformation("Buscando coordenadas principais para Cliente ID: {Id}", id);

            var cliente = await _context.Clientes
                                      .Include(c => c.Enderecos)
                                      .AsNoTracking()
                                      .FirstOrDefaultAsync(c => c.IdCliente == id);

            if (cliente == null)
            {
                _logger.LogWarning("Cliente com ID {Id} não encontrado ao buscar coordenadas.", id);
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Usuário não encontrado",
                    Detail = $"Nenhum cliente encontrado com o ID: {id}."
                });
            }

            var enderecoPrincipal = cliente.Enderecos?.FirstOrDefault(e => e.Latitude != 0 || e.Longitude != 0);

            if (enderecoPrincipal == null)
            {
                _logger.LogWarning("Cliente ID {Id} encontrado, mas não possui endereço com coordenadas válidas.", id);
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Coordenadas não encontradas",
                    Detail = $"O cliente com ID {id} não possui um endereço com coordenadas válidas cadastradas."
                });
            }

            var coordenadasDto = new GeoCoordinatesDto
            {
                Latitude = enderecoPrincipal.Latitude,
                Longitude = enderecoPrincipal.Longitude,
                MatchedAddress = $"{enderecoPrincipal.Logradouro}, {enderecoPrincipal.Numero} - {enderecoPrincipal.Bairro}, {enderecoPrincipal.Localidade} - {enderecoPrincipal.Uf}"
            };

            return Ok(coordenadasDto);
        }


        /// <summary>
        /// Busca um cliente pelo seu Documento (CPF/CNPJ).
        /// </summary>
        /// <param name="documento">O número do documento do cliente (CPF ou CNPJ).</param>
        /// <returns>O cliente encontrado.</returns>
        /// <response code="200">Retorna o cliente encontrado.</response>
        /// <response code="404">Se o cliente com o documento especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet("documento/{documento}")]
        [ProducesResponseType(typeof(ClienteResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BuscarClientePorDocumento(string documento)
        {
            _logger.LogInformation("Endpoint GET /api/clientes/documento/{Documento} chamado.", documento);
            var cliente = await _context.Clientes
                                      .Include(c => c.Contatos)
                                      .Include(c => c.Enderecos)
                                      .AsNoTracking()
                                      .FirstOrDefaultAsync(c => c.Documento == documento);

            if (cliente == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Cliente com documento {documento} não encontrado." });
            }
            return Ok(MapClienteToResponseDto(cliente));
        }

        /// <summary>
        /// Cria um novo cliente.
        /// </summary>
        /// <param name="clienteRequestDto">Os dados do cliente a ser criado. Contatos e Endereços podem ser associados via seus IDs.</param>
        /// <returns>O cliente recém-criado.</returns>
        /// <response code="201">Retorna o cliente recém-criado com a localização do recurso.</response>
        /// <response code="400">Se os dados da requisição forem inválidos (ex: documento duplicado, IDs de contato/endereço inválidos).</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(ClienteResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CriarCliente([FromBody] ClienteRequestDto clienteRequestDto)
        {
            _logger.LogInformation("Endpoint POST /api/clientes chamado para criar cliente com documento: {Documento}", clienteRequestDto.Documento);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var existingClienteComDocumento = await _context.Clientes
                                                        .AsNoTracking()
                                                        .FirstOrDefaultAsync(c => c.Documento == clienteRequestDto.Documento);
            if (existingClienteComDocumento != null)
            {
                return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Documento já cadastrado", Detail = $"Já existe um cliente cadastrado com o documento: {clienteRequestDto.Documento}" });
            }

            var novoCliente = new Cliente
            {
                Nome = clienteRequestDto.Nome,
                Sobrenome = clienteRequestDto.Sobrenome,
                DataNascimento = clienteRequestDto.DataNascimento,
                Documento = clienteRequestDto.Documento
                // Contatos e Enderecos são inicializados como new List<T>() no modelo.
            };

            if (clienteRequestDto.ContatosIds != null && clienteRequestDto.ContatosIds.Any())
            {
                var contatosParaAdicionar = await _context.Contatos.Where(con => clienteRequestDto.ContatosIds.Contains(con.IdContato)).ToListAsync();
                if (contatosParaAdicionar.Count != clienteRequestDto.ContatosIds.Distinct().Count())
                {
                    return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Dados inválidos", Detail = "Um ou mais IDs de Contato fornecidos não são válidos ou estão duplicados." });
                }
                novoCliente.Contatos = contatosParaAdicionar;
            }

            if (clienteRequestDto.EnderecosIds != null && clienteRequestDto.EnderecosIds.Any())
            {
                var enderecosParaAdicionar = await _context.Enderecos.Where(end => clienteRequestDto.EnderecosIds.Contains(end.IdEndereco)).ToListAsync();
                if (enderecosParaAdicionar.Count != clienteRequestDto.EnderecosIds.Distinct().Count())
                {
                    return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Dados inválidos", Detail = "Um ou mais IDs de Endereço fornecidos não são válidos ou estão duplicados." });
                }
                novoCliente.Enderecos = enderecosParaAdicionar;
            }

            _context.Clientes.Add(novoCliente);
            await _context.SaveChangesAsync();

            // Recarregar o cliente com os includes para garantir que os DTOs de resposta sejam populados corretamente
            var clienteSalvoComIncludes = await _context.Clientes
                                                  .Include(c => c.Contatos)
                                                  .Include(c => c.Enderecos)
                                                  .FirstAsync(c => c.IdCliente == novoCliente.IdCliente);

            var clienteSalvoDto = MapClienteToResponseDto(clienteSalvoComIncludes);
            return CreatedAtAction(nameof(BuscarClientePorId), new { id = clienteSalvoDto.IdCliente }, clienteSalvoDto);
        }

        /// <summary>
        /// Atualiza um cliente existente.
        /// </summary>
        /// <param name="id">O ID do cliente a ser atualizado.</param>
        /// <param name="clienteRequestDto">Os novos dados para o cliente. Contatos e Endereços podem ser associados/desassociados via seus IDs.</param>
        /// <returns>O cliente atualizado.</returns>
        /// <response code="200">Retorna o cliente atualizado.</response>
        /// <response code="400">Se os dados da requisição forem inválidos (ex: documento duplicado para outro cliente, IDs de contato/endereço inválidos).</response>
        /// <response code="404">Se o cliente com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ClienteResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AtualizarCliente(long id, [FromBody] ClienteRequestDto clienteRequestDto)
        {
            _logger.LogInformation("Endpoint PUT /api/clientes/{Id} chamado.", id);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var clienteExistente = await _context.Clientes
                                             .Include(c => c.Contatos)
                                             .Include(c => c.Enderecos)
                                             .FirstOrDefaultAsync(c => c.IdCliente == id);

            if (clienteExistente == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Cliente com ID {id} não encontrado." });
            }

            if (clienteExistente.Documento != clienteRequestDto.Documento)
            {
                var outroClienteComMesmoDocumento = await _context.Clientes
                                                                .AsNoTracking()
                                                                .FirstOrDefaultAsync(c => c.Documento == clienteRequestDto.Documento && c.IdCliente != id);
                if (outroClienteComMesmoDocumento != null)
                {
                    return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Documento já cadastrado", Detail = $"Já existe outro cliente cadastrado com o documento: {clienteRequestDto.Documento}" });
                }
            }

            clienteExistente.Nome = clienteRequestDto.Nome;
            clienteExistente.Sobrenome = clienteRequestDto.Sobrenome;
            clienteExistente.DataNascimento = clienteRequestDto.DataNascimento;
            clienteExistente.Documento = clienteRequestDto.Documento;

            // Atualizar Contatos
            clienteExistente.Contatos.Clear(); // Remove associações antigas
            if (clienteRequestDto.ContatosIds != null && clienteRequestDto.ContatosIds.Any())
            {
                var contatosParaAtualizar = await _context.Contatos.Where(con => clienteRequestDto.ContatosIds.Contains(con.IdContato)).ToListAsync();
                if (contatosParaAtualizar.Count != clienteRequestDto.ContatosIds.Distinct().Count())
                {
                    return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Dados inválidos", Detail = "Um ou mais IDs de Contato fornecidos para atualização não são válidos ou estão duplicados." });
                }
                foreach (var contato in contatosParaAtualizar)
                {
                    clienteExistente.Contatos.Add(contato);
                }
            }

            // Atualizar Endereços
            clienteExistente.Enderecos.Clear(); // Remove associações antigas
            if (clienteRequestDto.EnderecosIds != null && clienteRequestDto.EnderecosIds.Any())
            {
                var enderecosParaAtualizar = await _context.Enderecos.Where(end => clienteRequestDto.EnderecosIds.Contains(end.IdEndereco)).ToListAsync();
                if (enderecosParaAtualizar.Count != clienteRequestDto.EnderecosIds.Distinct().Count())
                {
                    return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Dados inválidos", Detail = "Um ou mais IDs de Endereço fornecidos para atualização não são válidos ou estão duplicados." });
                }
                foreach (var endereco in enderecosParaAtualizar)
                {
                    clienteExistente.Enderecos.Add(endereco);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(MapClienteToResponseDto(clienteExistente));
        }

        /// <summary>
        /// Deleta um cliente pelo seu ID, incluindo a remoção de suas associações 
        /// com contatos e endereços nas tabelas de junção.
        /// </summary>
        /// <param name="id">O ID do cliente a ser deletado.</param>
        /// <response code="204">Cliente e suas associações diretas (em tabelas de junção) deletados com sucesso.</response>
        /// <response code="404">Se o cliente com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor durante o processo de deleção.</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeletarCliente(long id)
        {
            _logger.LogInformation("Endpoint DELETE /api/clientes/{Id} chamado para deletar cliente e suas associações.", id);

            // Passo 1: Carregar o cliente E suas coleções de Contatos e Enderecos.
            // Isso é crucial para que o EF Core saiba quais registros nas tabelas de junção precisam ser removidos.
            var cliente = await _context.Clientes
                                      .Include(c => c.Contatos)    // Carrega os contatos associados
                                      .Include(c => c.Enderecos)  // Carrega os endereços associados
                                      .FirstOrDefaultAsync(c => c.IdCliente == id);

            if (cliente == null)
            {
                _logger.LogWarning("Cliente com ID {Id} não encontrado para deleção.", id);
                return NotFound(new ProblemDetails { Status = 404, Title = "Recurso não encontrado", Detail = $"Cliente com ID {id} não encontrado." });
            }

            try
            {
                // Passo 2: Limpar as coleções (desassociar)
                // Isso sinaliza ao EF Core para remover as entradas correspondentes das tabelas de junção.
                // Os objetos Contato e Endereco em si NÃO são deletados, apenas a associação com este Cliente.
                cliente.Contatos.Clear();
                cliente.Enderecos.Clear();

                // Passo 3: Salvar as mudanças da desassociação (opcional, mas pode ser feito separadamente para clareza)
                // Se você não salvar aqui, o EF Core tentará fazer tudo em uma transação no próximo SaveChangesAsync.
                // await _context.SaveChangesAsync(); // Descomente se quiser salvar a desassociação separadamente.

                // Passo 4: Remover a entidade Cliente principal
                _context.Clientes.Remove(cliente);

                // Passo 5: Salvar as mudanças finais (remoção do cliente e das entradas nas tabelas de junção)
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cliente com ID {Id} e suas associações foram removidos com sucesso.", id);
                return NoContent();
            }
            catch (DbUpdateException ex) // Captura exceções de atualização do banco
            {
                // Log detalhado do erro, incluindo a inner exception que geralmente tem a mensagem do Oracle
                _logger.LogError(ex, "Erro de atualização do banco ao deletar cliente ID {Id}. Detalhes: {ErrorMessage}", id, ex.InnerException?.Message ?? ex.Message);

                // Retorna um erro 500 genérico, pois o TratadorGlobalExcecoesMiddleware também pegaria,
                // mas aqui podemos ser um pouco mais específicos se quisermos.
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Erro ao deletar cliente",
                    Detail = "Ocorreu um erro ao tentar deletar o cliente e/ou suas associações. " +
                             "Verifique se ele não possui outras dependências não resolvidas no banco de dados. " +
                             "Detalhe do erro original: " + (ex.InnerException?.Message ?? ex.Message)
                });
            }
        }

        /// <summary>
        /// Pesquisa clientes por nome, sobrenome ou documento.
        /// </summary>
        /// <param name="termo">Termo para buscar no nome, sobrenome ou documento do cliente.</param>
        /// <param name="pageNumber">Número da página (padrão: 1).</param>
        /// <param name="pageSize">Quantidade de clientes por página (padrão: 10).</param>
        /// <param name="sortBy">Campo pelo qual os clientes serão ordenados (padrão: "nome").</param>
        /// <returns>Uma lista paginada de clientes que correspondem ao termo de pesquisa.</returns>
        /// <response code="200">Retorna a lista paginada de clientes encontrados.</response>
        /// <response code="400">Se o termo de pesquisa for nulo ou vazio.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet("pesquisar")]
        [ProducesResponseType(typeof(PaginatedResponse<ClienteResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PesquisarClientes(
            [FromQuery, Required(ErrorMessage = "O termo de pesquisa é obrigatório.")] string termo,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "nome")
        {
            _logger.LogInformation("Endpoint GET /api/clientes/pesquisar chamado com termo: {Termo}, pageNumber: {PageNumber}, pageSize: {PageSize}, sortBy: {SortBy}", termo, pageNumber, pageSize, sortBy);

            if (string.IsNullOrWhiteSpace(termo)) // Validação extra, embora [Required] já atue.
            {
                return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Termo de pesquisa inválido", Detail = "O termo de pesquisa não pode ser vazio." });
            }

            IQueryable<Cliente> query = _context.Clientes
                                .Include(c => c.Contatos)
                                .Include(c => c.Enderecos)
                                .Where(c => EF.Functions.Like(c.Nome, $"%{termo}%") ||
                                            EF.Functions.Like(c.Sobrenome, $"%{termo}%") ||
                                            EF.Functions.Like(c.Documento, $"%{termo}%"))
                                .AsNoTracking();

            switch (sortBy.ToLowerInvariant())
            {
                case "documento":
                    query = query.OrderBy(c => c.Documento);
                    break;
                case "idcliente":
                    query = query.OrderBy(c => c.IdCliente);
                    break;
                case "nome":
                default:
                    query = query.OrderBy(c => c.Nome).ThenBy(c => c.Sobrenome);
                    break;
            }

            var totalCount = await query.CountAsync();
            var clientes = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            var clientesDto = clientes.Select(MapClienteToResponseDto).ToList();

            var pagedResponse = new PaginatedResponse<ClienteResponseDto>(
                clientesDto,
                totalCount,
                pageNumber,
                pageSize
            );
            return Ok(pagedResponse);
        }
    }

    // DTO auxiliar para respostas paginadas (pode ser movido para um arquivo separado em dto/response)
    public class PaginatedResponse<T>
    {
        public List<T> Content { get; set; }
        public long TotalElements { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }

        public PaginatedResponse(List<T> content, long totalElements, int pageNumber, int pageSize)
        {
            Content = content;
            TotalElements = totalElements;
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling(totalElements / (double)pageSize);
        }
    }
}