// File: gsApi/services/ViaCepClient.cs
using gsApi.dto.response;
using gsApi.DTOs.Response;
using gsApi.exceptions;
using gsApi.Exceptions;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json; // Para ReadFromJsonAsync
using System.Text.Json;
using System.Threading.Tasks;

namespace gsApi.services
{
    /// <summary>
    /// Cliente para interagir com a API do ViaCEP para consulta de endereços por CEP.
    /// </summary>
    public class ViaCepClient : IViaCepClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ViaCepClient> _logger;

        /// <summary>
        /// Construtor do ViaCepClient.
        /// </summary>
        /// <param name="httpClient">Instância de HttpClient configurada (com BaseAddress para ViaCEP).</param>
        /// <param name="logger">Instância do logger.</param>
        public ViaCepClient(HttpClient httpClient, ILogger<ViaCepClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            if (_httpClient.BaseAddress == null)
            {
                _logger.LogCritical("ViaCepClient: HttpClient BaseAddress não foi configurado. Verifique a configuração do serviço no Program.cs e a URL base no appsettings.json (ExternalServices:ViaCep:BaseUrl).");
                // É crucial que o BaseAddress seja configurado no Program.cs
                // throw new InvalidOperationException("BaseAddress do HttpClient para ViaCepClient não está configurado.");
            }
        }

        /// <summary>
        /// Obtém informações de endereço para um determinado CEP.
        /// </summary>
        /// <param name="cep">O CEP a ser consultado (pode conter hífen ou ser apenas números).</param>
        /// <returns>Um <see cref="ViaCepResponseDto"/> com os dados do endereço se encontrado; caso contrário, null.</returns>
        /// <exception cref="ServicoIndisponivelException">Se ocorrer um erro na comunicação com o serviço ViaCEP ou no processamento da resposta.</exception>
        /// <exception cref="InvalidOperationException">Se o BaseAddress do HttpClient não estiver configurado.</exception>
        public async Task<ViaCepResponseDto?> GetEnderecoByCepAsync(string cep)
        {
            if (string.IsNullOrWhiteSpace(cep))
            {
                _logger.LogWarning("VIA_CEP_CLIENT: Tentativa de buscar CEP nulo ou vazio.");
                return null;
            }

            if (_httpClient.BaseAddress == null)
            {
                // Lançar exceção aqui se o BaseAddress não estiver configurado,
                // pois a chamada subsequente com URI relativa falhará.
                var errorMsg = "VIA_CEP_CLIENT: BaseAddress do HttpClient não configurado para ViaCepClient. Não é possível fazer a requisição.";
                _logger.LogCritical(errorMsg);
                throw new InvalidOperationException(errorMsg);
            }

            var cepFormatado = new string(cep.Where(char.IsDigit).ToArray());
            _logger.LogDebug("VIA_CEP_CLIENT: CEP original '{OriginalCep}', CEP formatado '{CepFormatado}'.", cep, cepFormatado);

            if (cepFormatado.Length != 8)
            {
                _logger.LogWarning("VIA_CEP_CLIENT: CEP formatado '{CepFormatado}' (original: '{OriginalCep}') não possui 8 dígitos.", cepFormatado, cep);
                return null;
            }

            var requestUri = $"{cepFormatado}/json/"; // URI Relativa
            _logger.LogInformation("VIA_CEP_CLIENT: Consultando ViaCEP. URI Relativa: '{RequestUri}', BaseAddress: '{BaseAddress}'", requestUri, _httpClient.BaseAddress);

            try
            {
                var response = await _httpClient.GetAsync(requestUri);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogDebug("VIA_CEP_CLIENT: Resposta do ViaCEP - Status: {StatusCode}, Conteúdo (primeiros 500 chars): {ResponseContentSnippet}", response.StatusCode, responseContent.Length > 500 ? responseContent.Substring(0, 500) : responseContent);

                if (response.IsSuccessStatusCode)
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    ViaCepResponseDto? viaCepDto = null;
                    try
                    {
                        viaCepDto = JsonSerializer.Deserialize<ViaCepResponseDto>(responseContent, options);
                    }
                    catch (JsonException jsonEx)
                    {
                        _logger.LogError(jsonEx, "VIA_CEP_CLIENT: Erro de desserialização JSON para CEP '{CepFormatado}'. Conteúdo da Resposta: {ResponseContent}", cepFormatado, responseContent);
                        throw new ServicoIndisponivelException($"Erro ao processar a resposta (JSON inválido) do ViaCEP para o CEP {cepFormatado}.", jsonEx);
                    }

                    if (viaCepDto != null && viaCepDto.Erro)
                    {
                        _logger.LogInformation("VIA_CEP_CLIENT: CEP '{CepFormatado}' não encontrado no ViaCEP (serviço retornou 'erro: true').", cepFormatado);
                        return null;
                    }

                    if (viaCepDto == null)
                    {
                        _logger.LogWarning("VIA_CEP_CLIENT: Resposta do ViaCEP desserializada para null, mas com status de sucesso, para CEP '{CepFormatado}'. Conteúdo: {ResponseContent}", cepFormatado, responseContent);
                        return null;
                    }

                    _logger.LogInformation("VIA_CEP_CLIENT: Dados do CEP '{CepFormatado}' obtidos com sucesso do ViaCEP.", cepFormatado);
                    return viaCepDto;
                }
                else
                {
                    _logger.LogError("VIA_CEP_CLIENT: Erro ao consultar ViaCEP para CEP '{CepFormatado}'. Status: {StatusCode}, Resposta: {ResponseContent}",
                        cepFormatado, response.StatusCode, responseContent);
                    throw new ServicoIndisponivelException($"Serviço ViaCEP retornou status HTTP: {response.StatusCode}.");
                }
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("BaseAddress must be set"))
            {
                // Este catch é para o caso do BaseAddress ser verificado novamente aqui, mas a checagem no topo do método já deveria pegar.
                _logger.LogCritical(ex, "VIA_CEP_CLIENT: Tentativa de chamada HTTP sem BaseAddress configurado para CEP {CepFormatado}.", cepFormatado);
                throw; // Relança a exceção original
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "VIA_CEP_CLIENT: Erro de HttpRequest (rede/DNS?) ao consultar ViaCEP para CEP '{CepFormatado}'. HttpClient BaseAddress: {BaseAddress}", cepFormatado, _httpClient.BaseAddress);
                throw new ServicoIndisponivelException($"Erro de comunicação ao consultar o ViaCEP para o CEP {cepFormatado}. Verifique a conexão ou a URL base do serviço.", ex);
            }
            catch (ServicoIndisponivelException) { throw; } // Relança exceções já tratadas e específicas do serviço
            catch (Exception ex)
            {
                _logger.LogError(ex, "VIA_CEP_CLIENT: Erro inesperado ao consultar ViaCEP para CEP '{CepFormatado}'.", cepFormatado);
                throw new ServicoIndisponivelException($"Ocorreu um erro inesperado ao tentar consultar o ViaCEP para o CEP {cepFormatado}.", ex);
            }
        }
    }
}