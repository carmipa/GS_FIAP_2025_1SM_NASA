// File: gsApi/dto/response/GoogleGeocodingResultDto.cs
using System.Collections.Generic;
using System.Text.Json.Serialization;
namespace gsApi.dto.response
{
    public class GoogleGeocodingResultDto
    {
        [JsonPropertyName("formatted_address")]
        public string? FormattedAddress { get; set; } // Anulável

        [JsonPropertyName("geometry")]
        public GoogleGeocodingGeometryDto? Geometry { get; set; } // Anulável

        [JsonPropertyName("place_id")]
        public string? PlaceId { get; set; } // Anulável

        [JsonPropertyName("types")]
        public List<string> Types { get; set; } = new List<string>(); // Inicializado
    }
}