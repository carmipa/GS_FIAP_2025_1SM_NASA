// File: gsApi/dto/response/GoogleGeocodingGeometryDto.cs
using System.Text.Json.Serialization;
namespace gsApi.dto.response
{
    public class GoogleGeocodingGeometryDto
    {
        [JsonPropertyName("location")]
        public GoogleGeocodingLocationDto? Location { get; set; } // Anulável
    }
}