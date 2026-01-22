// File: gsApi/services/GeoCodingClient.cs
using gsApi.dto.request;
using gsApi.dto.response;
using gsApi.exceptions;
using Microsoft.Extensions.Configuration; // Para IConfiguration
using Microsoft.Extensions.Logging;
using gsApi.DTOs.Request;
using gsApi.DTOs.Response;
using gsApi.Exceptions;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web; // Para HttpUtility.UrlEncode

namespace gsApi.services
{
    public class GeoCodingClient : IGeoCodingClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GeoCodingClient> _logger;
        private readonly string? _apiKey;
        private readonly string _googleApiUrl;

        public GeoCodingClient(HttpClient httpClient, ILogger<GeoCodingClient> logger, IConfiguration configuration)
        {
            _httpClient = httpClient; // BaseAddress (maps.googleapis.com) pode ser configurado no Program.cs
            _logger = logger;
            _apiKey = configuration["ExternalServices:GoogleGeocoding:ApiKey"];
            _googleApiUrl = configuration.GetValue<string>("ExternalServices:GoogleGeocoding:ApiUrl") ?? "https://maps.googleapis.com/maps/api/geocode/json";

            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("Chave da API do Google Geocoding (ExternalServices:GoogleGeocoding:ApiKey) não configurada no appsettings.json.");
                // Considerar lançar uma exceção aqui ou permitir que o serviço funcione sem chave (algumas APIs permitem uso limitado)
            }
        }

        public async Task<GeoCoordinatesDto?> GetCoordinatesFromAddressAsync(EnderecoGeoRequestDto enderecoDto)
        {
            if (string.IsNullOrWhiteSpace(enderecoDto.Logradouro) ||
                string.IsNullOrWhiteSpace(enderecoDto.Cidade) ||
                string.IsNullOrWhiteSpace(enderecoDto.Uf))
            {
                _logger.LogWarning("Dados de endereço insuficientes para geocodificação (requer logradouro, cidade, UF).");
                return null;
            }

            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new InvalidOperationException("API Key do Google Geocoding não está configurada.");
            }

            var addressQueryBuilder = new List<string>();
            if (!string.IsNullOrWhiteSpace(enderecoDto.Logradouro)) addressQueryBuilder.Add(enderecoDto.Logradouro);
            if (!string.IsNullOrWhiteSpace(enderecoDto.Numero)) addressQueryBuilder.Add(enderecoDto.Numero);
            if (!string.IsNullOrWhiteSpace(enderecoDto.Bairro)) addressQueryBuilder.Add(enderecoDto.Bairro);
            if (!string.IsNullOrWhiteSpace(enderecoDto.Cidade)) addressQueryBuilder.Add(enderecoDto.Cidade);
            if (!string.IsNullOrWhiteSpace(enderecoDto.Uf)) addressQueryBuilder.Add(enderecoDto.Uf);
            if (!string.IsNullOrWhiteSpace(enderecoDto.Cep)) addressQueryBuilder.Add(enderecoDto.Cep.Replace("-", ""));
            addressQueryBuilder.Add("Brasil"); // Adicionar país para maior precisão

            string addressString = string.Join(", ", addressQueryBuilder.Where(s => !string.IsNullOrWhiteSpace(s)));

            // Componentes para restringir a busca ao Brasil e usar o CEP se disponível
            string components = "country:BR";
            if (!string.IsNullOrWhiteSpace(enderecoDto.Cep))
            {
                components += $"|postal_code:{enderecoDto.Cep.Replace("-", "")}";
            }


            var requestUri = $"{_googleApiUrl}?address={HttpUtility.UrlEncode(addressString)}&components={HttpUtility.UrlEncode(components)}&key={_apiKey}&language=pt-BR";
            _logger.LogInformation("Consultando Google Geocoding API: {RequestUri}", requestUri.Replace(_apiKey, "***API_KEY_OCULTADA***"));

            try
            {
                var response = await _httpClient.GetAsync(requestUri);
                var responseContent = await response.Content.ReadAsStringAsync(); // Ler como string para debug

                if (response.IsSuccessStatusCode)
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var apiResponse = JsonSerializer.Deserialize<GoogleGeocodingApiResponseDto>(responseContent, options);

                    if (apiResponse != null && apiResponse.Status == "OK" && apiResponse.Results != null && apiResponse.Results.Any())
                    {
                        var bestResult = apiResponse.Results.First();
                        if (bestResult.Geometry?.Location != null)
                        {
                            _logger.LogInformation("Coordenadas encontradas para: {AddressString}", addressString);
                            return new GeoCoordinatesDto
                            {
                                Latitude = bestResult.Geometry.Location.Latitude,
                                Longitude = bestResult.Geometry.Location.Longitude,
                                MatchedAddress = bestResult.FormattedAddress
                            };
                        }
                    }
                    _logger.LogWarning("Google Geocoding API retornou status {Status} ou nenhum resultado válido para {AddressString}. Resposta: {ApiResponse}", apiResponse?.Status, addressString, responseContent);
                    return null;
                }
                else
                {
                    _logger.LogError("Erro ao consultar Google Geocoding API para {AddressString}. Status: {StatusCode}. Resposta: {ResponseContent}",
                        addressString, response.StatusCode, responseContent);
                    throw new ServicoIndisponivelException($"Google Geocoding API retornou status: {response.StatusCode}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Erro de HttpRequest ao consultar Google Geocoding API para {AddressString}.", addressString);
                throw new ServicoIndisponivelException($"Erro de comunicação ao consultar o Google Geocoding API para o endereço.", ex);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Erro de desserialização JSON ao consultar Google Geocoding API para {AddressString}.", addressString);
                throw new ServicoIndisponivelException($"Erro ao processar a resposta do Google Geocoding API.", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao consultar Google Geocoding API para {AddressString}.", addressString);
                throw;
            }
        }
    }
}