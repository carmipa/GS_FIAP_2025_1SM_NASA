// File: gsApi/dto/response/ContatoResponseDto.cs
// Baseado no seu arquivo: gsApi.DTOs.Response.ContatoResponseDto
using System.ComponentModel.DataAnnotations;

namespace gsApi.dto.response // Padronizando namespace
{
    public class ContatoResponseDto
    {
        // IdContato não precisa de [Required] se for gerado pelo banco e sempre presente na resposta.
        public long IdContato { get; set; }

        [Required]
        public required string Ddd { get; set; }
        [Required]
        public required string Telefone { get; set; }
        [Required]
        public required string Celular { get; set; }
        [Required]
        public required string Whatsapp { get; set; }
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        [Required]
        public required string TipoContato { get; set; }
    }
}