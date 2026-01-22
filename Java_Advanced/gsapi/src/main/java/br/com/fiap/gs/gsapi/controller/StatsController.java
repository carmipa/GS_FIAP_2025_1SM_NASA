// Arquivo: src/main/java/br/com/fiap/gs/gsapi/controller/StatsController.java
package br.com.fiap.gs.gsapi.controller;

import br.com.fiap.gs.gsapi.dto.stats.CategoryCountDTO;
import br.com.fiap.gs.gsapi.service.EonetService; // Usaremos o EonetService por enquanto
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;

@RestController
@RequestMapping("/api/stats")
@Tag(name = "Estatísticas de Desastres", description = "Endpoints para obter dados estatísticos sobre eventos EONET")
public class StatsController {

    private final EonetService eonetService; // Poderia ser um StatsService dedicado no futuro

    @Autowired
    public StatsController(EonetService eonetService) {
        this.eonetService = eonetService;
    }

    @Operation(summary = "Obtém a contagem de eventos EONET locais por categoria para um determinado período em dias.")
    @ApiResponse(responseCode = "200", description = "Estatísticas por categoria retornadas com sucesso.",
            content = @Content(mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = CategoryCountDTO.class))))
    @ApiResponse(responseCode = "400", description = "Parâmetro 'days' inválido.")
    @GetMapping("/eonet/count-by-category")
    public ResponseEntity<List<CategoryCountDTO>> getEonetCountByCategory(
            @Parameter(description = "Número de dias no passado para considerar na estatística (ex: 365 para o último ano).", required = true, example = "365")
            @RequestParam(defaultValue = "365") int days) {

        if (days <= 0) {
            // Poderia lançar uma exceção mais específica ou retornar ResponseEntity.badRequest()
            // O GlobalExceptionHandler já pega IllegalArgumentException e retorna 400.
            throw new IllegalArgumentException("O parâmetro 'days' deve ser um número positivo.");
        }
        List<CategoryCountDTO> stats = eonetService.getEventCountByCategoryLastXDays(days);
        return ResponseEntity.ok(stats);
    }

}