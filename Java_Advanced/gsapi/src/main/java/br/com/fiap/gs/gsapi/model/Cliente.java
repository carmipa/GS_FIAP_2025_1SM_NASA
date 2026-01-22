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
@Table(name = "tb_cliente3")
public class Cliente {

    @Id
    @SequenceGenerator(name = "cliente_seq", sequenceName = "tb_cliente3_id_cliente_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cliente_seq")
    @Column(name = "id_cliente")
    private Long idCliente; // Mapeia para id_cliente NUMBER NOT NULL [cite: 2]

    @Column(name = "nome", nullable = false, length = 100)
    private String nome; // Mapeia para nome VARCHAR2(100) NOT NULL [cite: 2]

    @Column(name = "sobrenome", nullable = false, length = 100)
    private String sobrenome; // Mapeia para sobrenome VARCHAR2(100) NOT NULL [cite: 1]

    @Column(name = "data_nascimento", nullable = false, length = 10)
    private String dataNascimento; // Mapeia para data_nascimento VARCHAR2(10) NOT NULL [cite: 1]

    @Column(name = "documento", nullable = false, length = 18)
    private String documento; // Mapeia para documento VARCHAR2(18) NOT NULL [cite: 1]

    @ManyToMany(fetch = FetchType.LAZY,
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            })
    @JoinTable(name = "tb_clientecontato3", // Tabela de junção [cite: 4]
            joinColumns = { @JoinColumn(name = "tb_cliente3_id_cliente") }, // FK para tb_cliente3 [cite: 4, 17]
            inverseJoinColumns = { @JoinColumn(name = "tb_contato3_id_contato") }) // FK para tb_contato3 [cite: 4, 18]
    private Set<Contato> contatos = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY,
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            })
    @JoinTable(name = "tb_clienteendereco3", // Tabela de junção [cite: 6]
            joinColumns = { @JoinColumn(name = "tb_cliente3_id_cliente") }, // FK para tb_cliente3 [cite: 6, 19]
            inverseJoinColumns = { @JoinColumn(name = "tb_endereco3_id_endereco") }) // FK para tb_endereco3 [cite: 6, 20]
    private Set<Endereco> enderecos = new HashSet<>();

    // Construtor padrão (exigido pela JPA)
    public Cliente() {
    }

    // Construtor para criar um novo cliente
    public Cliente(String nome, String sobrenome, String dataNascimento, String documento) {
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.dataNascimento = dataNascimento;
        this.documento = documento;
    }

    // Getters e Setters
    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getSobrenome() {
        return sobrenome;
    }

    public void setSobrenome(String sobrenome) {
        this.sobrenome = sobrenome;
    }

    public String getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(String dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public Set<Contato> getContatos() {
        return contatos;
    }

    public void setContatos(Set<Contato> contatos) {
        this.contatos = contatos;
    }

    public Set<Endereco> getEnderecos() {
        return enderecos;
    }

    public void setEnderecos(Set<Endereco> enderecos) {
        this.enderecos = enderecos;
    }

    // Métodos auxiliares para gerenciar relacionamentos (opcional, mas útil)
    public void addContato(Contato contato) {
        this.contatos.add(contato);
        // Se Contato tivesse uma referência de volta para Cliente, você adicionaria aqui:
        // contato.getClientesInternal().add(this);
    }

    public void removeContato(Contato contato) {
        this.contatos.remove(contato);
        // contato.getClientesInternal().remove(this);
    }

    public void addEndereco(Endereco endereco) {
        this.enderecos.add(endereco);
        // endereco.getClientesInternal().add(this);
    }

    public void removeEndereco(Endereco endereco) {
        this.enderecos.remove(endereco);
        // endereco.getClientesInternal().remove(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cliente cliente = (Cliente) o;
        return Objects.equals(idCliente, cliente.idCliente);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCliente);
    }

    @Override
    public String toString() {
        return "Cliente{" +
                "idCliente=" + idCliente +
                ", nome='" + nome + '\'' +
                ", sobrenome='" + sobrenome + '\'' +
                ", dataNascimento='" + dataNascimento + '\'' +
                ", documento='" + documento + '\'' +
                '}';
    }
}