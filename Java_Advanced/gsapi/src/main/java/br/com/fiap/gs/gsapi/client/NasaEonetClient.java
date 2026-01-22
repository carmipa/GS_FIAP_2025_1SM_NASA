// Arquivo: src/main/java/br/com/fiap/gs/gsapi/client/NasaEonetClient.java
package br.com.fiap.gs.gsapi.client;

import br.com.fiap.gs.gsapi.dto.external.NasaEonetApiResponseDTO;
import br.com.fiap.gs.gsapi.dto.external.NasaEonetEventDTO;
import br.com.fiap.gs.gsapi.exception.ServiceUnavailableException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;

@Component
public class NasaEonetClient {

    private static final Logger logger = LoggerFactory.getLogger(NasaEonetClient.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${nasa.eonet.api.url:https://eonet.gsfc.nasa.gov/api/v3/events}")
    private String eonetApiUrl;

    @Autowired
    public NasaEonetClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Consulta eventos do EONET, podendo filtrar por categoria, data, etc.
     * Para buscar TODAS as categorias, chame SEM o parâmetro categoryId (null ou vazio).
     */
    public NasaEonetApiResponseDTO getEvents(Integer limit, Integer days, String status, String source,
                                             String bbox, String startDate, String endDate, String categoryId) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(eonetApiUrl);

        if (limit != null && limit > 0) {
            uriBuilder.queryParam("limit", limit);
        }

        if (StringUtils.hasText(startDate)) {
            uriBuilder.queryParam("start", startDate);
        }
        if (StringUtils.hasText(endDate)) {
            uriBuilder.queryParam("end", endDate);
        } else if (days != null && days > 0) {
            uriBuilder.queryParam("days", days);
        }

        if (StringUtils.hasText(status)) {
            uriBuilder.queryParam("status", status);
        }
        if (StringUtils.hasText(source)) {
            uriBuilder.queryParam("source", source);
        }
        if (StringUtils.hasText(bbox)) {
            uriBuilder.queryParam("bbox", bbox);
        }
        // Só filtra categoria se estiver presente!
        if (StringUtils.hasText(categoryId)) {
            uriBuilder.queryParam("category", categoryId);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "GSAPI_Fiap_Project/1.0 (gs.metamind@fiap.com.br)");

        HttpEntity<String> entity = new HttpEntity<>(headers);
        String url = uriBuilder.toUriString();
        logger.info("Consultando NASA EONET API: {}", url);

        try {
            ResponseEntity<String> responseAsString = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (responseAsString.getStatusCode().is2xxSuccessful() && responseAsString.getBody() != null) {
                String jsonResponse = responseAsString.getBody();
                logger.info("Resposta BRUTA da NASA EONET API para URL '{}':\n{}", url, jsonResponse.substring(0, Math.min(jsonResponse.length(), 1000)) + (jsonResponse.length() > 1000 ? "..." : ""));

                NasaEonetApiResponseDTO apiResponse = objectMapper.readValue(jsonResponse, NasaEonetApiResponseDTO.class);

                logger.info("Resposta DESSERIALIZADA da NASA EONET API para '{}': {} eventos retornados.", url,
                        apiResponse.getEvents() != null ? apiResponse.getEvents().size() : 0);

                if (apiResponse.getEvents() != null) {
                    apiResponse.getEvents().forEach(eventDto -> {
                        if (eventDto.getGeometry() == null || eventDto.getGeometry().isEmpty()) {
                            // logger.warn("Evento DTO (ID: {}) desserializado SEM geometrias ou com geometrias vazias.", eventDto.getId());
                        }
                    });
                }
                return apiResponse;
            } else {
                logger.error("Erro ao consultar NASA EONET API. URL: {}, Status: {}", url, responseAsString.getStatusCode());
                throw new ServiceUnavailableException("Serviço NASA EONET retornou status: " + responseAsString.getStatusCode());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("Erro HTTP ao consultar NASA EONET API. URL: {}, Status: {}, Body: {}", url, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new ServiceUnavailableException("Erro ao comunicar com o serviço NASA EONET: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Erro inesperado ao consultar ou processar resposta da NASA EONET API. URL: {}: {}", url, e.getMessage(), e);
            throw new ServiceUnavailableException("Erro inesperado ao processar consulta à NASA EONET.", e);
        }
    }

    /**
     * Exemplo de método para importar TODOS os eventos dos últimos 10 anos (3650 dias), sem filtro de categoria.
     * Basta chamar esse método na sua rotina de importação!
     */
    public NasaEonetApiResponseDTO getAllEventsLast10Years() {
        int days = 3650; // 10 anos
        Integer limit = null; // ou defina um valor se precisar paginar
        return getEvents(limit, days, null, null, null, null, null, null);
        // categoryId == null -> busca TUDO
    }

    public String convertEventDtoToJsonString(NasaEonetEventDTO eventDto) {
        try {
            return objectMapper.writeValueAsString(eventDto);
        } catch (Exception e) {
            logger.error("Erro ao serializar NasaEonetEventDTO para JSON String: ID {}", eventDto != null ? eventDto.getId() : "null", e);
            return "{\"error\":\"Falha ao serializar evento para JSON\"}";
        }
    }
}
