package br.com.fiap.gs.gsapi.dto.response; // Ou br.com.fiap.gs.gsapi.dto.geo

public class GeoCoordinatesDTO {
    private double latitude;
    private double longitude;
    private String matchedAddress; // O endereço que o serviço de geocodificação identificou

    public GeoCoordinatesDTO() {
    }

    public GeoCoordinatesDTO(double latitude, double longitude, String matchedAddress) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.matchedAddress = matchedAddress;
    }

    // Getters e Setters
    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getMatchedAddress() {
        return matchedAddress;
    }

    public void setMatchedAddress(String matchedAddress) {
        this.matchedAddress = matchedAddress;
    }

    @Override
    public String toString() {
        return "GeoCoordinatesDTO{" +
                "latitude=" + latitude +
                ", longitude=" + longitude +
                ", matchedAddress='" + matchedAddress + '\'' +
                '}';
    }
}