package br.com.fiap.gs.gsapi.dto.external; // Pacote correto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NasaEonetApiResponseDTO {
    @JsonProperty("title")
    private String title;
    @JsonProperty("description")
    private String description;
    @JsonProperty("link")
    private String link;
    @JsonProperty("events")
    private List<NasaEonetEventDTO> events;

    public NasaEonetApiResponseDTO() {}
    // Getters e Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public List<NasaEonetEventDTO> getEvents() { return events; }
    public void setEvents(List<NasaEonetEventDTO> events) { this.events = events; }
    @Override
    public String toString() {
        return "NasaEonetApiResponseDTO{" + "title='" + title + '\'' + ", events_count=" + (events != null ? events.size() : 0) + '}';
    }
}