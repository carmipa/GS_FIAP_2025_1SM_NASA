// File: gsApi/dto/response/GoogleGeocodingApiResponseDto.cs
using System.Collections.Generic;
using System.Text.Json.Serialization;
namespace gsApi.dto.response
{
    public class GoogleGeocodingApiResponseDto
    {
        [JsonPropertyName("results")]
        public List<GoogleGeocodingResultDto> Results { get; set; } = new List<GoogleGeocodingResultDto>(); // Inicializado

        [JsonPropertyName("status")]
        public string? Status { get; set; } // Status pode vir, mas para ser seguro, anulável ou required se sempre garantido

        [JsonPropertyName("error_message")]
        public string? ErrorMessage { get; set; }
    }
}