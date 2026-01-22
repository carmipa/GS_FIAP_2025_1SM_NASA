package br.com.fiap.gs.gsapi.repository;

import br.com.fiap.gs.gsapi.model.Contato;
import org.springframework.data.domain.Page; // Import necessário
import org.springframework.data.domain.Pageable; // Import necessário
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContatoRepository extends JpaRepository<Contato, Long> {

    /**
     * Busca um contato pelo seu endereço de e-mail.
     * @param email O e-mail a ser buscado.
     * @return Um Optional contendo o contato se encontrado.
     */
    Optional<Contato> findByEmail(String email);

    /**
     * Busca contatos por tipo, ignorando maiúsculas/minúsculas. (Versão que retorna Lista)
     * @param tipoContato O tipo de contato (ex: "COMERCIAL", "PESSOAL").
     * @return Uma lista de contatos que correspondem ao tipo.
     */
    List<Contato> findByTipoContatoIgnoreCase(String tipoContato); // Método original que retorna List

    /**
     * Busca contatos por tipo, ignorando maiúsculas/minúsculas, com suporte a paginação.
     * @param tipoContato O tipo de contato (ex: "COMERCIAL", "PESSOAL").
     * @param pageable Objeto de paginação.
     * @return Uma página de contatos que correspondem ao tipo.
     */
    Page<Contato> findByTipoContatoIgnoreCase(String tipoContato, Pageable pageable); // Novo método com Pageable
}