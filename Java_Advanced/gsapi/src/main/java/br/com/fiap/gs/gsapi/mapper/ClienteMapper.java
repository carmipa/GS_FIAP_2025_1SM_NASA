package br.com.fiap.gs.gsapi.mapper;

import br.com.fiap.gs.gsapi.dto.request.ClienteRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.ClienteResponseDTO;
import br.com.fiap.gs.gsapi.model.Cliente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget; // Import necessário para @MappingTarget
// Não são necessários @Named ou @Context para esta versão simplificada.

@Mapper(componentModel = "spring", uses = {ContatoMapper.class, EnderecoMapper.class})
public interface ClienteMapper {

    // Para converter Entidade Cliente para ClienteResponseDTO
    // MapStruct usará ContatoMapper e EnderecoMapper para as coleções 'contatos' e 'enderecos'
    // devido à cláusula 'uses'.
    @Mapping(source = "contatos", target = "contatos")
    @Mapping(source = "enderecos", target = "enderecos")
    ClienteResponseDTO toResponseDTO(Cliente cliente);

    // Para converter ClienteRequestDTO para uma NOVA Entidade Cliente
    @Mapping(target = "idCliente", ignore = true) // ID é gerado pelo banco
    @Mapping(target = "contatos", ignore = true)  // Será tratado no ClienteService (busca por IDs de contatosIds)
    @Mapping(target = "enderecos", ignore = true) // Será tratado no ClienteService (busca por IDs de enderecosIds)
    Cliente toEntity(ClienteRequestDTO clienteRequestDTO);

    // Para ATUALIZAR uma Entidade Cliente existente com dados de ClienteRequestDTO
    @Mapping(target = "idCliente", ignore = true) // Não atualiza o ID
    @Mapping(target = "contatos", ignore = true)  // Associações de contatos são tratadas no serviço
    @Mapping(target = "enderecos", ignore = true) // Associações de endereços são tratadas no serviço
    // Os campos nome, sobrenome, dataNascimento, documento serão mapeados automaticamente
    // de ClienteRequestDTO para Cliente se os nomes e tipos forem compatíveis.
    void updateClienteFromDto(ClienteRequestDTO dto, @MappingTarget Cliente cliente);
}