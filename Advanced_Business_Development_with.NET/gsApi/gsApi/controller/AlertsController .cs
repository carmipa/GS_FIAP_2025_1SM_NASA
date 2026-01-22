// File: gsApi/controller/AlertsController.cs
using gsApi.data;             // Namespace para AppDbContext
using gsApi.dto.request;      // Namespace para UserAlertRequestDto, AlertableEventDto
using gsApi.DTOs.Request;
// using gsApi.dto.response; // Não usado diretamente para o corpo da resposta aqui
using gsApi.exceptions;       // Namespace para RecursoNaoEncontradoException
using gsApi.model;            // Namespace para Cliente, Contato
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
// using gsApi.services;    // Namespace para IEmailNotificationService (futuro)
using System;
using System.Linq;
using System.Threading.Tasks;

namespace gsApi.controller
{
    /// <summary>
    /// Gerencia o disparo de alertas específicos para usuários.
    /// </summary>
    [ApiController]
    [Route("api/alerts")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class AlertsController : ControllerBase
    {
        private readonly ILogger<AlertsController> _logger;
        private readonly AppDbContext _context;
        // private readonly IEmailNotificationService _emailService; // Descomente quando o serviço de email for injetado

        public AlertsController(ILogger<AlertsController> logger, AppDbContext context /*, IEmailNotificationService emailService */)
        {
            _logger = logger;
            _context = context;
            // _emailService = emailService; // Descomente
        }

        /// <summary>
        /// Dispara um alerta para um usuário específico sobre um evento.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe o ID de um usuário e os detalhes de um evento. 
        /// Ele tentará encontrar o e-mail principal do usuário e, em uma implementação futura completa, 
        /// enviaria uma notificação por e-mail.
        /// </remarks>
        /// <param name="requestDto">Objeto contendo o `UserId` e `EventDetails` para o alerta.</param>
        /// <response code="200">Solicitação de alerta processada com sucesso. A mensagem indicará se o e-mail seria enviado (simulação) ou se não foi encontrado um e-mail válido.</response>
        /// <response code="400">Se os dados da requisição forem inválidos (ex: campos obrigatórios faltando no DTO).</response>
        /// <response code="404">Se o usuário com o ID especificado não for encontrado no sistema.</response>
        /// <response code="500">Se ocorrer um erro interno inesperado no servidor durante o processamento.</response>
        [HttpPost("trigger-user-specific-alert")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> TriggerAlertForUser([FromBody] UserAlertRequestDto requestDto)
        {
            _logger.LogInformation(
                "Endpoint POST /api/alerts/trigger-user-specific-alert chamado para UserID: {UserId} sobre evento: {EventTitle}",
                requestDto.UserId, requestDto.EventDetails?.Title);

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var usuario = await _context.Clientes
                                      .Include(c => c.Contatos)
                                      .FirstOrDefaultAsync(c => c.IdCliente == requestDto.UserId);

            if (usuario == null)
            {
                _logger.LogWarning("Usuário com ID: {UserId} não encontrado para envio de alerta.", requestDto.UserId);
                // Em uma implementação com camada de serviço, o serviço lançaria RecursoNaoEncontradoException.
                // O middleware TratadorGlobalExcecoesMiddleware cuidaria de formatar a resposta 404.
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Recurso não encontrado.",
                    Detail = $"Usuário com ID: {requestDto.UserId} não encontrado."
                });
            }

            var contatoPrincipal = usuario.Contatos?.FirstOrDefault(c => !string.IsNullOrEmpty(c.Email));

            if (contatoPrincipal == null || string.IsNullOrEmpty(contatoPrincipal.Email))
            {
                _logger.LogWarning("Usuário ID: {UserId} ({UserName}) não possui um e-mail de contato válido cadastrado. Alerta não pode ser enviado por e-mail.",
                    usuario.IdCliente, usuario.Nome);
                return Ok($"Solicitação de alerta para usuário ID {usuario.IdCliente} ({usuario.Nome}) processada, mas nenhum e-mail de contato válido foi encontrado para envio da notificação.");
            }

            string recipientEmail = contatoPrincipal.Email;
            string userName = usuario.Nome; // Ou usuario.Nome + " " + usuario.Sobrenome;
            AlertableEventDto eventDetails = requestDto.EventDetails;

            _logger.LogInformation("Preparando para notificar usuário {UserName} (Email: {RecipientEmail}) sobre o evento: {EventTitle}",
                userName, recipientEmail, eventDetails.Title);

            // TODO: Implementar a chamada real ao IEmailNotificationService aqui
            // try
            // {
            //     await _emailService.SendEventAlertEmailAsync(recipientEmail, userName, eventDetails);
            //     _logger.LogInformation("Notificação de alerta (simulação) encaminhada para {RecipientEmail} sobre o evento {EventId}", recipientEmail, eventDetails.EventId);
            //     return Ok($"Alerta para o evento '{eventDetails.Title}' encaminhado para {userName} ({recipientEmail}).");
            // }
            // catch (Exception ex)
            // {
            //     _logger.LogError(ex, "Falha ao tentar enviar notificação por e-mail para {RecipientEmail} sobre o evento {EventId}.", recipientEmail, eventDetails.EventId);
            //     // Não relançar a exceção necessariamente para não quebrar o fluxo principal,
            //     // mas retornar um erro 500 para indicar que a notificação falhou.
            //     throw new ServicoIndisponivelException("Falha ao processar o envio da notificação por e-mail.", ex);
            // }

            // Resposta de simulação enquanto o serviço de e-mail não está implementado:
            return Ok($"Solicitação de alerta para usuário ID {requestDto.UserId} ({userName}) processada. O envio de e-mail para {recipientEmail} sobre o evento '{eventDetails.Title}' seria realizado aqui.");
        }
    }
}