package br.com.fiap.gs.gsapi.dto.request; // Ajuste o pacote conforme sua estrutura

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public class EonetRequestDTO {

    // O JSON pode ser grande, então não há @Size aqui,
    // mas pode ser @NotNull se o JSON sempre for esperado na criação.
    // Se o JSON for opcional na criação, remova @NotNull.
    @NotNull(message = "O conteúdo JSON não pode ser nulo.")
    private String json; // Para o campo CLOB

    // A data do evento pode ser opcional ou obrigatória dependendo do seu caso de uso.
    // Se for obrigatória na criação:
    @NotNull(message = "A data do evento não pode ser nula.")
    private OffsetDateTime data;

    @NotBlank(message = "O ID da API EONET não pode estar em branco.")
    @Size(max = 50, message = "O ID da API EONET não pode exceder 50 caracteres.")
    private String eonetIdApi; // ID único do evento vindo da API da NASA

    // Construtor Padrão
    public EonetRequestDTO() {
    }

    // Construtor Completo (opcional)
    public EonetRequestDTO(String json, OffsetDateTime data, String eonetIdApi) {
        this.json = json;
        this.data = data;
        this.eonetIdApi = eonetIdApi;
    }

    // Getters e Setters
    public String getJson() {
        return json;
    }

    public void setJson(String json) {
        this.json = json;
    }

    public OffsetDateTime getData() {
        return data;
    }

    public void setData(OffsetDateTime data) {
        this.data = data;
    }

    public String getEonetIdApi() {
        return eonetIdApi;
    }

    public void setEonetIdApi(String eonetIdApi) {
        this.eonetIdApi = eonetIdApi;
    }
}