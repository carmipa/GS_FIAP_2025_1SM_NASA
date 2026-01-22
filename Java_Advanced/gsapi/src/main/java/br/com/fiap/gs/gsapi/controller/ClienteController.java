package br.com.fiap.gs.gsapi.controller;

import br.com.fiap.gs.gsapi.dto.request.ClienteRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.ClienteResponseDTO;
import br.com.fiap.gs.gsapi.service.ClienteService;

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
@RequestMapping("/api/clientes")
@Tag(name = "Clientes", description = "Endpoints para gerenciamento de clientes")
public class ClienteController {

    private final ClienteService clienteService;

    @Autowired
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @Operation(summary = "Lista todos os clientes de forma paginada")
    @ApiResponse(responseCode = "200", description = "Lista de clientes retornada com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    @GetMapping
    public ResponseEntity<Page<ClienteResponseDTO>> listarTodosClientes(
            @PageableDefault(size = 10, sort = {"nome"}) Pageable pageable) {
        Page<ClienteResponseDTO> clientes = clienteService.listarTodos(pageable);
        return ResponseEntity.ok(clientes);
    }

    @Operation(summary = "Busca um cliente pelo seu ID")
    @ApiResponse(responseCode = "200", description = "Cliente encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ClienteResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> buscarClientePorId(@PathVariable Long id) {
        ClienteResponseDTO cliente = clienteService.buscarPorId(id);
        return ResponseEntity.ok(cliente);
    }

    @Operation(summary = "Busca um cliente pelo seu Documento (CPF/CNPJ)")
    @ApiResponse(responseCode = "200", description = "Cliente encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ClienteResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
    @GetMapping("/documento/{documento}")
    public ResponseEntity<ClienteResponseDTO> buscarClientePorDocumento(@PathVariable String documento) {
        ClienteResponseDTO cliente = clienteService.buscarPorDocumento(documento);
        return ResponseEntity.ok(cliente);
    }

    @Operation(summary = "Cria um novo cliente")
    @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ClienteResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos", content = @Content)
    @PostMapping
    public ResponseEntity<ClienteResponseDTO> criarCliente(
            @Valid @RequestBody ClienteRequestDTO clienteRequestDTO,
            UriComponentsBuilder uriBuilder) {
        ClienteResponseDTO clienteSalvo = clienteService.criarCliente(clienteRequestDTO);
        URI location = uriBuilder.path("/api/clientes/{id}").buildAndExpand(clienteSalvo.getIdCliente()).toUri();
        return ResponseEntity.created(location).body(clienteSalvo);
    }

    @Operation(summary = "Atualiza um cliente existente")
    @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ClienteResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos", content = @Content)
    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> atualizarCliente(
            @PathVariable Long id,
            @Valid @RequestBody ClienteRequestDTO clienteRequestDTO) {
        ClienteResponseDTO clienteAtualizado = clienteService.atualizarCliente(id, clienteRequestDTO);
        return ResponseEntity.ok(clienteAtualizado);
    }

    @Operation(summary = "Deleta um cliente pelo seu ID")
    @ApiResponse(responseCode = "204", description = "Cliente deletado com sucesso")
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCliente(@PathVariable Long id) {
        clienteService.deletarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Pesquisa clientes por nome ou sobrenome")
    @ApiResponse(responseCode = "200", description = "Resultado da pesquisa de clientes",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    @GetMapping("/pesquisar")
    public ResponseEntity<Page<ClienteResponseDTO>> pesquisarClientes(
            @Parameter(description = "Termo para buscar no nome ou sobrenome do cliente") @RequestParam String termo,
            @PageableDefault(size = 10, sort = {"nome"}) Pageable pageable) {
        Page<ClienteResponseDTO> clientes = clienteService.pesquisarClientes(termo, pageable);
        return ResponseEntity.ok(clientes);
    }
}