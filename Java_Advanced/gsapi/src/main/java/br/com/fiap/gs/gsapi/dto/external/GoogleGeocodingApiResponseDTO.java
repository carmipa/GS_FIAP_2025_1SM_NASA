package br.com.fiap.gs.gsapi.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleGeocodingApiResponseDTO {

    @JsonProperty("results")
    private List<GoogleGeocodingResultDTO> results;

    @JsonProperty("status")
    private String status; // Ex: "OK", "ZERO_RESULTS", etc.

    @JsonProperty("error_message")
    private String errorMessage;

    public GoogleGeocodingApiResponseDTO() {
    }

    // Getters e Setters
    public List<GoogleGeocodingResultDTO> getResults() {
        return results;
    }
    public void setResults(List<GoogleGeocodingResultDTO> results) {
        this.results = results;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getErrorMessage() {
        return errorMessage;
    }
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}