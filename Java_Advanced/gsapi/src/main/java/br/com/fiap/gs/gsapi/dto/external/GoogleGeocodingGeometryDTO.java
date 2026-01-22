package br.com.fiap.gs.gsapi.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleGeocodingGeometryDTO {

    @JsonProperty("location")
    private GoogleGeocodingLocationDTO location;

    public GoogleGeocodingGeometryDTO() {
    }

    // Getters e Setters
    public GoogleGeocodingLocationDTO getLocation() {
        return location;
    }
    public void setLocation(GoogleGeocodingLocationDTO location) {
        this.location = location;
    }
}