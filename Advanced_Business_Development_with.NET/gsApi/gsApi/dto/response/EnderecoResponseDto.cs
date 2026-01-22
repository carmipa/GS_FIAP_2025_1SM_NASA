// File: gsApi/dto/response/EnderecoResponseDto.cs
using System.ComponentModel.DataAnnotations;

namespace gsApi.dto.response
{
    public class EnderecoResponseDto
    {
        public long IdEndereco { get; set; }

        [Required]
        public required string Cep { get; set; }

        public int Numero { get; set; }

        [Required]
        public required string Logradouro { get; set; }

        [Required]
        public required string Bairro { get; set; }

        [Required]
        public required string Localidade { get; set; }

        [Required]
        public required string Uf { get; set; }

        public string? Complemento { get; set; } // Anulável

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }
}