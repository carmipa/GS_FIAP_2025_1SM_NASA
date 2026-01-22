// File: DTOs/Request/ContatoRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace gsApi.DTOs.Request
{
    /// <summary>
    /// DTO para criar/atualizar um contato via API.
    /// </summary>
    public class ContatoRequestDto
    {
        [Required(ErrorMessage = "O DDD é obrigatório.")]
        [StringLength(3, MinimumLength = 2, ErrorMessage = "O DDD deve ter entre 2 e 3 dígitos.")]
        public string Ddd { get; set; } = string.Empty;

        [Required(ErrorMessage = "O Telefone é obrigatório.")]
        [StringLength(15, ErrorMessage = "O Telefone não pode exceder 15 caracteres.")]
        public string Telefone { get; set; } = string.Empty;

        [Required(ErrorMessage = "O Celular é obrigatório.")]
        [StringLength(15, ErrorMessage = "O Celular não pode exceder 15 caracteres.")]
        public string Celular { get; set; } = string.Empty;

        [Required(ErrorMessage = "O Whatsapp é obrigatório.")]
        [StringLength(15, ErrorMessage = "O Whatsapp não pode exceder 15 caracteres.")]
        public string Whatsapp { get; set; } = string.Empty;

        [Required(ErrorMessage = "O Email é obrigatório.")]
        [EmailAddress(ErrorMessage = "Formato de email inválido.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "O Tipo de Contato é obrigatório.")]
        [StringLength(50, ErrorMessage = "O Tipo de Contato não pode exceder 50 caracteres.")]
        public string TipoContato { get; set; } = string.Empty;
    }
}
