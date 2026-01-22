package br.com.fiap.gs.gsapi.dto.response; // Ajuste o pacote conforme sua estrutura

import br.com.fiap.gs.gsapi.model.Eonet; // Import necessário para o construtor
import java.time.OffsetDateTime;

public class EonetResponseDTO {

    private Long idEonet; // ID interno do seu banco
    private String json;
    private OffsetDateTime data;
    private String eonetIdApi; // ID da API da NASA

    // Construtor Padrão
    public EonetResponseDTO() {
    }

    // Construtor para facilitar a conversão da Entidade para DTO
    public EonetResponseDTO(Eonet eonet) {
        this.idEonet = eonet.getIdEonet();
        this.json = eonet.getJson(); // Pode ser necessário truncar ou tratar se for muito grande para logs
        this.data = eonet.getData();
        this.eonetIdApi = eonet.getEonetIdApi();
    }

    // Getters e Setters
    public Long getIdEonet() {
        return idEonet;
    }

    public void setIdEonet(Long idEonet) {
        this.idEonet = idEonet;
    }

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