// File: gsApi/services/INasaEonetClient.cs
using gsApi.dto.response; // Para NasaEonetApiResponseDto
using gsApi.model.DTOs.Response;
using System.Collections.Generic; // Para List
using System.Threading.Tasks;

namespace gsApi.services
{
    public interface INasaEonetClient
    {
        Task<NasaEonetApiResponseDto?> GetEventsAsync(
            int? limit = null,
            int? days = null,
            string? status = null,
            string? source = null,
            string? bbox = null, // Formato: W,S,E,N (minLon,minLat,maxLon,maxLat)
            string? startDate = null, // Formato: YYYY-MM-DD
            string? endDate = null    // Formato: YYYY-MM-DD
        );
    }
}