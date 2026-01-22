package br.com.fiap.gs.gsapi.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleGeocodingResultDTO {

    @JsonProperty("formatted_address")
    private String formattedAddress;

    @JsonProperty("geometry")
    private GoogleGeocodingGeometryDTO geometry;

    @JsonProperty("place_id")
    private String placeId;

    @JsonProperty("types")
    private List<String> types;

    public GoogleGeocodingResultDTO() {
    }

    // Getters e Setters
    public String getFormattedAddress() {
        return formattedAddress;
    }
    public void setFormattedAddress(String formattedAddress) {
        this.formattedAddress = formattedAddress;
    }
    public GoogleGeocodingGeometryDTO getGeometry() {
        return geometry;
    }
    public void setGeometry(GoogleGeocodingGeometryDTO geometry) {
        this.geometry = geometry;
    }
    public String getPlaceId() {
        return placeId;
    }
    public void setPlaceId(String placeId) {
        this.placeId = placeId;
    }
    public List<String> getTypes() {
        return types;
    }
    public void setTypes(List<String> types) {
        this.types = types;
    }
}