// File: gsApi/services/EmailNotificationService.cs
using gsApi.dto.request;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration; // Para IConfiguration
using Microsoft.Extensions.Logging;
using MimeKit;
using MimeKit.Text;
using System;
using System.Threading.Tasks;

namespace gsApi.services
{
    public class SmtpSettings
    {
        public string Server { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FromAddress { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public bool UseSsl { get; set; } = true; // Padrão para true, pode ser configurável
    }

    public class EmailNotificationService : IEmailNotificationService
    {
        private readonly ILogger<EmailNotificationService> _logger;
        private readonly SmtpSettings _smtpSettings;

        public EmailNotificationService(ILogger<EmailNotificationService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _smtpSettings = configuration.GetSection("SmtpSettings").Get<SmtpSettings>() ?? new SmtpSettings();

            if (string.IsNullOrEmpty(_smtpSettings.Server) || string.IsNullOrEmpty(_smtpSettings.FromAddress))
            {
                _logger.LogError("Configurações SMTP (SmtpSettings:Server e SmtpSettings:FromAddress) não encontradas ou incompletas no appsettings.json.");
                // Considerar lançar exceção se o envio de e-mail for crítico
            }
        }

        public async Task SendEventAlertEmailAsync(string recipientEmail, string userName, AlertableEventDto eventDetails)
        {
            if (string.IsNullOrEmpty(_smtpSettings.Server) || string.IsNullOrEmpty(recipientEmail))
            {
                _logger.LogWarning("Não foi possível enviar e-mail de alerta: configurações SMTP incompletas ou destinatário de e-mail nulo/vazio para o usuário {UserName}", userName);
                return; // Ou lançar exceção
            }

            _logger.LogInformation("Preparando para enviar e-mail de alerta para {RecipientEmail} sobre o evento {EventTitle}", recipientEmail, eventDetails.Title);

            try
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromAddress));
                email.To.Add(MailboxAddress.Parse(recipientEmail));
                email.Subject = $"Alerta de Desastre: {eventDetails.Title ?? "Novo Evento"} Próximo à Sua Localização!";

                var bodyBuilder = new BodyBuilder();
                bodyBuilder.HtmlBody = $@"
                    <p>Olá, {userName}!</p>
                    <p>Detectamos um evento de desastre natural próximo a uma de suas localizações cadastradas ou de seu interesse:</p>
                    <p><strong>Evento:</strong> {eventDetails.Title ?? "N/A"}</p>
                    {(string.IsNullOrWhiteSpace(eventDetails.EventDate) ? "" : $"<p><strong>Data do Evento:</strong> {eventDetails.EventDate}</p>")}
                    {(string.IsNullOrWhiteSpace(eventDetails.Description) ? "" : $"<p><strong>Descrição:</strong> {eventDetails.Description}</p>")}
                    {(string.IsNullOrWhiteSpace(eventDetails.Link) ? "" : $"<p><strong>Mais informações em:</strong> <a href='{eventDetails.Link}'>{eventDetails.Link}</a></p>")}
                    <p>Por favor, tome as precauções necessárias.</p>
                    <p>Atenciosamente,<br/>Equipe GS Alerta Desastres</p>";

                email.Body = bodyBuilder.ToMessageBody();

                using var smtp = new SmtpClient();
                // Definir SecureSocketOptions com base na configuração UseSsl e porta
                SecureSocketOptions socketOptions = SecureSocketOptions.Auto;
                if (_smtpSettings.UseSsl)
                {
                    socketOptions = _smtpSettings.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
                }
                else
                {
                    socketOptions = SecureSocketOptions.None;
                }

                await smtp.ConnectAsync(_smtpSettings.Server, _smtpSettings.Port, socketOptions);
                _logger.LogInformation("Conectado ao servidor SMTP: {SmtpServer}:{SmtpPort} com UseSsl={UseSsl}", _smtpSettings.Server, _smtpSettings.Port, _smtpSettings.UseSsl);

                if (!string.IsNullOrEmpty(_smtpSettings.Username) && !string.IsNullOrEmpty(_smtpSettings.Password))
                {
                    await smtp.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                    _logger.LogInformation("Autenticado no servidor SMTP com usuário {SmtpUsername}", _smtpSettings.Username);
                }

                await smtp.SendAsync(email);
                _logger.LogInformation("E-mail de alerta enviado com sucesso para {RecipientEmail} sobre o evento {EventId}", recipientEmail, eventDetails.EventId);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha ao enviar e-mail de alerta para {RecipientEmail} sobre o evento {EventId}.", recipientEmail, eventDetails.EventId);
                // Não relance a exceção aqui necessariamente, para não quebrar o fluxo principal se o e-mail for uma notificação secundária.
                // Ou lance uma exceção customizada se o envio de e-mail for crítico.
                // throw new ServicoIndisponivelException("Falha ao enviar notificação por e-mail.", ex);
            }
        }
    }
}