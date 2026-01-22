// Pacote: br.com.fiap.gs.gsapi.config
package br.com.fiap.gs.gsapi.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // Configura o RestTemplate com um timeout e um interceptor para logging (opcional)
        // BufferingClientHttpRequestFactory é útil se você quiser logar o corpo da requisição/resposta
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());

        return builder
                .requestFactory(() -> new BufferingClientHttpRequestFactory(requestFactory))
                // .additionalInterceptors(new LoggingClientHttpRequestInterceptor()) // Crie esta classe se quiser logar
                .build();
    }

    @Bean
    public WebClient.Builder webClientBuilder() {
        // Configurações padrão para o WebClient.Builder, se necessário
        // Ex: timeouts, codecs, etc. podem ser configurados aqui globalmente
        // ou no momento da construção do WebClient específico.
        return WebClient.builder();
    }
}
