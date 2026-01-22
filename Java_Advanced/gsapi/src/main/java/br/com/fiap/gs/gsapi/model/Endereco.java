package br.com.fiap.gs.gsapi.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "tb_endereco3")
public class Endereco {

    @Id
    @SequenceGenerator(name = "endereco_seq", sequenceName = "tb_endereco3_id_endereco_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "endereco_seq")
    @Column(name = "id_endereco")
    private Long idEndereco;

    @Column(name = "cep", nullable = false, length = 9)
    private String cep;

    @Column(name = "numero", nullable = false)
    private Integer numero; // DDL: NUMBER(5)

    @Column(name = "logradouro", nullable = false, length = 255)
    private String logradouro;

    @Column(name = "bairro", nullable = false, length = 255)
    private String bairro;

    @Column(name = "localidade", nullable = false, length = 100)
    private String localidade;

    @Column(name = "uf", nullable = false, length = 2)
    private String uf;

    @Column(name = "complemento", nullable = false, length = 255)
    private String complemento;

    // CORREÇÃO APLICADA AQUI:
    @Column(name = "latitude", nullable = false, columnDefinition = "NUMBER(10,7)")
    private Double latitude;

    // CORREÇÃO APLICADA AQUI:
    @Column(name = "longitude", nullable = false, columnDefinition = "NUMBER(10,7)")
    private Double longitude;

    @ManyToMany(mappedBy = "enderecos", fetch = FetchType.LAZY)
    private Set<Cliente> clientes = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY,
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            })
    @JoinTable(name = "tb_enderecoeventos3",
            joinColumns = { @JoinColumn(name = "tb_endereco3_id_endereco") },
            inverseJoinColumns = { @JoinColumn(name = "tb_eonet3_id_eonet") })
    private Set<Eonet> eventosEonet = new HashSet<>();

    // Construtor padrão
    public Endereco() {
    }

    // Construtor para criar um novo endereço
    public Endereco(String cep, Integer numero, String logradouro, String bairro, String localidade, String uf, String complemento, Double latitude, Double longitude) {
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
    public Long getIdEndereco() {
        return idEndereco;
    }

    public void setIdEndereco(Long idEndereco) {
        this.idEndereco = idEndereco;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getLocalidade() {
        return localidade;
    }

    public void setLocalidade(String localidade) {
        this.localidade = localidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Set<Cliente> getClientes() {
        return clientes;
    }

    public void setClientes(Set<Cliente> clientes) {
        this.clientes = clientes;
    }

    public Set<Eonet> getEventosEonet() {
        return eventosEonet;
    }

    public void setEventosEonet(Set<Eonet> eventosEonet) {
        this.eventosEonet = eventosEonet;
    }

    public void addEventoEonet(Eonet evento) {
        this.eventosEonet.add(evento);
    }

    public void removeEventoEonet(Eonet evento) {
        this.eventosEonet.remove(evento);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Endereco endereco = (Endereco) o;
        return Objects.equals(idEndereco, endereco.idEndereco);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idEndereco);
    }

    @Override
    public String toString() {
        return "Endereco{" +
                "idEndereco=" + idEndereco +
                ", cep='" + cep + '\'' +
                ", numero=" + numero +
                ", logradouro='" + logradouro + '\'' +
                ", bairro='" + bairro + '\'' +
                ", localidade='" + localidade + '\'' +
                ", uf='" + uf + '\'' +
                ", complemento='" + complemento + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                '}';
    }
}