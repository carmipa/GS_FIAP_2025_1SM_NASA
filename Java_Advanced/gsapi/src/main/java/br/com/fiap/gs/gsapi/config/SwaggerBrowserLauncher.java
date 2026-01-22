// Pacote: br.com.fiap.gs.gsapi.config
package br.com.fiap.gs.gsapi.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Componente para abrir automaticamente o Swagger UI no navegador
 * quando a aplicação inicia em um perfil de desenvolvimento.
 */
@Configuration
@Profile("dev") // Ativa este componente apenas quando o perfil 'dev' estiver ativo
public class SwaggerBrowserLauncher {

    private static final Logger log = LoggerFactory.getLogger(SwaggerBrowserLauncher.class);

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    // O caminho padrão do Swagger UI é geralmente /swagger-ui/index.html ou /swagger-ui.html
    // Verifique a propriedade springdoc.swagger-ui.path se você a customizou
    @Value("${springdoc.swagger-ui.path:/swagger-ui.html}")
    private String swaggerUiPath;

    @Value("${app.launch-swagger-on-startup:true}") // Propriedade customizada para controlar o lançamento
    private boolean launchSwaggerOnStartup;

    @EventListener(ApplicationReadyEvent.class)
    public void launchBrowserOnStartup() {
        if (!launchSwaggerOnStartup) {
            log.info("Abertura automática do Swagger UI no navegador está desabilitada via app.launch-swagger-on-startup=false.");
            return;
        }

        // Constrói a URL completa, garantindo que o contextPath seja tratado corretamente
        String effectiveContextPath = (contextPath == null || "/".equals(contextPath)) ? "" : contextPath;
        String effectiveSwaggerUiPath = swaggerUiPath.startsWith("/") ? swaggerUiPath : "/" + swaggerUiPath;

        String url = "http://localhost:" + serverPort + effectiveContextPath + effectiveSwaggerUiPath;
        log.info("Tentando abrir o Swagger UI em: {}", url);

        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            try {
                Desktop.getDesktop().browse(new URI(url));
                log.info("Navegador aberto com sucesso na URL do Swagger UI: {}", url);
            } catch (IOException | URISyntaxException e) {
                log.error("Erro ao tentar abrir o navegador para o Swagger UI (URL: {}): {}", url, e.getMessage(), e);
            }
        } else {
            log.warn("Abertura automática do navegador não é suportada neste ambiente. Acesse manualmente: {}", url);
        }
    }
}
