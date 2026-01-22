package br.com.fiap.gs.gsapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EnderecoGeoRequestDTO {

    @NotBlank(message = "Logradouro é obrigatório para geocodificação.")
    @Size(max = 255)
    private String logradouro;

    @Size(max = 10) // Número pode ser opcional ou parte do logradouro para Nominatim
    private String numero;

    @NotBlank(message = "Cidade (Localidade) é obrigatória para geocodificação.")
    @Size(max = 100)
    private String cidade; // Localidade

    @NotBlank(message = "UF (Estado) é obrigatória para geocodificação.")
    @Size(min = 2, max = 2)
    private String uf;

    @Size(max = 100) // Bairro pode ajudar na precisão
    private String bairro;

    @Size(max = 9) // CEP pode ajudar na precisão
    private String cep;

    // Construtor padrão
    public EnderecoGeoRequestDTO() {}

    // Getters e Setters
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
}