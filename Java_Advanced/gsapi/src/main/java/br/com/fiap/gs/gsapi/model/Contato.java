package br.com.fiap.gs.gsapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "tb_contato3")
public class Contato {

    @Id
    @SequenceGenerator(name = "contato_seq", sequenceName = "tb_contato3_id_contato_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "contato_seq")
    @Column(name = "id_contato")
    private Long idContato; // Mapeia para id_contato NUMBER NOT NULL [cite: 8]

    @Column(name = "ddd", nullable = false, length = 3)
    private String ddd; // Mapeia para ddd VARCHAR2(3) NOT NULL [cite: 8]

    @Column(name = "telefone", nullable = false, length = 15)
    private String telefone; // Mapeia para telefone VARCHAR2(15) NOT NULL [cite: 8]

    @Column(name = "celular", nullable = false, length = 15)
    private String celular; // Mapeia para celular VARCHAR2(15) NOT NULL [cite: 8]

    @Column(name = "whatsapp", nullable = false, length = 15)
    private String whatsapp; // Mapeia para whatsapp VARCHAR2(15) NOT NULL [cite: 8]

    @Column(name = "email", nullable = false, length = 255)
    private String email; // Mapeia para email VARCHAR2(255) NOT NULL [cite: 8]

    @Column(name = "tipo_contato", nullable = false, length = 50)
    private String tipoContato; // Mapeia para tipo_contato VARCHAR2(50) NOT NULL [cite: 8]

    @ManyToMany(mappedBy = "contatos", fetch = FetchType.LAZY)
    private Set<Cliente> clientes = new HashSet<>();

    // Construtor padrão
    public Contato() {
    }

    // Construtor para criar um novo contato
    public Contato(String ddd, String telefone, String celular, String whatsapp, String email, String tipoContato) {
        this.ddd = ddd;
        this.telefone = telefone;
        this.celular = celular;
        this.whatsapp = whatsapp;
        this.email = email;
        this.tipoContato = tipoContato;
    }

    // Getters e Setters
    public Long getIdContato() {
        return idContato;
    }

    public void setIdContato(Long idContato) {
        this.idContato = idContato;
    }

    public String getDdd() {
        return ddd;
    }

    public void setDdd(String ddd) {
        this.ddd = ddd;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTipoContato() {
        return tipoContato;
    }

    public void setTipoContato(String tipoContato) {
        this.tipoContato = tipoContato;
    }

    public Set<Cliente> getClientes() {
        return clientes;
    }

    public void setClientes(Set<Cliente> clientes) {
        this.clientes = clientes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Contato contato = (Contato) o;
        return Objects.equals(idContato, contato.idContato);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idContato);
    }

    @Override
    public String toString() {
        return "Contato{" +
                "idContato=" + idContato +
                ", ddd='" + ddd + '\'' +
                ", telefone='" + telefone + '\'' +
                ", celular='" + celular + '\'' +
                ", whatsapp='" + whatsapp + '\'' +
                ", email='" + email + '\'' +
                ", tipoContato='" + tipoContato + '\'' +
                '}';
    }
}