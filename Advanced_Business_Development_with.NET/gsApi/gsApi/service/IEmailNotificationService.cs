// File: gsApi/services/IEmailNotificationService.cs
using gsApi.dto.request; // Para AlertableEventDto
using System.Threading.Tasks;

namespace gsApi.services
{
    public interface IEmailNotificationService
    {
        Task SendEventAlertEmailAsync(string recipientEmail, string userName, AlertableEventDto eventDetails);
        // Você pode adicionar outros métodos de envio de email aqui se necessário
    }
}
