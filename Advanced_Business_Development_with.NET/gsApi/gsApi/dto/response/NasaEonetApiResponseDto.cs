// File: gsApi/dto/response/NasaEonetApiResponseDto.cs
using gsApi.DTOs.Response;
using System.Collections.Generic;
using System.Text.Json.Serialization;
namespace gsApi.dto.response
{
    public class NasaEonetApiResponseDto
    {
        [JsonPropertyName("title")]
        public required string Title { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("link")]
        public required string Link { get; set; }

        [JsonPropertyName("events")]
        // Conforme seu input, esta é uma boa forma:
        public required List<NasaEonetEventDto> Events { get; set; } = new List<NasaEonetEventDto>();
    }
}