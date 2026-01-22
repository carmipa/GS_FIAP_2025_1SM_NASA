package br.com.fiap.gs.gsapi.client;

// Correção: Importar ViaCepResponseDTO do pacote 'response' conforme sua estrutura
import br.com.fiap.gs.gsapi.dto.response.ViaCepResponseDTO;
import br.com.fiap.gs.gsapi.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class ViaCepClient {

    private static final Logger logger = LoggerFactory.getLogger(ViaCepClient.class);
    private final RestTemplate restTemplate;

    @Value("${viacep.api.url:https://viacep.com.br/ws}")
    private String viaCepApiUrl;

    @Autowired
    public ViaCepClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ViaCepResponseDTO buscarEnderecoPorCep(String cep) {
        if (cep == null || cep.trim().isEmpty()) {
            throw new IllegalArgumentException("CEP não pode ser nulo ou vazio.");
        }
        String cepFormatado = cep.replaceAll("[^0-9]", "");
        if (cepFormatado.length() != 8) {
            throw new IllegalArgumentException("CEP deve conter 8 dígitos numéricos.");
        }

        String url = String.format("%s/%s/json/", viaCepApiUrl, cepFormatado);
        logger.info("Consultando ViaCEP: {}", url);

        try {
            ResponseEntity<ViaCepResponseDTO> response = restTemplate.getForEntity(url, ViaCepResponseDTO.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                if (response.getBody().isErro()) {
                    logger.warn("CEP {} não encontrado no ViaCEP.", cepFormatado);
                    return null;
                }
                logger.info("Resposta do ViaCEP para {}: {}", cepFormatado, response.getBody());
                return response.getBody();
            } else {
                logger.error("Erro ao consultar ViaCEP para {}. Status: {}", cepFormatado, response.getStatusCode());
                throw new ServiceUnavailableException("Serviço ViaCEP retornou status: " + response.getStatusCode());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("Erro HTTP ao consultar ViaCEP para {}: {} - {}", cepFormatado, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new ServiceUnavailableException("Erro ao comunicar com o serviço ViaCEP: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Erro inesperado ao consultar ViaCEP para {}: {}", cepFormatado, e.getMessage(), e);
            throw new ServiceUnavailableException("Erro inesperado ao processar consulta ao ViaCEP.", e);
        }
    }
}