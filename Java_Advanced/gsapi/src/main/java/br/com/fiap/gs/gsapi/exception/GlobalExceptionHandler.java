package br.com.fiap.gs.gsapi.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        logger.warn("[GlobalExceptionHandler] Recurso não encontrado: URI={}, Mensagem={}", request.getDescription(false).replace("uri=", ""), ex.getMessage());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString()); // Padronizar para String
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, WebRequest request) {
        logger.warn("[GlobalExceptionHandler] Erro de validação nos argumentos: URI={}, Mensagem={}", request.getDescription(false).replace("uri=", ""), ex.getMessage());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request - Validation Error");
        body.put("path", request.getDescription(false).replace("uri=", ""));
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.toList());
        body.put("messages", errors); // Mantido como "messages" para consistência com seu original
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        logger.warn("[GlobalExceptionHandler] Argumento ilegal ou requisição inválida: URI={}, Mensagem={}", request.getDescription(false).replace("uri=", ""), ex.getMessage());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Object> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {
        logger.warn("[GlobalExceptionHandler] Estado ilegal para a operação: URI={}, Mensagem={}", request.getDescription(false).replace("uri=", ""), ex.getMessage());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Object> handleServiceUnavailableException(
            ServiceUnavailableException ex, WebRequest request) {
        // Loga a mensagem e a causa da exceção original para depuração interna
        logger.error("[GlobalExceptionHandler] Serviço externo indisponível ou erro de comunicação: URI={}, DetalhesInternos={}", request.getDescription(false).replace("uri=", ""), ex.getMessage(), ex.getCause());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        body.put("error", "Service Unavailable");
        // Mensagem mais genérica para o cliente (boa prática para produção)
        body.put("message", "O serviço solicitado está temporariamente indisponível. Por favor, tente novamente mais tarde.");
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(body, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Object> handleTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        String paramName = ex.getName();
        Object paramValue = ex.getValue();
        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "Desconhecido";

        String logMessage = String.format(
                "Falha na conversão de tipo do parâmetro da requisição: URI=%s, NomeParam='%s', ValorRecebido='%s', TipoEsperado='%s'. Erro: %s",
                request.getDescription(false).replace("uri=", ""), paramName, paramValue, requiredType, ex.getMessage()
        );
        logger.warn("[GlobalExceptionHandler] {}", logMessage);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request - Invalid Parameter Type");
        body.put("message", "O valor '" + paramValue + "' fornecido para o parâmetro '" + paramName + "' não é válido. Tipo esperado: " + requiredType + ".");
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Object> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex, WebRequest request) {
        logger.warn("[GlobalExceptionHandler] Parâmetro obrigatório da requisição ausente: URI={}, Mensagem={}", request.getDescription(false).replace("uri=", ""), ex.getMessage());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request - Missing Parameter");
        body.put("message", "O parâmetro obrigatório '" + ex.getParameterName() + "' do tipo '" + ex.getParameterType() + "' não foi encontrado na requisição.");
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class) // Handler genérico para outros erros 500
    public ResponseEntity<Object> handleGenericException(
            Exception ex, WebRequest request) {
        // Adicionando a URI ao log para melhor rastreabilidade, e logando o stack trace completo.
        logger.error("[GlobalExceptionHandler] Erro inesperado na aplicação: URI={}", request.getDescription(false).replace("uri=", ""), ex);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde ou contate o suporte se o problema persistir.");
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}