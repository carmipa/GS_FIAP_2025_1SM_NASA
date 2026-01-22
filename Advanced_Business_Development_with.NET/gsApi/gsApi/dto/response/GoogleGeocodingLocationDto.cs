// File: gsApi/dto/response/GoogleGeocodingLocationDto.cs
using System.Text.Json.Serialization;
namespace gsApi.dto.response
{
    public class GoogleGeocodingLocationDto
    {
        [JsonPropertyName("lat")]
        public double Latitude { get; set; }

        [JsonPropertyName("lng")]
        public double Longitude { get; set; }
    }
}