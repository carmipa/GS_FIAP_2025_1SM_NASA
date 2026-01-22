package br.com.fiap.gs.gsapi.repository;

import br.com.fiap.gs.gsapi.model.Endereco;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    /**
     * Busca endereços por CEP.
     * @param cep O CEP a ser buscado.
     * @return Uma lista de endereços que correspondem ao CEP.
     */
    List<Endereco> findByCep(String cep);

    /**
     * Busca um endereço específico pela combinação de logradouro e número.
     * @param logradouro O logradouro do endereço.
     * @param numero O número do endereço.
     * @return Um Optional contendo o endereço se encontrado.
     */
    Optional<Endereco> findByLogradouroAndNumero(String logradouro, Integer numero);

    /**
     * Busca endereços por UF (Estado), com suporte a paginação.
     * @param uf A sigla do Estado (UF).
     * @param pageable Objeto de paginação.
     * @return Uma página de endereços que correspondem à UF.
     */
    Page<Endereco> findByUfIgnoreCase(String uf, Pageable pageable);
}