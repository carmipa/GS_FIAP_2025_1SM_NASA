package br.com.fiap.gs.gsapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "tb_eonet3")
public class Eonet {

    @Id
    @SequenceGenerator(name = "eonet_seq", sequenceName = "tb_eonet3_id_eonet_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "eonet_seq")
    @Column(name = "id_eonet")
    private Long idEonet; // Mapeia para id_eonet NUMBER NOT NULL [cite: 15]

    @Lob // Indica que é um Large Object (CLOB neste caso)
    @Column(name = "json", columnDefinition = "CLOB") // Mapeia para json CLOB NULL [cite: 15]
    private String json;

    @Column(name = "data") // Mapeia para data TIMESTAMP WITH LOCAL TIME ZONE NULL [cite: 15]
    private OffsetDateTime data;

    @Column(name = "eonet_id", nullable = false, length = 50)
    private String eonetIdApi; // Mapeia para eonet_id VARCHAR2(50) NOT NULL [cite: 15]

    @ManyToMany(mappedBy = "eventosEonet", fetch = FetchType.LAZY)
    private Set<Endereco> enderecos = new HashSet<>();

    // Construtor padrão
    public Eonet() {
    }

    // Construtor para criar um novo evento EONET
    public Eonet(String json, OffsetDateTime data, String eonetIdApi) {
        this.json = json;
        this.data = data;
        this.eonetIdApi = eonetIdApi;
    }

    // Outro construtor, caso json e data sejam opcionais na criação inicial
    public Eonet(String eonetIdApi) {
        this.eonetIdApi = eonetIdApi;
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

    public Set<Endereco> getEnderecos() {
        return enderecos;
    }

    public void setEnderecos(Set<Endereco> enderecos) {
        this.enderecos = enderecos;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Eonet eonet = (Eonet) o;
        return Objects.equals(idEonet, eonet.idEonet);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idEonet);
    }

    @Override
    public String toString() {
        return "Eonet{" +
                "idEonet=" + idEonet +
                ", json='" + (json != null && json.length() > 50 ? json.substring(0, 50) + "..." : json) + '\'' +
                ", data=" + data +
                ", eonetIdApi='" + eonetIdApi + '\'' +
                '}';
    }
}