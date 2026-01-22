// File: gsApi/dto/request/AlertableEventDto.cs
namespace gsApi.dto.request
{
    /// <summary>
    /// DTO contendo detalhes de um evento para fins de alerta.
    /// </summary>
    public class AlertableEventDto
    {
        /// <summary>
        /// ID do evento (ex: ID da EONET).
        /// </summary>
        public string? EventId { get; set; }

        /// <summary>
        /// Título do evento. Se for obrigatório para o alerta, marque como 'required'.
        /// </summary>
        public required string Title { get; set; } // Exemplo: Tornando o título obrigatório

        /// <summary>
        /// Data do evento (formatada como string).
        /// </summary>
        public string? EventDate { get; set; }

        /// <summary>
        /// Link para mais informações sobre o evento.
        /// </summary>
        public string? Link { get; set; }

        /// <summary>
        /// Descrição breve do evento.
        /// </summary>
        public string? Description { get; set; }
    }
}