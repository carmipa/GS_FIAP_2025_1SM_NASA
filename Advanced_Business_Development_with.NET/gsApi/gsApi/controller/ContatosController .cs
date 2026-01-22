// File: gsApi/controller/ContatosController.cs
using gsApi.data;
using gsApi.dto.request;
using gsApi.dto.response;
using gsApi.DTOs.Request;
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
    /// Gerencia as operações CRUD para Contatos de usuários.
    /// Permite criar, listar, buscar, atualizar e deletar contatos.
    /// </summary>
    [ApiController]
    [Route("api/contatos")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class ContatosController : ControllerBase
    {
        private readonly ILogger<ContatosController> _logger;
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor do ContatosController.
        /// </summary>
        /// <param name="logger">Instância do logger para este controller.</param>
        /// <param name="context">Instância do AppDbContext para acesso ao banco de dados.</param>
        public ContatosController(ILogger<ContatosController> logger, AppDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        // Método auxiliar para mapear Contato para ContatoResponseDto
        private ContatoResponseDto MapContatoToResponseDto(Contato contato)
        {
            return new ContatoResponseDto
            {
                IdContato = contato.IdContato,
                Ddd = contato.Ddd,
                Telefone = contato.Telefone,
                Celular = contato.Celular,
                Whatsapp = contato.Whatsapp,
                Email = contato.Email,
                TipoContato = contato.TipoContato
            };
        }

        /// <summary>
        /// Lista todos os contatos de forma paginada e ordenada.
        /// </summary>
        /// <param name="pageNumber">Número da página desejada (padrão: 1).</param>
        /// <param name="pageSize">Quantidade de contatos por página (padrão: 10).</param>
        /// <param name="sortBy">Campo pelo qual os contatos serão ordenados (padrão: "email"). Outra opção: "idContato".</param>
        /// <returns>Uma lista paginada de contatos.</returns>
        /// <response code="200">Retorna a lista paginada de contatos.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor durante a consulta.</response>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponse<ContatoResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ListarTodosContatos(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "email")
        {
            _logger.LogInformation("Endpoint GET /api/contatos chamado com pageNumber: {PageNumber}, pageSize: {PageSize}, sortBy: {SortBy}", pageNumber, pageSize, sortBy);

            IQueryable<Contato> query = _context.Contatos.AsNoTracking();

            switch (sortBy.ToLowerInvariant())
            {
                case "idcontato":
                    query = query.OrderBy(c => c.IdContato);
                    break;
                case "email":
                default:
                    query = query.OrderBy(c => c.Email);
                    break;
            }

            var totalCount = await query.CountAsync();
            var items = await query
                              .Skip((pageNumber - 1) * pageSize)
                              .Take(pageSize)
                              .ToListAsync();

            var contatosDto = items.Select(MapContatoToResponseDto).ToList();

            var pagedResponse = new PaginatedResponse<ContatoResponseDto>(
                contatosDto,
                totalCount,
                pageNumber,
                pageSize
            );
            return Ok(pagedResponse);
        }

        /// <summary>
        /// Busca um contato específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do contato a ser buscado.</param>
        /// <returns>O contato encontrado.</returns>
        /// <response code="200">Retorna o contato encontrado.</response>
        /// <response code="404">Se o contato com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ContatoResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BuscarContatoPorId(long id)
        {
            _logger.LogInformation("Endpoint GET /api/contatos/{Id} chamado.", id);
            var contato = await _context.Contatos.AsNoTracking().FirstOrDefaultAsync(c => c.IdContato == id);

            if (contato == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Contato com ID {id} não encontrado." });
            }
            return Ok(MapContatoToResponseDto(contato));
        }

        /// <summary>
        /// Busca um contato pelo seu endereço de e-mail.
        /// </summary>
        /// <param name="email">O endereço de e-mail do contato a ser buscado.</param>
        /// <returns>O contato encontrado.</returns>
        /// <response code="200">Retorna o contato encontrado.</response>
        /// <response code="404">Se o contato com o e-mail especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpGet("email/{email}")]
        [ProducesResponseType(typeof(ContatoResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BuscarContatoPorEmail(string email)
        {
            _logger.LogInformation("Endpoint GET /api/contatos/email/{Email} chamado.", email);
            var contato = await _context.Contatos.AsNoTracking().FirstOrDefaultAsync(c => c.Email == email);

            if (contato == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Contato com email {email} não encontrado." });
            }
            return Ok(MapContatoToResponseDto(contato));
        }

        /// <summary>
        /// Cria um novo contato.
        /// </summary>
        /// <param name="contatoRequestDto">Os dados do contato a ser criado.</param>
        /// <returns>O contato recém-criado.</returns>
        /// <response code="201">Retorna o contato recém-criado com a localização do recurso.</response>
        /// <response code="400">Se os dados da requisição forem inválidos (ex: e-mail duplicado).</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(ContatoResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)] // Para erros de validação do DTO
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)] // Para erro de e-mail duplicado
        public async Task<IActionResult> CriarContato([FromBody] ContatoRequestDto contatoRequestDto)
        {
            _logger.LogInformation("Endpoint POST /api/contatos chamado para criar contato com email: {Email}", contatoRequestDto.Email);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var existingContactComEmail = await _context.Contatos
                                                .AsNoTracking()
                                                .FirstOrDefaultAsync(c => c.Email == contatoRequestDto.Email);
            if (existingContactComEmail != null)
            {
                _logger.LogWarning("Tentativa de criar contato com e-mail já existente: {Email}", contatoRequestDto.Email);
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "E-mail já cadastrado",
                    Detail = $"Já existe um contato cadastrado com o e-mail: {contatoRequestDto.Email}"
                });
            }

            var novoContato = new Contato
            {
                Ddd = contatoRequestDto.Ddd,
                Telefone = contatoRequestDto.Telefone,
                Celular = contatoRequestDto.Celular,
                Whatsapp = contatoRequestDto.Whatsapp,
                Email = contatoRequestDto.Email,
                TipoContato = contatoRequestDto.TipoContato
            };

            _context.Contatos.Add(novoContato);
            await _context.SaveChangesAsync();

            var contatoSalvoDto = MapContatoToResponseDto(novoContato);
            _logger.LogInformation("Contato com ID {IdContato} e Email {Email} criado com sucesso.", novoContato.IdContato, novoContato.Email);
            return CreatedAtAction(nameof(BuscarContatoPorId), new { id = contatoSalvoDto.IdContato }, contatoSalvoDto);
        }

        /// <summary>
        /// Atualiza um contato existente.
        /// </summary>
        /// <param name="id">O ID do contato a ser atualizado.</param>
        /// <param name="contatoRequestDto">Os novos dados para o contato.</param>
        /// <returns>O contato atualizado.</returns>
        /// <response code="200">Retorna o contato atualizado.</response>
        /// <response code="400">Se os dados da requisição forem inválidos (ex: novo e-mail já existe em outro contato).</response>
        /// <response code="404">Se o contato com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ContatoResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)] // Para e-mail duplicado
        public async Task<IActionResult> AtualizarContato(long id, [FromBody] ContatoRequestDto contatoRequestDto)
        {
            _logger.LogInformation("Endpoint PUT /api/contatos/{Id} chamado.", id);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var contatoExistente = await _context.Contatos.FirstOrDefaultAsync(c => c.IdContato == id);
            if (contatoExistente == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Contato com ID {id} não encontrado para atualização." });
            }

            // Verificar se o novo e-mail já existe em OUTRO contato
            if (contatoExistente.Email != contatoRequestDto.Email)
            {
                var outroContatoComEmail = await _context.Contatos
                                                    .AsNoTracking()
                                                    .FirstOrDefaultAsync(c => c.Email == contatoRequestDto.Email && c.IdContato != id);
                if (outroContatoComEmail != null)
                {
                    return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "E-mail já cadastrado", Detail = $"Já existe outro contato cadastrado com o e-mail: {contatoRequestDto.Email}" });
                }
            }

            contatoExistente.Ddd = contatoRequestDto.Ddd;
            contatoExistente.Telefone = contatoRequestDto.Telefone;
            contatoExistente.Celular = contatoRequestDto.Celular;
            contatoExistente.Whatsapp = contatoRequestDto.Whatsapp;
            contatoExistente.Email = contatoRequestDto.Email;
            contatoExistente.TipoContato = contatoRequestDto.TipoContato;

            await _context.SaveChangesAsync();
            return Ok(MapContatoToResponseDto(contatoExistente));
        }

        /// <summary>
        /// Deleta um contato pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do contato a ser deletado.</param>
        /// <response code="204">Contato deletado com sucesso.</response>
        /// <response code="404">Se o contato com o ID especificado não for encontrado.</response>
        /// <response code="500">Se ocorrer um erro interno no servidor.</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletarContato(long id)
        {
            _logger.LogInformation("Endpoint DELETE /api/contatos/{Id} chamado.", id);
            var contato = await _context.Contatos.FindAsync(id);
            if (contato == null)
            {
                return NotFound(new ProblemDetails { Status = StatusCodes.Status404NotFound, Title = "Recurso não encontrado", Detail = $"Contato com ID {id} não encontrado para deleção." });
            }

            // Antes de remover, precisamos desassociar dos clientes para evitar erro de FK se a relação for obrigatória em Cliente.
            // O EF Core geralmente lida com isso para tabelas de junção, mas é uma boa prática ser explícito ou garantir o comportamento.
            // No DDL, as FKs em TB_CLIENTECONTATO3 não têm ON DELETE CASCADE, então o EF Core deve remover as entradas da tabela de junção.
            _context.Contatos.Remove(contato);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}