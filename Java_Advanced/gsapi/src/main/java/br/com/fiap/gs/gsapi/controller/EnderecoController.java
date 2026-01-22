package br.com.fiap.gs.gsapi.controller;

// Correção: Importar ViaCepResponseDTO do pacote 'response'
import br.com.fiap.gs.gsapi.dto.response.ViaCepResponseDTO;
import br.com.fiap.gs.gsapi.dto.request.EnderecoGeoRequestDTO;
import br.com.fiap.gs.gsapi.dto.request.EnderecoRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.EnderecoResponseDTO;
import br.com.fiap.gs.gsapi.dto.response.GeoCoordinatesDTO;
import br.com.fiap.gs.gsapi.service.EnderecoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/enderecos")
@Tag(name = "Endereços", description = "Endpoints para gerenciamento de endereços")
public class EnderecoController {

    private final EnderecoService enderecoService;

    @Autowired
    public EnderecoController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @Operation(summary = "Lista todos os endereços de forma paginada")
    @ApiResponse(responseCode = "200", description = "Lista de endereços retornada com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    @GetMapping
    public ResponseEntity<Page<EnderecoResponseDTO>> listarTodosEnderecos(
            @PageableDefault(size = 10, sort = {"cep"}) Pageable pageable) {
        Page<EnderecoResponseDTO> enderecos = enderecoService.listarTodos(pageable);
        return ResponseEntity.ok(enderecos);
    }

    @Operation(summary = "Busca um endereço pelo seu ID")
    @ApiResponse(responseCode = "200", description = "Endereço encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EnderecoResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Endereço não encontrado", content = @Content)
    @GetMapping("/{id}")
    public ResponseEntity<EnderecoResponseDTO> buscarEnderecoPorId(@PathVariable Long id) {
        EnderecoResponseDTO endereco = enderecoService.buscarPorId(id);
        return ResponseEntity.ok(endereco);
    }

    @Operation(summary = "Consulta dados de endereço a partir de um CEP (ViaCEP)")
    @ApiResponse(responseCode = "200", description = "Dados do CEP retornados com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ViaCepResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "CEP não encontrado ou inválido", content = @Content)
    @ApiResponse(responseCode = "400", description = "Formato de CEP inválido", content = @Content)
    @ApiResponse(responseCode = "503", description = "Serviço ViaCEP indisponível ou erro de comunicação", content = @Content)
    @GetMapping("/consultar-cep/{cep}")
    public ResponseEntity<ViaCepResponseDTO> consultarCep(
            @Parameter(description = "CEP a ser consultado (apenas números ou formato XXXXX-XXX)", example = "01001000")
            @PathVariable String cep) {
        ViaCepResponseDTO enderecoViaCep = enderecoService.consultarDadosPorCep(cep);
        return ResponseEntity.ok(enderecoViaCep);
    }

    @Operation(summary = "Calcula latitude e longitude para um endereço usando Nominatim")
    @ApiResponse(responseCode = "200", description = "Coordenadas calculadas com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = GeoCoordinatesDTO.class)))
    @ApiResponse(responseCode = "404", description = "Endereço não encontrado para geocodificação", content = @Content)
    @ApiResponse(responseCode = "400", description = "Dados de endereço insuficientes ou inválidos", content = @Content)
    @ApiResponse(responseCode = "503", description = "Serviço de geocodificação indisponível ou erro de comunicação", content = @Content)
    @PostMapping("/calcular-coordenadas")
    public ResponseEntity<GeoCoordinatesDTO> calcularCoordenadas(
            @Valid @RequestBody EnderecoGeoRequestDTO enderecoGeoRequestDTO) {
        GeoCoordinatesDTO coordenadas = enderecoService.calcularCoordenadasPorEndereco(enderecoGeoRequestDTO);
        return ResponseEntity.ok(coordenadas);
    }

    @Operation(summary = "Cria um novo endereço.")
    @ApiResponse(responseCode = "201", description = "Endereço criado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EnderecoResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos (ex: latitude/longitude ausentes)", content = @Content)
    @PostMapping
    public ResponseEntity<EnderecoResponseDTO> criarEndereco(
            @Valid @RequestBody EnderecoRequestDTO enderecoRequestDTO,
            UriComponentsBuilder uriBuilder) {
        EnderecoResponseDTO enderecoSalvo = enderecoService.criarEndereco(enderecoRequestDTO);
        URI location = uriBuilder.path("/api/enderecos/{id}").buildAndExpand(enderecoSalvo.getIdEndereco()).toUri();
        return ResponseEntity.created(location).body(enderecoSalvo);
    }

    @Operation(summary = "Atualiza um endereço existente")
    @ApiResponse(responseCode = "200", description = "Endereço atualizado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EnderecoResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Endereço não encontrado", content = @Content)
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos", content = @Content)
    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponseDTO> atualizarEndereco(
            @PathVariable Long id,
            @Valid @RequestBody EnderecoRequestDTO enderecoRequestDTO) {
        EnderecoResponseDTO enderecoAtualizado = enderecoService.atualizarEndereco(id, enderecoRequestDTO);
        return ResponseEntity.ok(enderecoAtualizado);
    }

    @Operation(summary = "Deleta um endereço pelo seu ID")
    @ApiResponse(responseCode = "204", description = "Endereço deletado com sucesso")
    @ApiResponse(responseCode = "404", description = "Endereço não encontrado", content = @Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarEndereco(@PathVariable Long id) {
        enderecoService.deletarEndereco(id);
        return ResponseEntity.noContent().build();
    }
}