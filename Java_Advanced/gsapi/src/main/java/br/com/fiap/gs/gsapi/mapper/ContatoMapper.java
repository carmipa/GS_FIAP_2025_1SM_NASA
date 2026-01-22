package br.com.fiap.gs.gsapi.mapper;

import br.com.fiap.gs.gsapi.dto.request.ContatoRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.ContatoResponseDTO;
import br.com.fiap.gs.gsapi.model.Contato;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface ContatoMapper {

    ContatoMapper INSTANCE = Mappers.getMapper(ContatoMapper.class);

    ContatoResponseDTO toResponseDTO(Contato contato);

    Set<ContatoResponseDTO> toResponseDTOSet(Set<Contato> contatos); // Para coleções

    List<ContatoResponseDTO> toResponseDTOList(List<Contato> contatos); // Para coleções

    @Mapping(target = "idContato", ignore = true) // ID é gerado pelo banco
    @Mapping(target = "clientes", ignore = true) // Lado inverso, gerenciado pelo Cliente
    Contato toEntity(ContatoRequestDTO contatoRequestDTO);
}