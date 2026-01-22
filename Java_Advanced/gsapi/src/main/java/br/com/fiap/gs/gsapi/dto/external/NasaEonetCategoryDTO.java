package br.com.fiap.gs.gsapi.dto.external; // Pacote correto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NasaEonetCategoryDTO {
    @JsonProperty("id")
    private String id;
    @JsonProperty("title")
    private String title;

    public NasaEonetCategoryDTO() {}
    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    @Override
    public String toString() {
        return "NasaEonetCategoryDTO{" + "id='" + id + '\'' + ", title='" + title + '\'' + '}';
    }
}