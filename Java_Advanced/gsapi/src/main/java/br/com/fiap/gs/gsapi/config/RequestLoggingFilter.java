package br.com.fiap.gs.gsapi.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse; // Importado
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper; // Para ler o corpo
import org.springframework.web.util.ContentCachingResponseWrapper; // Para ler o corpo

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Collections;
import java.util.UUID; // Para ID de requisição

@Component
@Order(1) // Executar cedo na cadeia de filtros
public class RequestLoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String requestId = UUID.randomUUID().toString().substring(0, 8); // ID curto para a requisição
        long startTime = System.currentTimeMillis();

        // Usar wrappers para permitir a leitura do corpo da requisição/resposta múltiplas vezes
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper((HttpServletRequest) request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper((HttpServletResponse) response);

        try {
            logRequestDetails(requestWrapper, requestId);
            chain.doFilter(requestWrapper, responseWrapper); // IMPORTANTE: passar os wrappers!
        } finally {
            logResponseDetails(responseWrapper, requestId, startTime);
            responseWrapper.copyBodyToResponse(); // Essencial para enviar a resposta ao cliente
        }
    }

    private void logRequestDetails(ContentCachingRequestWrapper request, String requestId) {
        StringBuilder reqLog = new StringBuilder();
        reqLog.append(String.format("[REQ_ID: %s] >>> ", requestId));
        reqLog.append(String.format("Recebida requisição: %s %s", request.getMethod(), request.getRequestURI()));
        if (request.getQueryString() != null) {
            reqLog.append("?").append(request.getQueryString());
        }
        reqLog.append(String.format(" (Origem: %s)", request.getRemoteAddr()));

        logger.info(reqLog.toString());

        // Log de Headers (opcional, pode ser muito verboso)
        // Collections.list(request.getHeaderNames()).forEach(headerName ->
        //    logger.debug(String.format("[REQ_ID: %s] Header: %s: %s", requestId, headerName, Collections.list(request.getHeaders(headerName))))
        // );

        // Log do corpo da requisição (cuidado com dados sensíveis e tamanho!)
        String requestBody = getContentAsString(request.getContentAsByteArray(), request.getCharacterEncoding());
        if (!requestBody.isEmpty() && logger.isDebugEnabled()) { // Só loga corpo em DEBUG
            logger.debug(String.format("[REQ_ID: %s] Corpo da Requisição: %s", requestId, requestBody));
        }
    }

    private void logResponseDetails(ContentCachingResponseWrapper response, String requestId, long startTime) {
        long duration = System.currentTimeMillis() - startTime;
        int status = response.getStatus();

        logger.info(String.format("[REQ_ID: %s] <<< Respondendo requisição: Status=%d, Duração=%dms", requestId, status, duration));

        // Log do corpo da resposta (cuidado com dados sensíveis e tamanho!)
        // Só tente logar o corpo se for um tipo de conteúdo "legível" e se o log DEBUG estiver ativo
        String contentType = response.getContentType();
        if (logger.isDebugEnabled() && contentType != null &&
                (contentType.contains("application/json") || contentType.contains("text/plain"))) {
            String responseBody = getContentAsString(response.getContentAsByteArray(), response.getCharacterEncoding());
            if (!responseBody.isEmpty()) {
                logger.debug(String.format("[REQ_ID: %s] Corpo da Resposta (preview): %s", requestId, responseBody.substring(0, Math.min(responseBody.length(), 500)))); // Preview
            }
        }
    }

    private String getContentAsString(byte[] contentAsByteArray, String characterEncoding) {
        if (contentAsByteArray == null || contentAsByteArray.length == 0) {
            return "";
        }
        try {
            return new String(contentAsByteArray, characterEncoding != null ? characterEncoding : "UTF-8");
        } catch (UnsupportedEncodingException e) {
            logger.warn("Falha ao decodificar o conteúdo como string usando encoding {}: {}", characterEncoding, e.getMessage());
            return "[Conteúdo não decodificável]";
        }
    }
}