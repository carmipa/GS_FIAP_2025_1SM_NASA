package br.com.fiap.gs.gsapi.dto.external; // Pacote correto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NasaEonetSourceDTO {
    @JsonProperty("id")
    private String id;
    @JsonProperty("url")
    private String url;

    public NasaEonetSourceDTO() {}
    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    @Override
    public String toString() {
        return "NasaEonetSourceDTO{" + "id='" + id + '\'' + ", url='" + url + '\'' + '}';
    }
}