package br.com.fiap.gs.gsapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // Mapeia esta exceção para o status HTTP 404 Not Found
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Construtor que aceita uma mensagem para a exceção.
     * @param message A mensagem detalhando a causa da exceção.
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Construtor que aceita uma mensagem e a causa original da exceção.
     * @param message A mensagem detalhando a causa da exceção.
     * @param cause A causa original (outra exceção que levou a esta).
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}