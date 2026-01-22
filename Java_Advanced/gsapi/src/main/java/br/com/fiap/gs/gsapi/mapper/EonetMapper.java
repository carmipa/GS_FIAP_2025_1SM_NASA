package br.com.fiap.gs.gsapi.mapper;

import br.com.fiap.gs.gsapi.dto.request.EonetRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.EonetResponseDTO;
import br.com.fiap.gs.gsapi.model.Eonet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface EonetMapper {

    EonetMapper INSTANCE = Mappers.getMapper(EonetMapper.class);

    EonetResponseDTO toResponseDTO(Eonet eonet);

    @Mapping(target = "idEonet", ignore = true)
    @Mapping(target = "enderecos", ignore = true) // Relacionamento gerenciado pelo Endereco
    Eonet toEntity(EonetRequestDTO eonetRequestDTO);
}