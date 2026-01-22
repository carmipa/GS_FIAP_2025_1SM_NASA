package br.com.fiap.gs.gsapi.dto.response;

import br.com.fiap.gs.gsapi.model.Endereco; // Import da entidade

public class EnderecoResponseDTO {
    private Long idEndereco;
    private String cep;
    private Integer numero;
    private String logradouro;
    private String bairro;
    private String localidade;
    private String uf;
    private String complemento;
    private Double latitude;
    private Double longitude;

    public EnderecoResponseDTO() {}

    // CONSTRUTOR ADICIONADO que aceita a entidade Endereco
    public EnderecoResponseDTO(Endereco endereco) {
        if (endereco != null) {
            this.idEndereco = endereco.getIdEndereco();
            this.cep = endereco.getCep();
            this.numero = endereco.getNumero();
            this.logradouro = endereco.getLogradouro();
            this.bairro = endereco.getBairro();
            this.localidade = endereco.getLocalidade();
            this.uf = endereco.getUf();
            this.complemento = endereco.getComplemento();
            this.latitude = endereco.getLatitude();
            this.longitude = endereco.getLongitude();
        }
    }

    // Construtor com todos os campos (mantido se usado em outro lugar)
    public EnderecoResponseDTO(Long idEndereco, String cep, Integer numero, String logradouro, String bairro, String localidade, String uf, String complemento, Double latitude, Double longitude) {
        this.idEndereco = idEndereco;
        this.cep = cep;
        this.numero = numero;
        this.logradouro = logradouro;
        this.bairro = bairro;
        this.localidade = localidade;
        this.uf = uf;
        this.complemento = complemento;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters e Setters
    public Long getIdEndereco() { return idEndereco; }
    public void setIdEndereco(Long idEndereco) { this.idEndereco = idEndereco; }
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