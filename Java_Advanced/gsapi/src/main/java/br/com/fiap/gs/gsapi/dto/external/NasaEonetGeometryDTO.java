package br.com.fiap.gs.gsapi.dto.external; // Pacote correto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NasaEonetGeometryDTO {
    @JsonProperty("date")
    private OffsetDateTime date;
    @JsonProperty("type")
    private String type;
    @JsonProperty("coordinates")
    private List<Object> coordinates;

    public NasaEonetGeometryDTO() {}
    // Getters e Setters
    public OffsetDateTime getDate() { return date; }
    public void setDate(OffsetDateTime date) { this.date = date; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public List<Object> getCoordinates() { return coordinates; }
    public void setCoordinates(List<Object> coordinates) { this.coordinates = coordinates; }
    @Override
    public String toString() {
        return "NasaEonetGeometryDTO{" + "date=" + date + ", type='" + type + '\'' + ", coordinates=" + coordinates + '}';
    }
}