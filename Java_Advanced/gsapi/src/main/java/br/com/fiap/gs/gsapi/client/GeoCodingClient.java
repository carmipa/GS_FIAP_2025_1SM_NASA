package br.com.fiap.gs.gsapi.client;

import br.com.fiap.gs.gsapi.dto.external.GoogleGeocodingApiResponseDTO; // DTO do Google
import br.com.fiap.gs.gsapi.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils; // Para StringUtils.hasText
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;

@Component
public class GeoCodingClient {

    private static final Logger logger = LoggerFactory.getLogger(GeoCodingClient.class);
    private final RestTemplate restTemplate;

    @Value("${google.maps.geocoding.api.url:https://maps.googleapis.com/maps/api/geocode/json}")
    private String googleApiUrl;

    @Value("${google.maps.apikey}")
    private String googleApiKey;

    // User-Agent não é estritamente necessário para Google, mas pode ser mantido para consistência
    @Value("${app.geocoding.user-agent:GSAPI_Fiap_Project/1.0 (seuemail@example.com)}")
    private String userAgent;


    @Autowired
    public GeoCodingClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Busca coordenadas usando a Google Geocoding API.
     * @param addressQuery A string de endereço completa para geocodificar.
     * @param components Filtros de componentes (ex: "country:BR|postal_code:00000000"). Opcional.
     * @param language Código de linguagem para os resultados (ex: "pt-BR"). Opcional.
     * @return GoogleGeocodingApiResponseDTO contendo os resultados.
     */
    public GoogleGeocodingApiResponseDTO buscarCoordenadasPorEnderecoGoogle(String addressQuery, String components, String language) {
        if (!StringUtils.hasText(addressQuery)) {
            throw new IllegalArgumentException("Query de endereço (addressQuery) não pode ser nula ou vazia.");
        }
        if (!StringUtils.hasText(googleApiKey)) {
            logger.error("Chave da API do Google Maps não configurada (google.maps.apikey).");
            throw new ServiceUnavailableException("Configuração da API de Geocodificação do Google ausente.");
        }

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(googleApiUrl)
                .queryParam("address", addressQuery)
                .queryParam("key", googleApiKey);

        if (StringUtils.hasText(components)) {
            uriBuilder.queryParam("components", components);
        }
        if (StringUtils.hasText(language)) {
            uriBuilder.queryParam("language", language);
        }


        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        if (StringUtils.hasText(userAgent)) { // Envia User-Agent se configurado
            headers.set("User-Agent", userAgent);
        }

        HttpEntity<String> entity = new HttpEntity<>(headers);
        String url = uriBuilder.toUriString();
        logger.info("Consultando Google Geocoding API: {}", url);

        try {
            ResponseEntity<GoogleGeocodingApiResponseDTO> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    GoogleGeocodingApiResponseDTO.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                GoogleGeocodingApiResponseDTO apiResponse = response.getBody();
                logger.info("Resposta da Google Geocoding API para query '{}': Status={}, Resultados={}",
                        addressQuery, apiResponse.getStatus(),
                        (apiResponse.getResults() != null ? apiResponse.getResults().size() : 0));

                // Não lançar exceção para "ZERO_RESULTS" aqui, deixar o serviço decidir o que fazer.
                if (!"OK".equals(apiResponse.getStatus()) && !"ZERO_RESULTS".equals(apiResponse.getStatus())) {
                    logger.error("Google Geocoding API retornou status de erro: {} - {}", apiResponse.getStatus(), apiResponse.getErrorMessage());
                    throw new ServiceUnavailableException("Google Geocoding API error: " + apiResponse.getStatus() + " - " + apiResponse.getErrorMessage());
                }
                return apiResponse;
            } else {
                logger.error("Erro ao consultar Google Geocoding API para query '{}'. Status HTTP: {}", addressQuery, response.getStatusCode());
                throw new ServiceUnavailableException("Google Geocoding API retornou status HTTP: " + response.getStatusCode());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("Erro HTTP ao consultar Google Geocoding API para query '{}': {} - {}", addressQuery, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new ServiceUnavailableException("Erro ao comunicar com o Google Geocoding API: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Erro inesperado ao consultar Google Geocoding API para query '{}': {}", addressQuery, e.getMessage(), e);
            throw new ServiceUnavailableException("Erro inesperado ao processar consulta ao Google Geocoding API.", e);
        }
    }
}