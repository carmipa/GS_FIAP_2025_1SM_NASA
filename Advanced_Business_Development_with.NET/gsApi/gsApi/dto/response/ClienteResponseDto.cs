// File: gsApi/dto/response/ClienteResponseDto.cs
using gsApi.DTOs.Response;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace gsApi.dto.response
{
    public class ClienteResponseDto
    {
        public long IdCliente { get; set; }

        [Required]
        public required string Nome { get; set; }

        [Required]
        public required string Sobrenome { get; set; }

        [Required]
        public required string DataNascimento { get; set; }

        [Required]
        public required string Documento { get; set; }

        public ICollection<ContatoResponseDto> Contatos { get; set; } = new List<ContatoResponseDto>();
        public ICollection<EnderecoResponseDto> Enderecos { get; set; } = new List<EnderecoResponseDto>();
    }
}