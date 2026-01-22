// Pacote: br.com.fiap.gs.gsapi.controller.alert
package br.com.fiap.gs.gsapi.controller.alert;

import br.com.fiap.gs.gsapi.dto.alert.UserAlertRequestDTO;
import br.com.fiap.gs.gsapi.exception.ResourceNotFoundException;
import br.com.fiap.gs.gsapi.service.alert.UserSpecificAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alertas de Usuário", description = "Endpoints para disparar alertas específicos para usuários")
public class AlertTriggerController {

    private static final Logger logger = LoggerFactory.getLogger(AlertTriggerController.class);
    private final UserSpecificAlertService userSpecificAlertService;

    @Autowired
    public AlertTriggerController(UserSpecificAlertService userSpecificAlertService) {
        this.userSpecificAlertService = userSpecificAlertService;
    }

    @PostMapping("/trigger-user-specific-alert")
    @Operation(summary = "Dispara um alerta para um usuário específico sobre um evento",
            description = "Recebe o ID do usuário e detalhes de um evento, busca o contato do usuário e envia uma notificação.")
    @ApiResponse(responseCode = "200", description = "Solicitação de alerta processada (não garante o envio, verifique logs).")
    @ApiResponse(responseCode = "400", description = "Requisição inválida.")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado.")
    public ResponseEntity<String> triggerAlertForUser(@Valid @RequestBody UserAlertRequestDTO requestDTO) {
        try {
            logger.info("Recebida requisição para alertar usuário ID: {} sobre evento: {}", requestDTO.getUserId(), requestDTO.getEventDetails().getTitle());
            userSpecificAlertService.processAndSendAlert(requestDTO.getUserId(), requestDTO.getEventDetails());
            return ResponseEntity.ok("Solicitação de alerta para usuário ID " + requestDTO.getUserId() + " processada.");
        } catch (ResourceNotFoundException e) {
            logger.warn("Não foi possível processar alerta: {}", e.getMessage());
            throw e; // Deixa o GlobalExceptionHandler tratar
        } catch (Exception e) {
            logger.error("Erro inesperado ao processar solicitação de alerta para usuário ID: {}", requestDTO.getUserId(), e);
            // Pode retornar um ResponseEntity.internalServerError() ou deixar o GlobalExceptionHandler
            return ResponseEntity.internalServerError().body("Erro interno ao processar a solicitação de alerta.");
        }
    }
}