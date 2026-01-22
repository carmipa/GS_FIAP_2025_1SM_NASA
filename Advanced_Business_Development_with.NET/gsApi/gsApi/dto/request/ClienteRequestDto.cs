// File: gsApi/dto/request/ClienteRequestDto.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace gsApi.dto.request // Namespace correto
{
    public class ClienteRequestDto
    {
        [Required(ErrorMessage = "O nome não pode estar em branco.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 100 caracteres.")]
        public required string Nome { get; set; }

        [Required(ErrorMessage = "O sobrenome não pode estar em branco.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "O sobrenome deve ter entre 2 e 100 caracteres.")]
        public required string Sobrenome { get; set; }

        [Required(ErrorMessage = "A data de nascimento não pode estar em branco.")]
        [RegularExpression(@"^(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4})$", ErrorMessage = "A data de nascimento deve estar no formato yyyy-MM-dd ou dd/MM/yyyy.")]
        public required string DataNascimento { get; set; }

        [Required(ErrorMessage = "O documento não pode estar em branco.")]
        [StringLength(18, MinimumLength = 11, ErrorMessage = "O documento deve ter entre 11 e 18 caracteres.")]
        public required string Documento { get; set; }

        public List<long>? ContatosIds { get; set; }
        public List<long>? EnderecosIds { get; set; }
    }
}