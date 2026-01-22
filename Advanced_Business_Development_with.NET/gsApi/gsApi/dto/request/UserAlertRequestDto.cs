// File: gsApi/dto/request/UserAlertRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace gsApi.dto.request
{
    /// <summary>
    /// DTO para solicitar o disparo de um alerta para um usuário específico.
    /// </summary>
    public class UserAlertRequestDto
    {
        /// <summary>
        /// ID do usuário a ser alertado.
        /// </summary>
        [Required(ErrorMessage = "O ID do usuário é obrigatório.")]
        public long UserId { get; set; } // Para CS9035, UserId é long, não precisa de 'required' se não for classe.

        /// <summary>
        /// Detalhes do evento para o alerta.
        /// </summary>
        [Required(ErrorMessage = "Os detalhes do evento são obrigatórios.")]
        public required AlertableEventDto EventDetails { get; set; } // Usando AlertableEventDto e 'required'
    }
}