package br.com.fiap.gs.gsapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
// Não precisamos mais importar RestTemplateBuilder, RestTemplate, ou @Bean aqui para o restTemplate
// import org.springframework.boot.web.client.RestTemplateBuilder;
// import org.springframework.context.annotation.Bean;
// import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableCaching
public class GsapiApplication {

	public static void main(String[] args) {
		SpringApplication.run(GsapiApplication.class, args);
	}

	// O BEAN RestTemplate FOI REMOVIDO DESTA CLASSE.
	// Ele já está definido em AppConfig.java com mais configurações.
    /*
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }
    */
}