// Pacote: br.com.fiap.gs.gsapi.dto.alert
package br.com.fiap.gs.gsapi.dto.alert;

import java.time.OffsetDateTime;

public class AlertableEventDTO {
    private String eventId; // Ex: ID da EONET
    private String title;
    private String eventDate; // Pode ser String formatada ou OffsetDateTime se preferir converter
    private String link;      // Link para mais detalhes sobre o evento
    private String description; // Uma breve descrição do que será enviado no alerta

    // Construtores, Getters e Setters

    public AlertableEventDTO() {
    }

    public AlertableEventDTO(String eventId, String title, String eventDate, String link, String description) {
        this.eventId = eventId;
        this.title = title;
        this.eventDate = eventDate;
        this.link = link;
        this.description = description;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getEventDate() {
        return eventDate;
    }

    public void setEventDate(String eventDate) {
        this.eventDate = eventDate;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}