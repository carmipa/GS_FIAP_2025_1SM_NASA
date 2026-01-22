// File: gsApi/dto/request/EnderecoGeoRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace gsApi.DTOs.Request
{
    public class EnderecoGeoRequestDto
    {
        [Required(ErrorMessage = "Logradouro é obrigatório para geocodificação.")]
        [StringLength(255)]
        public required string Logradouro { get; set; }

        [StringLength(10)]
        public string? Numero { get; set; } // Opcional

        [Required(ErrorMessage = "Cidade (Localidade) é obrigatória para geocodificação.")]
        [StringLength(100)]
        public required string Cidade { get; set; }

        [Required(ErrorMessage = "UF (Estado) é obrigatória para geocodificação.")]
        [StringLength(2, MinimumLength = 2)]
        public required string Uf { get; set; }

        [StringLength(100)]
        public string? Bairro { get; set; } // Opcional

        [StringLength(9)]
        public string? Cep { get; set; } // Opcional
    }
}