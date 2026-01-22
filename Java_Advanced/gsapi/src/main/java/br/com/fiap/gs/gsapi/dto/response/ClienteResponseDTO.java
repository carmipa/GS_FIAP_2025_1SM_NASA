package br.com.fiap.gs.gsapi.dto.response;

import br.com.fiap.gs.gsapi.model.Cliente;
import br.com.fiap.gs.gsapi.dto.response.ContatoResponseDTO;
import br.com.fiap.gs.gsapi.dto.response.EnderecoResponseDTO;

import java.util.Set;
import java.util.stream.Collectors;

public class ClienteResponseDTO {

    private Long idCliente;
    private String nome;
    private String sobrenome;
    private String dataNascimento;
    private String documento;
    private Set<ContatoResponseDTO> contatos;
    private Set<EnderecoResponseDTO> enderecos;

    // Construtor Padrão
    public ClienteResponseDTO() {
    }

    // Construtor para facilitar a conversão da Entidade para DTO
    public ClienteResponseDTO(Cliente cliente) {
        this.idCliente = cliente.getIdCliente();
        this.nome = cliente.getNome();
        this.sobrenome = cliente.getSobrenome();
        this.dataNascimento = cliente.getDataNascimento();
        this.documento = cliente.getDocumento();
        if (cliente.getContatos() != null) {
            this.contatos = cliente.getContatos().stream()
                    .map(ContatoResponseDTO::new)
                    .collect(Collectors.toSet());
        }
        if (cliente.getEnderecos() != null) {
            this.enderecos = cliente.getEnderecos().stream()
                    .map(EnderecoResponseDTO::new)
                    .collect(Collectors.toSet());
        }
    }

    // Construtor com todos os campos (mantido para consistência, se usado em outros lugares)
    public ClienteResponseDTO(Long idCliente, String nome, String sobrenome, String dataNascimento, String documento, Set<ContatoResponseDTO> contatos, Set<EnderecoResponseDTO> enderecos) {
        this.idCliente = idCliente;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.dataNascimento = dataNascimento;
        this.documento = documento;
        this.contatos = contatos;
        this.enderecos = enderecos;
    }

    // Getters e Setters (completos)
    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSobrenome() { return sobrenome; }
    public void setSobrenome(String sobrenome) { this.sobrenome = sobrenome; }
    public String getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(String dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public Set<ContatoResponseDTO> getContatos() { return contatos; }
    public void setContatos(Set<ContatoResponseDTO> contatos) { this.contatos = contatos; }
    public Set<EnderecoResponseDTO> getEnderecos() { return enderecos; }
    public void setEnderecos(Set<EnderecoResponseDTO> enderecos) { this.enderecos = enderecos; }
}