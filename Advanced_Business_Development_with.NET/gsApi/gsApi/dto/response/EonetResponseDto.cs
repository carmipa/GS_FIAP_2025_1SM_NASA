// File: gsApi/dto/response/EonetResponseDto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace gsApi.dto.response
{
    public class EonetResponseDto
    {
        public long IdEonet { get; set; }
        public string? Json { get; set; }
        public DateTime? Data { get; set; } // <--- CORREÇÃO: Alterado para DateTime?

        [Required]
        public required string EonetIdApi { get; set; }
    }
}