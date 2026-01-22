// Arquivo: src/main/java/br/com/fiap/gs/gsapi/controller/ContatoController.java
package br.com.fiap.gs.gsapi.controller;

import br.com.fiap.gs.gsapi.dto.request.ContatoRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.ContatoResponseDTO;
import br.com.fiap.gs.gsapi.service.ContatoService;

import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/contatos")
@Tag(name = "Contatos", description = "Endpoints para gerenciamento de contatos")
public class ContatoController {

    private final ContatoService contatoService;

    @Autowired
    public ContatoController(ContatoService contatoService) {
        this.contatoService = contatoService;
    }

    @Operation(summary = "Cria um novo contato")
    @ApiResponse(responseCode = "201", description = "Contato criado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContatoResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos", content = @Content)
    @PostMapping
    public ResponseEntity<ContatoResponseDTO> criarContato(
            @Valid @RequestBody ContatoRequestDTO contatoRequestDTO,
            UriComponentsBuilder uriBuilder) {
        ContatoResponseDTO contatoSalvo = contatoService.criarContato(contatoRequestDTO);
        URI location = uriBuilder.path("/api/contatos/{id}").buildAndExpand(contatoSalvo.getIdContato()).toUri();
        return ResponseEntity.created(location).body(contatoSalvo);
    }

    @Operation(summary = "Lista todos os contatos de forma paginada")
    @ApiResponse(responseCode = "200", description = "Lista de contatos retornada com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    @GetMapping
    public ResponseEntity<Page<ContatoResponseDTO>> listarTodosContatos(
            @PageableDefault(size = 10, sort = {"email"}) Pageable pageable) {
        Page<ContatoResponseDTO> contatos = contatoService.listarTodos(pageable);
        return ResponseEntity.ok(contatos);
    }

    @Operation(summary = "Busca um contato pelo seu ID")
    @ApiResponse(responseCode = "200", description = "Contato encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContatoResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Contato não encontrado", content = @Content)
    @GetMapping("/{id}")
    public ResponseEntity<ContatoResponseDTO> buscarContatoPorId(@PathVariable Long id) {
        ContatoResponseDTO contato = contatoService.buscarPorId(id);
        return ResponseEntity.ok(contato);
    }

    @Operation(summary = "Busca um contato pelo seu email")
    @ApiResponse(responseCode = "200", description = "Contato encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContatoResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Contato não encontrado com este email", content = @Content)
    @GetMapping("/email/{email}")
    public ResponseEntity<ContatoResponseDTO> buscarContatoPorEmail(@PathVariable String email) {
        ContatoResponseDTO contato = contatoService.buscarPorEmail(email);
        return ResponseEntity.ok(contato);
    }

    @Operation(summary = "Atualiza um contato existente")
    @ApiResponse(responseCode = "200", description = "Contato atualizado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContatoResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Contato não encontrado", content = @Content)
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos", content = @Content)
    @PutMapping("/{id}")
    public ResponseEntity<ContatoResponseDTO> atualizarContato(
            @PathVariable Long id,
            @Valid @RequestBody ContatoRequestDTO contatoRequestDTO) {
        ContatoResponseDTO contatoAtualizado = contatoService.atualizarContato(id, contatoRequestDTO);
        return ResponseEntity.ok(contatoAtualizado);
    }

    @Operation(summary = "Deleta um contato pelo seu ID")
    @ApiResponse(responseCode = "204", description = "Contato deletado com sucesso")
    @ApiResponse(responseCode = "404", description = "Contato não encontrado", content = @Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarContato(@PathVariable Long id) {
        contatoService.deletarContato(id);
        return ResponseEntity.noContent().build();
    }
}