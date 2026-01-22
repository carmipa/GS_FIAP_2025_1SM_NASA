// File: gsApi/dto/request/EonetRequestDto.cs
using System; // Para DateTimeOffset
using System.ComponentModel.DataAnnotations;

namespace gsApi.DTOs.Request
{
    public class EonetRequestDto
    {
        [Required(ErrorMessage = "O conteúdo JSON não pode ser nulo.")]
        public required string Json { get; set; }

        [Required(ErrorMessage = "A data do evento não pode ser nula.")]
        public DateTimeOffset Data { get; set; } // Tipo de valor

        [Required(ErrorMessage = "O ID da API EONET não pode estar em branco.")]
        [StringLength(50, ErrorMessage = "O ID da API EONET não pode exceder 50 caracteres.")]
        public required string EonetIdApi { get; set; }
    }
}