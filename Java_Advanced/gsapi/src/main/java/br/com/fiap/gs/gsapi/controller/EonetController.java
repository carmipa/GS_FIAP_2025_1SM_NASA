// Arquivo: src/main/java/br/com/fiap/gs/gsapi/controller/EonetController.java
package br.com.fiap.gs.gsapi.controller;

import br.com.fiap.gs.gsapi.dto.external.NasaEonetEventDTO;
import br.com.fiap.gs.gsapi.dto.request.EonetRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.EonetResponseDTO;
import br.com.fiap.gs.gsapi.service.EonetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/eonet")
@Tag(name = "EONET Eventos", description = "Endpoints para gerenciamento de eventos EONET, incluindo sincronização e busca por proximidade na NASA API")
public class EonetController {

    private final EonetService eonetService;

    @Autowired
    public EonetController(EonetService eonetService) {
        this.eonetService = eonetService;
    }

    @Operation(summary = "Lista todos os eventos EONET armazenados localmente, de forma paginada")
    @GetMapping
    public ResponseEntity<Page<EonetResponseDTO>> listarTodosEventosEonetLocalmente(
            @PageableDefault(size = 10, sort = {"data"}, direction = Sort.Direction.DESC) Pageable pageable) {
        Page<EonetResponseDTO> eventos = eonetService.listarTodosEventos(pageable);
        return ResponseEntity.ok(eventos);
    }

    @Operation(summary = "Busca um evento EONET armazenado pelo seu ID interno no banco de dados")
    @GetMapping("/{idInterno}")
    public ResponseEntity<EonetResponseDTO> buscarEventoLocalPorIdInterno(@PathVariable Long idInterno) {
        EonetResponseDTO evento = eonetService.buscarEventoPorIdInterno(idInterno);
        return ResponseEntity.ok(evento);
    }

    @Operation(summary = "Busca um evento EONET armazenado pelo ID da API da NASA")
    @GetMapping("/api-id/{eonetApiId}")
    public ResponseEntity<EonetResponseDTO> buscarEventoLocalPorEonetApiId(@PathVariable String eonetApiId) {
        EonetResponseDTO evento = eonetService.buscarEventoPorEonetApiId(eonetApiId);
        return ResponseEntity.ok(evento);
    }

    @Operation(summary = "Salva manualmente um novo evento EONET no banco local")
    @ApiResponse(responseCode = "201", description = "Evento EONET salvo com sucesso")
    @PostMapping
    public ResponseEntity<EonetResponseDTO> salvarEventoEonetManualmente(
            @Valid @RequestBody EonetRequestDTO eonetRequestDTO,
            UriComponentsBuilder uriBuilder) {
        EonetResponseDTO eventoSalvo = eonetService.salvarEventoManualmente(eonetRequestDTO);
        URI location = uriBuilder.path("/api/eonet/{idInterno}").buildAndExpand(eventoSalvo.getIdEonet()).toUri();
        return ResponseEntity.created(location).body(eventoSalvo);
    }

    @Operation(summary = "Atualiza manualmente um evento EONET existente no banco local")
    @PutMapping("/{idInterno}")
    public ResponseEntity<EonetResponseDTO> atualizarEventoEonetManualmente(
            @PathVariable Long idInterno,
            @Valid @RequestBody EonetRequestDTO eonetRequestDTO) {
        EonetResponseDTO eventoAtualizado = eonetService.atualizarEventoManualmente(idInterno, eonetRequestDTO);
        return ResponseEntity.ok(eventoAtualizado);
    }

    @Operation(summary = "Deleta um evento EONET do banco local pelo seu ID interno")
    @DeleteMapping("/{idInterno}")
    public ResponseEntity<Void> deletarEventoEonetLocal(@PathVariable Long idInterno) {
        eonetService.deletarEvento(idInterno);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Busca eventos EONET armazenados localmente dentro de um intervalo de datas")
    @GetMapping("/por-data")
    public ResponseEntity<List<EonetResponseDTO>> buscarEventosLocaisPorIntervaloDeData(
            @Parameter(description = "Data inicial do evento (formato ISO OffsetDateTime:คณะ-MM-dd'T'HH:mm:ssXXX)", required = true, example = "2023-01-01T00:00:00-03:00")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataInicial,
            @Parameter(description = "Data final do evento (formato ISO OffsetDateTime:คณะ-MM-dd'T'HH:mm:ssXXX)", required = true, example = "2023-01-31T23:59:59-03:00")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataFinal) {
        List<EonetResponseDTO> eventos = eonetService.buscarEventosPorIntervaloDeData(dataInicial, dataFinal);
        return ResponseEntity.ok(eventos);
    }

    @Operation(summary = "Busca novos eventos da API da NASA EONET e os persiste/atualiza localmente.")
    @ApiResponse(responseCode = "200", description = "Sincronização concluída, retorna lista de eventos processados.",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = EonetResponseDTO.class))))
    @ApiResponse(responseCode = "503", description = "Serviço NASA EONET indisponível.")
    @PostMapping("/nasa/sincronizar")
    public ResponseEntity<List<EonetResponseDTO>> sincronizarEventosDaNasa(
            @Parameter(description = "Número máximo de eventos a serem buscados.") @RequestParam(required = false) Integer limit,
            @Parameter(description = "Número de dias anteriores para buscar eventos.") @RequestParam(required = false) Integer days,
            @Parameter(description = "Status dos eventos (open, closed). Padrão 'open'.") @RequestParam(required = false, defaultValue = "open") String status,
            @Parameter(description = "Fonte dos eventos (PDC, MRR).") @RequestParam(required = false) String source) {
        List<EonetResponseDTO> novosEventosProcessados = eonetService.sincronizarEventosDaNasa(limit, days, status, source);
        return ResponseEntity.ok(novosEventosProcessados);
    }

    @Operation(summary = "Busca eventos da API EONET da NASA. Permite busca por intervalo de datas, proximidade, categoria ou globais recentes.")
    @ApiResponse(responseCode = "200", description = "Eventos encontrados.",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = NasaEonetEventDTO.class))))
    @ApiResponse(responseCode = "204", description = "Nenhum evento encontrado.")
    @ApiResponse(responseCode = "400", description = "Parâmetros inválidos.")
    @GetMapping("/nasa/proximos")
    public ResponseEntity<List<NasaEonetEventDTO>> buscarEventosDaNasa(
            @Parameter(description = "Latitude do ponto central (para busca por proximidade)", example = "-23.550520")
            @RequestParam(required = false) Double latitude,

            @Parameter(description = "Longitude do ponto central (para busca por proximidade)", example = "-46.633308")
            @RequestParam(required = false) Double longitude,

            @Parameter(description = "Raio de busca em km (para busca por proximidade)", example = "100")
            @RequestParam(required = false) Double raioKm,

            @Parameter(description = "Data de início da busca (formato YYYY-MM-DD). Se usada, 'days' é ignorado.", example = "2023-01-01")
            @RequestParam(required = false) String startDate,

            @Parameter(description = "Data de fim da busca (formato YYYY-MM-DD). Se usada, 'days' é ignorado.", example = "2023-01-31")
            @RequestParam(required = false) String endDate,

            @Parameter(description = "Número máximo de eventos a retornar")
            @RequestParam(required = false) Integer limit,

            @Parameter(description = "Número de dias passados para buscar (usado se startDate/endDate não fornecidos)")
            @RequestParam(required = false) Integer days,

            @Parameter(description = "Status dos eventos (open, closed, ou vazio/all para todos)")
            @RequestParam(required = false) String status,

            @Parameter(description = "Fonte dos eventos (PDC, CEMS)")
            @RequestParam(required = false) String source,

            // ***** NOVO PARÂMETRO ADICIONADO *****
            @Parameter(description = "ID da categoria do evento EONET (ex: wildfires, volcanoes)")
            @RequestParam(required = false) String category) {

        List<NasaEonetEventDTO> eventos = eonetService.buscarEventosEonetProximosDaAPI(
                latitude, longitude, raioKm,
                limit, days, status, source,
                startDate, endDate, category); // Passa o novo parâmetro category

        if (eventos == null || eventos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(eventos);
    }
}