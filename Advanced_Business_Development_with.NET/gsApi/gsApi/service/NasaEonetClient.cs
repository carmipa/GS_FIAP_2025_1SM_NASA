// File: gsApi/services/NasaEonetClient.cs
using gsApi.dto.response;
using gsApi.exceptions;
using gsApi.Exceptions;
using gsApi.model.DTOs.Response;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web; // Para HttpUtility

namespace gsApi.services
{
    public class NasaEonetClient : INasaEonetClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<NasaEonetClient> _logger;
        private readonly string _eonetApiEventUrl;


        public NasaEonetClient(HttpClient httpClient, ILogger<NasaEonetClient> logger, IConfiguration configuration)
        {
            _httpClient = httpClient; // BaseAddress (https://eonet.gsfc.nasa.gov/api/v3/) será configurada no Program.cs
            _logger = logger;
            // O endpoint específico de eventos (/events) será adicionado na chamada.
            _eonetApiEventUrl = configuration.GetValue<string>("ExternalServices:NasaEonet:EventsEndpoint") ?? "events"; // Padrão "events"
        }

        public async Task<NasaEonetApiResponseDto?> GetEventsAsync(
            int? limit = null,
            int? days = null,
            string? status = null,
            string? source = null,
            string? bbox = null,
            string? startDate = null,
            string? endDate = null)
        {
            var queryParams = new Dictionary<string, string?>();
            if (limit.HasValue) queryParams["limit"] = limit.ToString();

            // EONET API prioriza start/end se ambos 'days' e 'start'/'end' estiverem presentes.
            if (!string.IsNullOrWhiteSpace(startDate)) queryParams["start"] = startDate;
            if (!string.IsNullOrWhiteSpace(endDate)) queryParams["end"] = endDate;
            // Só adiciona 'days' se start e end não estiverem definidos.
            else if (days.HasValue) queryParams["days"] = days.ToString();

            if (!string.IsNullOrWhiteSpace(status)) queryParams["status"] = status;
            if (!string.IsNullOrWhiteSpace(source)) queryParams["source"] = source;
            if (!string.IsNullOrWhiteSpace(bbox)) queryParams["bbox"] = bbox;

            var queryString = HttpUtility.ParseQueryString(string.Empty);
            foreach (var kvp in queryParams.Where(kvp => kvp.Value != null))
            {
                queryString[kvp.Key] = kvp.Value;
            }

            string requestUri = _eonetApiEventUrl;
            if (queryString.Count > 0)
            {
                requestUri += $"?{queryString.ToString()}";
            }

            _logger.LogInformation("Consultando NASA EONET API: {BaseAddress}{RequestUri}", _httpClient.BaseAddress, requestUri);

            try
            {
                var response = await _httpClient.GetAsync(requestUri);
                var responseContent = await response.Content.ReadAsStringAsync(); // Ler para debug em caso de erro

                if (response.IsSuccessStatusCode)
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var apiResponse = JsonSerializer.Deserialize<NasaEonetApiResponseDto>(responseContent, options);
                    _logger.LogInformation("Dados da NASA EONET obtidos. Título: {Title}, Número de Eventos: {Count}",
                        apiResponse?.Title, apiResponse?.Events?.Count ?? 0);
                    return apiResponse;
                }
                else
                {
                    _logger.LogError("Erro ao consultar NASA EONET API. Status: {StatusCode}. Resposta: {ResponseContent}",
                        response.StatusCode, responseContent);
                    throw new ServicoIndisponivelException($"Serviço NASA EONET retornou status: {response.StatusCode}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Erro de HttpRequest ao consultar NASA EONET API.");
                throw new ServicoIndisponivelException("Erro de comunicação ao consultar o serviço NASA EONET.", ex);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Erro de desserialização JSON ao consultar NASA EONET API.");
                throw new ServicoIndisponivelException("Erro ao processar a resposta do serviço NASA EONET.", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao consultar NASA EONET API.");
                throw;
            }
        }
    }
}