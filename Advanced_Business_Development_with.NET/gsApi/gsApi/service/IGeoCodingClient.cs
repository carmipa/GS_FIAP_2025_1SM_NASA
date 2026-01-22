// File: gsApi/services/IGeoCodingClient.cs
using gsApi.dto.request; // Para EnderecoGeoRequestDto
using gsApi.dto.response; // Para GeoCoordinatesDto
using gsApi.DTOs.Request;
using gsApi.DTOs.Response;
using System.Threading.Tasks;

namespace gsApi.services
{
    public interface IGeoCodingClient
    {
        Task<GeoCoordinatesDto?> GetCoordinatesFromAddressAsync(EnderecoGeoRequestDto enderecoDto);
    }
}
