// File: gsApi/dto/request/EnderecoRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace gsApi.DTOs.Request
{
    public class EnderecoRequestDto
    {
        [Required(ErrorMessage = "O CEP não pode estar em branco.")]
        [RegularExpression(@"^\d{5}-?\d{3}$", ErrorMessage = "O CEP deve estar no formato XXXXX-XXX ou XXXXXXXX.")]
        public required string Cep { get; set; }

        [Required(ErrorMessage = "O número não pode ser nulo.")]
        [Range(1, 99999, ErrorMessage = "O número deve ser um inteiro de até 5 dígitos.")]
        public int Numero { get; set; } // Tipo de valor, 'required' C# não se aplica para nulidade

        [Required(ErrorMessage = "O logradouro não pode estar em branco.")]
        [StringLength(255, ErrorMessage = "O logradouro não pode exceder 255 caracteres.")]
        public required string Logradouro { get; set; }

        [Required(ErrorMessage = "O bairro não pode estar em branco.")]
        [StringLength(255, ErrorMessage = "O bairro não pode exceder 255 caracteres.")]
        public required string Bairro { get; set; }

        [Required(ErrorMessage = "A localidade (cidade) não pode estar em branco.")]
        [StringLength(100, ErrorMessage = "A localidade não pode exceder 100 caracteres.")]
        public required string Localidade { get; set; }

        [Required(ErrorMessage = "A UF não pode estar em branco.")]
        [StringLength(2, MinimumLength = 2, ErrorMessage = "A UF deve ter 2 caracteres.")]
        public required string Uf { get; set; }

        [Required(ErrorMessage = "O complemento não pode estar em branco.")]
        [StringLength(255, ErrorMessage = "O complemento não pode exceder 255 caracteres.")]
        public required string Complemento { get; set; }

        [Required(ErrorMessage = "Latitude não pode ser nula.")]
        [Range(-90.0, 90.0, ErrorMessage = "Latitude inválida. Deve estar entre -90 e 90.")]
        public double Latitude { get; set; } // Tipo de valor

        [Required(ErrorMessage = "Longitude não pode ser nula.")]
        [Range(-180.0, 180.0, ErrorMessage = "Longitude inválida. Deve estar entre -180 e 180.")]
        public double Longitude { get; set; } // Tipo de valor
    }
}