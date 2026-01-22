package br.com.fiap.gs.gsapi.dto.response;

import br.com.fiap.gs.gsapi.model.Contato; // Import da entidade

public class ContatoResponseDTO {
    private Long idContato;
    private String ddd;
    private String telefone;
    private String celular;
    private String whatsapp;
    private String email;
    private String tipoContato;

    public ContatoResponseDTO() {}

    // CONSTRUTOR ADICIONADO que aceita a entidade Contato
    public ContatoResponseDTO(Contato contato) {
        if (contato != null) {
            this.idContato = contato.getIdContato();
            this.ddd = contato.getDdd();
            this.telefone = contato.getTelefone();
            this.celular = contato.getCelular();
            this.whatsapp = contato.getWhatsapp();
            this.email = contato.getEmail();
            this.tipoContato = contato.getTipoContato();
        }
    }

    // Construtor com todos os campos (mantido se usado em outro lugar)
    public ContatoResponseDTO(Long idContato, String ddd, String telefone, String celular, String whatsapp, String email, String tipoContato) {
        this.idContato = idContato;
        this.ddd = ddd;
        this.telefone = telefone;
        this.celular = celular;
        this.whatsapp = whatsapp;
        this.email = email;
        this.tipoContato = tipoContato;
    }

    // Getters e Setters
    public Long getIdContato() { return idContato; }
    public void setIdContato(Long idContato) { this.idContato = idContato; }
    public String getDdd() { return ddd; }
    public void setDdd(String ddd) { this.ddd = ddd; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getCelular() { return celular; }
    public void setCelular(String celular) { this.celular = celular; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTipoContato() { return tipoContato; }
    public void setTipoContato(String tipoContato) { this.tipoContato = tipoContato; }
}