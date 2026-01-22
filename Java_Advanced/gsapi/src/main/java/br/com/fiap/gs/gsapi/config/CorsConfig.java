// Pacote: br.com.fiap.gs.gsapi.config
package br.com.fiap.gs.gsapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final Environment environment;

    // Origens permitidas para produção (leia do application.properties)
    // Ex: cors.production.allowed.origins=https://meufrontend.com,https://outrofrontend.com
    @Value("${cors.production.allowed.origins:}")
    private String[] productionAllowedOrigins;

    // Origens permitidas para desenvolvimento (pode ser fixo ou também configurável)
    @Value("${cors.development.allowed.origins:http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001}")
    private String[] developmentAllowedOrigins;

    public CorsConfig(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        boolean isProdProfileActive = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        String[] allowedOriginsToUse;

        if (isProdProfileActive) {
            System.out.println(">>>>>>>>>> CARREGANDO CONFIGURAÇÃO DE CORS PARA PRODUÇÃO <<<<<<<<<<");
            if (productionAllowedOrigins != null && productionAllowedOrigins.length > 0 &&
                    Arrays.stream(productionAllowedOrigins).anyMatch(origin -> origin != null && !origin.trim().isEmpty())) {
                allowedOriginsToUse = Arrays.stream(productionAllowedOrigins)
                        .filter(origin -> origin != null && !origin.trim().isEmpty())
                        .toArray(String[]::new);
                System.out.println("Allowed Origins (prod): " + String.join(", ", allowedOriginsToUse));
            } else {
                System.out.println("WARN: Nenhuma origem de produção VÁLIDA configurada para CORS (cors.production.allowed.origins). CORS estará altamente restrito.");
                // Por segurança, defina um fallback restrito ou nenhuma origem se não configurado
                allowedOriginsToUse = new String[]{}; // Ou uma URL de fallback muito específica
            }
        } else {
            System.out.println(">>>>>>>>>> CARREGANDO CONFIGURAÇÃO DE CORS PARA DESENVOLVIMENTO/PADRÃO <<<<<<<<<<");
            allowedOriginsToUse = developmentAllowedOrigins;
            System.out.println("Allowed Origins (dev/default): " + String.join(", ", allowedOriginsToUse));
        }

        if (allowedOriginsToUse.length > 0) {
            registry.addMapping("/**") // Aplica a todas as rotas da API
                    .allowedOrigins(allowedOriginsToUse)
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                    .allowedHeaders("*") // Permite todos os cabeçalhos
                    .allowCredentials(true) // Importante se você usar cookies ou autenticação baseada em sessão
                    .maxAge(3600); // Tempo em segundos que o resultado de uma requisição pre-flight OPTIONS pode ser cacheado
        } else if (isProdProfileActive) {
            // Se em produção e nenhuma origem válida foi configurada, não adicione nenhum mapping de CORS
            // ou adicione um muito restritivo para bloquear por padrão.
            System.out.println("WARN: CORS em produção está bloqueado pois nenhuma origem válida foi configurada.");
        }
    }

    // Alternativamente, você pode usar um CorsFilter Bean se preferir uma configuração mais programática
    // ou se precisar de mais controle sobre a ordem dos filtros.
    // @Bean
    // public CorsFilter corsFilter() {
    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     CorsConfiguration config = new CorsConfiguration();
    //     config.setAllowCredentials(true);
    //
    //     boolean isProdProfileActive = Arrays.asList(environment.getActiveProfiles()).contains("prod");
    //     if (isProdProfileActive && productionAllowedOrigins != null && productionAllowedOrigins.length > 0) {
    //         config.setAllowedOrigins(Arrays.asList(productionAllowedOrigins));
    //     } else {
    //         config.setAllowedOrigins(Arrays.asList(developmentAllowedOrigins)); // Ou use allowedOriginPatterns
    //     }
    //
    //     config.addAllowedHeader("*");
    //     config.addAllowedMethod("*"); // GET, POST, PUT, DELETE, etc.
    //     source.registerCorsConfiguration("/**", config);
    //     return new CorsFilter(source);
    // }
}
