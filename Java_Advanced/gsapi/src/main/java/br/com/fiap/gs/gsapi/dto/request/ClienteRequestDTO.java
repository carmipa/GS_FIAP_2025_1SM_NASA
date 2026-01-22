package br.com.fiap.gs.gsapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List; // Para as listas de IDs
import java.util.Set; // Se preferir Set para IDs, mas List é comum para DTOs

public class ClienteRequestDTO {

    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
    private String nome;

    @NotBlank(message = "O sobrenome não pode estar em branco.")
    @Size(min = 2, max = 100, message = "O sobrenome deve ter entre 2 e 100 caracteres.")
    private String sobrenome;

    @NotBlank(message = "A data de nascimento não pode estar em branco.")
    // Aceita YYYY-MM-DD do input date HTML5 ou dd/MM/yyyy que era o pattern anterior da entidade
    @Pattern(regexp = "^(\\d{4}-\\d{2}-\\d{2}|\\d{2}/\\d{2}/\\d{4})$", message = "A data de nascimento deve estar no formato YYYY-MM-DD ou dd/MM/yyyy.")
    private String dataNascimento;

    @NotBlank(message = "O documento não pode estar em branco.")
    @Size(min = 11, max = 18, message = "O documento deve ter entre 11 e 18 caracteres.")
    private String documento;

    // IDs dos contatos e endereços existentes a serem associados
    // O frontend precisará fornecer estes IDs.
    // Pode ser uma lista vazia se não houver associações iniciais.
    private List<Long> contatosIds;
    private List<Long> enderecosIds;

    // Construtor Padrão
    public ClienteRequestDTO() {
    }

    // Construtor Completo
    public ClienteRequestDTO(String nome, String sobrenome, String dataNascimento, String documento, List<Long> contatosIds, List<Long> enderecosIds) {
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.dataNascimento = dataNascimento;
        this.documento = documento;
        this.contatosIds = contatosIds;
        this.enderecosIds = enderecosIds;
    }

    // Getters e Setters
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

    public List<Long> getContatosIds() {
        return contatosIds;
    }

    public void setContatosIds(List<Long> contatosIds) {
        this.contatosIds = contatosIds;
    }

    public List<Long> getEnderecosIds() {
        return enderecosIds;
    }

    public void setEnderecosIds(List<Long> enderecosIds) {
        this.enderecosIds = enderecosIds;
    }
}