// File: gsApi/dto/response/NominatimResponseDto.cs
using System.Collections.Generic;
using System.Text.Json.Serialization;
namespace gsApi.dto.response
{
    public class NominatimResponseDto
    {
        [JsonPropertyName("place_id")]
        public long PlaceId { get; set; } // Tipos valor não são inerentemente nulos

        [JsonPropertyName("licence")]
        public string? Licence { get; set; }

        [JsonPropertyName("osm_type")]
        public string? OsmType { get; set; }

        [JsonPropertyName("osm_id")]
        public long OsmId { get; set; }

        [JsonPropertyName("lat")]
        public string? Latitude { get; set; }

        [JsonPropertyName("lon")]
        public string? Longitude { get; set; }

        [JsonPropertyName("display_name")]
        public string? DisplayName { get; set; }

        [JsonPropertyName("boundingbox")]
        public List<string>? BoundingBox { get; set; } = new List<string>();

        [JsonPropertyName("error")]
        public string? Error { get; set; }
    }
}