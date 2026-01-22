package br.com.fiap.gs.gsapi.mapper;

import br.com.fiap.gs.gsapi.dto.request.EnderecoRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.EnderecoResponseDTO;
import br.com.fiap.gs.gsapi.model.Endereco;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    EnderecoMapper INSTANCE = Mappers.getMapper(EnderecoMapper.class);

    EnderecoResponseDTO toResponseDTO(Endereco endereco);

    Set<EnderecoResponseDTO> toResponseDTOSet(Set<Endereco> enderecos); // Para coleções

    List<EnderecoResponseDTO> toResponseDTOList(List<Endereco> enderecos); // Para coleções

    @Mapping(target = "idEndereco", ignore = true) // ID é gerado pelo banco
    @Mapping(target = "clientes", ignore = true)    // Lado inverso, gerenciado pelo Cliente
    @Mapping(target = "eventosEonet", ignore = true) // Relacionamento gerenciado aqui ou via serviço dedicado
    Endereco toEntity(EnderecoRequestDTO enderecoRequestDTO);
}