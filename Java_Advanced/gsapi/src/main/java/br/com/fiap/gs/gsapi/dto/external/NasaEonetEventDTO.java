package br.com.fiap.gs.gsapi.dto.external; // Pacote correto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NasaEonetEventDTO {
    @JsonProperty("id")
    private String id;
    @JsonProperty("title")
    private String title;
    @JsonProperty("description")
    private String description;
    @JsonProperty("link")
    private String link;
    @JsonProperty("categories")
    private List<NasaEonetCategoryDTO> categories;
    @JsonProperty("sources")
    private List<NasaEonetSourceDTO> sources;
    @JsonProperty("geometry")
    private List<NasaEonetGeometryDTO> geometry;

    public NasaEonetEventDTO() {}
    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public List<NasaEonetCategoryDTO> getCategories() { return categories; }
    public void setCategories(List<NasaEonetCategoryDTO> categories) { this.categories = categories; }
    public List<NasaEonetSourceDTO> getSources() { return sources; }
    public void setSources(List<NasaEonetSourceDTO> sources) { this.sources = sources; }
    public List<NasaEonetGeometryDTO> getGeometry() { return geometry; }
    public void setGeometry(List<NasaEonetGeometryDTO> geometry) { this.geometry = geometry; }
    public OffsetDateTime getPrincipalDate() {
        if (geometry != null && !geometry.isEmpty() && geometry.get(0) != null) {
            return geometry.get(0).getDate();
        }
        return null;
    }
    @Override
    public String toString() {
        return "NasaEonetEventDTO{" + "id='" + id + '\'' + ", title='" + title + '\'' + ", geometry=" + geometry + '}';
    }
}