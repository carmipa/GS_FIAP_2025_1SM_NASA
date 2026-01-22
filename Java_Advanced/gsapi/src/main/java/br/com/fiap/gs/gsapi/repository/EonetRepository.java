// Arquivo: src/main/java/br/com/fiap/gs/gsapi/repository/EonetRepository.java
package br.com.fiap.gs.gsapi.repository;

import br.com.fiap.gs.gsapi.model.Eonet;
import org.springframework.data.jpa.repository.JpaRepository;
// Não são necessárias importações de DTOs de stats aqui se as queries que os usavam foram removidas
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EonetRepository extends JpaRepository<Eonet, Long> {

    Optional<Eonet> findByEonetIdApi(String eonetIdApi);

    List<Eonet> findByDataBetween(OffsetDateTime dataInicial, OffsetDateTime dataFinal);

    // Os métodos countEventsByYearMonthRaw e findEventCountsByYearRaw foram removidos.
    // Se você tinha as versões com TO_CHAR e SELECT NEW, elas também foram removidas.
}