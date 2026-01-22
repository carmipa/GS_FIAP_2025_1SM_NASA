package br.com.fiap.gs.gsapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;


public class EnderecoRequestDTO {

    @NotBlank(message = "O CEP não pode estar em branco.")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "O CEP deve estar no formato XXXXX-XXX ou XXXXXXXX.")
    private String cep;

    @NotNull(message = "O número não pode ser nulo.")
    // @Digits(integer = 5, fraction = 0, message = "O número deve ser um inteiro de até 5 dígitos.") // Se fosse string
    private Integer numero; // NUMBER(5)

    @NotBlank(message = "O logradouro não pode estar em branco.")
    @Size(max = 255, message = "O logradouro não pode exceder 255 caracteres.")
    private String logradouro;

    @NotBlank(message = "O bairro não pode estar em branco.")
    @Size(max = 255, message = "O bairro não pode exceder 255 caracteres.")
    private String bairro;

    @NotBlank(message = "A localidade (cidade) não pode estar em branco.")
    @Size(max = 100, message = "A localidade não pode exceder 100 caracteres.")
    private String localidade;

    @NotBlank(message = "A UF não pode estar em branco.")
    @Size(min = 2, max = 2, message = "A UF deve ter 2 caracteres.")
    private String uf;

    @NotBlank(message = "O complemento não pode estar em branco.") // DDL diz NOT NULL
    @Size(max = 255, message = "O complemento não pode exceder 255 caracteres.")
    private String complemento;

    // Latitude e Longitude serão preenchidas pelo ViaCEP/outra API,
    // então não são obrigatórias na requisição inicial do usuário,
    // mas podem ser enviadas se já conhecidas.
    @NotNull(message = "Latitude não pode ser nula.")
    @Digits(integer = 3, fraction = 7, message = "Latitude inválida.") // ex: -90.1234567
    private Double latitude;

    @NotNull(message = "Longitude não pode ser nula.")
    @Digits(integer = 4, fraction = 7, message = "Longitude inválida.") // ex: -180.1234567
    private Double longitude;


    // Getters e Setters
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getLocalidade() { return localidade; }
    public void setLocalidade(String localidade) { this.localidade = localidade; }
    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}