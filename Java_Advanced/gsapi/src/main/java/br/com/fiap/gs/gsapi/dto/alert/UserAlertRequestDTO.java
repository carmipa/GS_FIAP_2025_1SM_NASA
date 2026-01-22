// Pacote: br.com.fiap.gs.gsapi.dto.alert
package br.com.fiap.gs.gsapi.dto.alert;

import jakarta.validation.constraints.NotNull;

public class UserAlertRequestDTO {

    @NotNull(message = "O ID do usuário não pode ser nulo.")
    private Long userId;

    @NotNull(message = "Os detalhes do evento não podem ser nulos.")
    private AlertableEventDTO eventDetails;

    // Construtores, Getters e Setters

    public UserAlertRequestDTO() {
    }

    public UserAlertRequestDTO(Long userId, AlertableEventDTO eventDetails) {
        this.userId = userId;
        this.eventDetails = eventDetails;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public AlertableEventDTO getEventDetails() {
        return eventDetails;
    }

    public void setEventDetails(AlertableEventDTO eventDetails) {
        this.eventDetails = eventDetails;
    }
}