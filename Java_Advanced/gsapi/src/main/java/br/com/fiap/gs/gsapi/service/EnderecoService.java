package br.com.fiap.gs.gsapi.service;

import br.com.fiap.gs.gsapi.client.GeoCodingClient;
import br.com.fiap.gs.gsapi.client.ViaCepClient;
import br.com.fiap.gs.gsapi.dto.external.GoogleGeocodingApiResponseDTO;
import br.com.fiap.gs.gsapi.dto.external.GoogleGeocodingResultDTO;
import br.com.fiap.gs.gsapi.dto.response.ViaCepResponseDTO;
import br.com.fiap.gs.gsapi.dto.request.EnderecoGeoRequestDTO;
import br.com.fiap.gs.gsapi.dto.request.EnderecoRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.EnderecoResponseDTO;
import br.com.fiap.gs.gsapi.dto.response.GeoCoordinatesDTO;
import br.com.fiap.gs.gsapi.exception.ResourceNotFoundException;
import br.com.fiap.gs.gsapi.exception.ServiceUnavailableException;
import br.com.fiap.gs.gsapi.mapper.EnderecoMapper;
import br.com.fiap.gs.gsapi.model.Endereco;
import br.com.fiap.gs.gsapi.repository.EnderecoRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
// Removido import java.util.Map; pois UF_PARA_NOME_ESTADO não é mais usado com Google

@Service
public class EnderecoService {

    private static final Logger logger = LoggerFactory.getLogger(EnderecoService.class);

    private final EnderecoRepository enderecoRepository;
    private final EnderecoMapper enderecoMapper;
    private final ViaCepClient viaCepClient;
    private final GeoCodingClient geoCodingClient;

    @Autowired
    public EnderecoService(EnderecoRepository enderecoRepository,
                           EnderecoMapper enderecoMapper,
                           ViaCepClient viaCepClient,
                           GeoCodingClient geoCodingClient) {
        this.enderecoRepository = enderecoRepository;
        this.enderecoMapper = enderecoMapper;
        this.viaCepClient = viaCepClient;
        this.geoCodingClient = geoCodingClient;
    }

    // ... (métodos listarTodos, buscarPorId, criarEndereco, atualizarEndereco, deletarEndereco, formatarCep, consultarDadosPorCep permanecem os mesmos) ...
    // Cole-os da sua versão funcional anterior ou da minha última resposta completa para EnderecoService.
    @Transactional(readOnly = true)
    @Cacheable(value = "enderecos", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
    public Page<EnderecoResponseDTO> listarTodos(Pageable pageable) {
        Page<Endereco> enderecosPage = enderecoRepository.findAll(pageable);
        return enderecosPage.map(enderecoMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "enderecoById", key = "#id")
    public EnderecoResponseDTO buscarPorId(Long id) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço não encontrado com o ID: " + id));
        return enderecoMapper.toResponseDTO(endereco);
    }

    @Transactional
    @CacheEvict(value = {"enderecos", "enderecoById", "enderecosPorCep"}, allEntries = true)
    public EnderecoResponseDTO criarEndereco(EnderecoRequestDTO enderecoRequestDTO) {
        Endereco endereco = enderecoMapper.toEntity(enderecoRequestDTO);
        endereco.setCep(formatarCep(endereco.getCep()));
        if (endereco.getUf() != null) {
            endereco.setUf(endereco.getUf().toUpperCase());
        }
        if (enderecoRequestDTO.getLatitude() == null || enderecoRequestDTO.getLongitude() == null || enderecoRequestDTO.getLatitude() == 0 || enderecoRequestDTO.getLongitude() == 0) {
            throw new IllegalArgumentException("Latitude e Longitude são obrigatórias e devem ser válidas para criar um endereço.");
        }
        Endereco enderecoSalvo = enderecoRepository.save(endereco);
        return enderecoMapper.toResponseDTO(enderecoSalvo);
    }

    @Transactional
    @CachePut(value = "enderecoById", key = "#id")
    @CacheEvict(value = {"enderecos", "enderecosPorCep"}, allEntries = true)
    public EnderecoResponseDTO atualizarEndereco(Long id, EnderecoRequestDTO enderecoRequestDTO) {
        Endereco enderecoExistente = enderecoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço não encontrado com o ID: " + id));
        enderecoExistente.setCep(formatarCep(enderecoRequestDTO.getCep()));
        enderecoExistente.setNumero(enderecoRequestDTO.getNumero());
        enderecoExistente.setLogradouro(enderecoRequestDTO.getLogradouro());
        enderecoExistente.setBairro(enderecoRequestDTO.getBairro());
        enderecoExistente.setLocalidade(enderecoRequestDTO.getLocalidade());
        if (enderecoRequestDTO.getUf() != null) {
            enderecoExistente.setUf(enderecoRequestDTO.getUf().toUpperCase());
        }
        enderecoExistente.setComplemento(enderecoRequestDTO.getComplemento());
        if (enderecoRequestDTO.getLatitude() == null || enderecoRequestDTO.getLongitude() == null || enderecoRequestDTO.getLatitude() == 0 || enderecoRequestDTO.getLongitude() == 0) {
            throw new IllegalArgumentException("Latitude e Longitude são obrigatórias e devem ser válidas para atualizar um endereço.");
        }
        enderecoExistente.setLatitude(enderecoRequestDTO.getLatitude());
        enderecoExistente.setLongitude(enderecoRequestDTO.getLongitude());
        Endereco enderecoAtualizado = enderecoRepository.save(enderecoExistente);
        return enderecoMapper.toResponseDTO(enderecoAtualizado);
    }

    @Transactional
    @CacheEvict(value = {"enderecos", "enderecoById", "enderecosPorCep"}, allEntries = true)
    public void deletarEndereco(Long id) {
        if (!enderecoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Endereço não encontrado com o ID: " + id);
        }
        enderecoRepository.deleteById(id);
    }

    private String formatarCep(String cep) {
        if (cep != null) {
            return cep.replaceAll("[^0-9]", "");
        }
        return null;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "viacepConsulta", key = "#cep")
    public ViaCepResponseDTO consultarDadosPorCep(String cep) {
        String cepFormatado = formatarCep(cep);
        if (cepFormatado == null || cepFormatado.length() != 8) {
            throw new IllegalArgumentException("Formato de CEP inválido. Use 8 dígitos numéricos.");
        }
        ViaCepResponseDTO viaCepData = viaCepClient.buscarEnderecoPorCep(cepFormatado);
        if (viaCepData == null || viaCepData.isErro()) {
            throw new ResourceNotFoundException("CEP " + cepFormatado + " não encontrado ou inválido.");
        }
        return viaCepData;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "geoCoordenadasGoogle", key = "#enderecoGeoRequestDTO.toString()")
    public GeoCoordinatesDTO calcularCoordenadasPorEndereco(EnderecoGeoRequestDTO enderecoGeoRequestDTO) {
        // Construir a string de endereço para a API do Google de forma mais simples
        StringBuilder addressBuilder = new StringBuilder();
        if (StringUtils.hasText(enderecoGeoRequestDTO.getLogradouro())) {
            addressBuilder.append(enderecoGeoRequestDTO.getLogradouro());
        }
        if (StringUtils.hasText(enderecoGeoRequestDTO.getNumero())) {
            addressBuilder.append(", ").append(enderecoGeoRequestDTO.getNumero());
        }
        // Bairro pode ou não ajudar, às vezes é melhor omitir para Google se logradouro é preciso
        // if (StringUtils.hasText(enderecoGeoRequestDTO.getBairro())) {
        //     addressBuilder.append(", ").append(enderecoGeoRequestDTO.getBairro());
        // }
        if (StringUtils.hasText(enderecoGeoRequestDTO.getCidade())) {
            addressBuilder.append(", ").append(enderecoGeoRequestDTO.getCidade());
        }
        if (StringUtils.hasText(enderecoGeoRequestDTO.getUf())) {
            addressBuilder.append(" - ").append(enderecoGeoRequestDTO.getUf());
        }
        // CEP pode ser usado no components ou na query principal.
        // if (StringUtils.hasText(enderecoGeoRequestDTO.getCep())) {
        //     addressBuilder.append(", ").append(formatarCep(enderecoGeoRequestDTO.getCep()));
        // }
        // Adicionar país é uma boa prática para desambiguação, mas o 'components' já faz isso.
        // addressBuilder.append(", Brasil");

        String addressQuery = addressBuilder.toString().replaceFirst("^, ", "").trim();

        if (!StringUtils.hasText(addressQuery) || !StringUtils.hasText(enderecoGeoRequestDTO.getCidade()) || !StringUtils.hasText(enderecoGeoRequestDTO.getUf())) {
            throw new IllegalArgumentException("Dados de endereço insuficientes para geocodificação (requer pelo menos logradouro/número, cidade e UF, ou cidade e UF).");
        }

        String components = "country:BR";
        if (StringUtils.hasText(enderecoGeoRequestDTO.getCep())) {
            components += "|postal_code:" + formatarCep(enderecoGeoRequestDTO.getCep());
        }
        // Você pode também adicionar 'administrative_area' para o estado e 'locality' para a cidade aqui
        // if (StringUtils.hasText(enderecoGeoRequestDTO.getUf())) {
        //    components += "|administrative_area:" + enderecoGeoRequestDTO.getUf();
        // }
        // if (StringUtils.hasText(enderecoGeoRequestDTO.getCidade())) {
        //    components += "|locality:" + enderecoGeoRequestDTO.getCidade();
        // }

        logger.info("Iniciando geocodificação com Google para endereço: '{}', componentes: '{}'", addressQuery, components);
        GoogleGeocodingApiResponseDTO googleResponse = geoCodingClient.buscarCoordenadasPorEnderecoGoogle(addressQuery, components, "pt-BR");

        if (googleResponse == null || !"OK".equals(googleResponse.getStatus()) || googleResponse.getResults() == null || googleResponse.getResults().isEmpty()) {
            String status = googleResponse != null ? googleResponse.getStatus() : "Resposta Nula da API";
            String errorMessage = googleResponse != null ? googleResponse.getErrorMessage() : "Nenhuma informação de erro detalhada.";
            logger.warn("Google Geocoding API não retornou resultados válidos para o endereço '{}'. Status: {}. Mensagem: {}", addressQuery, status, errorMessage);

            // Tentar uma query ainda mais simples (apenas cidade, estado, país) se a primeira falhou com ZERO_RESULTS
            if ("ZERO_RESULTS".equals(status) && StringUtils.hasText(enderecoGeoRequestDTO.getCidade()) && StringUtils.hasText(enderecoGeoRequestDTO.getUf())) {
                String simplerAddressQuery = String.join(", ", enderecoGeoRequestDTO.getCidade(), enderecoGeoRequestDTO.getUf(), "Brasil");
                String simplerComponents = "country:BR"; // Mantém a restrição de país
                logger.info("Tentando fallback com query mais simples para Google: '{}', componentes: '{}'", simplerAddressQuery, simplerComponents);
                googleResponse = geoCodingClient.buscarCoordenadasPorEnderecoGoogle(simplerAddressQuery, simplerComponents, "pt-BR");

                if (googleResponse == null || !"OK".equals(googleResponse.getStatus()) || googleResponse.getResults() == null || googleResponse.getResults().isEmpty()) {
                    status = googleResponse != null ? googleResponse.getStatus() : "Resposta Nula da API (fallback)";
                    errorMessage = googleResponse != null ? googleResponse.getErrorMessage() : "Nenhuma informação de erro detalhada (fallback).";
                    logger.warn("Fallback da Google Geocoding API também falhou. Status: {}. Mensagem: {}", status, errorMessage);
                    throw new ResourceNotFoundException("Não foi possível encontrar coordenadas para o endereço fornecido via Google. Status da API: " + status);
                }
            } else {
                throw new ResourceNotFoundException("Não foi possível encontrar coordenadas para o endereço fornecido via Google. Status da API: " + status);
            }
        }

        GoogleGeocodingResultDTO bestResult = googleResponse.getResults().get(0);

        if (bestResult.getGeometry() == null || bestResult.getGeometry().getLocation() == null) {
            logger.warn("Resultado do Google Geocoding API sem geometria ou localização para o endereço '{}'.", addressQuery);
            throw new ResourceNotFoundException("Resultado da geocodificação do Google inválido (sem geometria/localização).");
        }

        double latitude = bestResult.getGeometry().getLocation().getLatitude();
        double longitude = bestResult.getGeometry().getLocation().getLongitude();
        String formattedAddress = bestResult.getFormattedAddress();

        logger.info("Coordenadas encontradas via Google para query '{}': Lat={}, Lon={}, Endereço Formatado='{}'",
                addressQuery, latitude, longitude, formattedAddress);
        return new GeoCoordinatesDTO(latitude, longitude, formattedAddress);
    }
}