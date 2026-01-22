// File: gsApi/services/IViaCepClient.cs
using gsApi.dto.response;
using gsApi.DTOs.Response;
using System.Threading.Tasks;

namespace gsApi.services // Namespace correto
{
    public interface IViaCepClient
    {
        Task<ViaCepResponseDto?> GetEnderecoByCepAsync(string cep);
    }
}