package br.com.fiap.gs.gsapi.repository;

import br.com.fiap.gs.gsapi.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    /**
     * Busca um cliente pelo seu documento (CPF/CNPJ).
     * @param documento O número do documento.
     * @return Um Optional contendo o cliente se encontrado, ou vazio caso contrário.
     */
    Optional<Cliente> findByDocumento(String documento);

    /**
     * Busca clientes cujo nome contenha a string fornecida, ignorando maiúsculas/minúsculas,
     * com suporte a paginação.
     * @param nome Parte do nome a ser buscado.
     * @param pageable Objeto de paginação.
     * @return Uma página de clientes que correspondem ao critério.
     */
    Page<Cliente> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    /**
     * Exemplo de busca customizada usando JPQL para encontrar clientes
     * por parte do nome ou sobrenome, ignorando maiúsculas/minúsculas, com paginação.
     * @param termo O termo a ser buscado no nome ou sobrenome.
     * @param pageable Objeto de paginação.
     * @return Uma página de clientes que correspondem ao critério.
     */
    @Query("SELECT c FROM Cliente c WHERE lower(c.nome) LIKE lower(concat('%', :termo, '%')) OR lower(c.sobrenome) LIKE lower(concat('%', :termo, '%'))")
    Page<Cliente> searchByNomeOrSobrenome(@Param("termo") String termo, Pageable pageable);

}