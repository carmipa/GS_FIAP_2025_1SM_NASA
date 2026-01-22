// Arquivo: src/main/java/br/com/fiap/gs/gsapi/service/EonetService.java
package br.com.fiap.gs.gsapi.service;

import br.com.fiap.gs.gsapi.client.NasaEonetClient;
import br.com.fiap.gs.gsapi.dto.external.NasaEonetApiResponseDTO;
import br.com.fiap.gs.gsapi.dto.external.NasaEonetCategoryDTO;
import br.com.fiap.gs.gsapi.dto.external.NasaEonetEventDTO;
import br.com.fiap.gs.gsapi.dto.request.EonetRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.EonetResponseDTO;
import br.com.fiap.gs.gsapi.dto.stats.CategoryCountDTO;
import br.com.fiap.gs.gsapi.exception.ResourceNotFoundException;
import br.com.fiap.gs.gsapi.mapper.EonetMapper;
import br.com.fiap.gs.gsapi.model.Eonet;
import br.com.fiap.gs.gsapi.repository.EonetRepository;
import br.com.fiap.gs.gsapi.utils.GeoUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

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

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EonetService {

    private static final Logger logger = LoggerFactory.getLogger(EonetService.class);

    private final EonetRepository eonetRepository;
    private final EonetMapper eonetMapper;
    private final NasaEonetClient nasaEonetClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public EonetService(EonetRepository eonetRepository,
                        EonetMapper eonetMapper,
                        NasaEonetClient nasaEonetClient,
                        ObjectMapper objectMapper) {
        this.eonetRepository = eonetRepository;
        this.eonetMapper = eonetMapper;
        this.nasaEonetClient = nasaEonetClient;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "eonetEventos", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
    public Page<EonetResponseDTO> listarTodosEventos(Pageable pageable) {
        Page<Eonet> eventosPage = eonetRepository.findAll(pageable);
        return eventosPage.map(eonetMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "eonetEventoById", key = "#id")
    public EonetResponseDTO buscarEventoPorIdInterno(Long id) {
        Eonet evento = eonetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento EONET não encontrado com o ID interno: " + id));
        return eonetMapper.toResponseDTO(evento);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "eonetEventoByApiId", key = "#eonetApiId")
    public EonetResponseDTO buscarEventoPorEonetApiId(String eonetApiId) {
        Eonet evento = eonetRepository.findByEonetIdApi(eonetApiId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento EONET não encontrado com o ID da API: " + eonetApiId));
        return eonetMapper.toResponseDTO(evento);
    }

    @Transactional
    @CacheEvict(value = {"eonetEventos", "eonetEventoById", "eonetEventoByApiId", "eonetEventosPorData", "eonetStatsCountByCategory", "eventosProximosDaAPI"}, allEntries = true)
    public EonetResponseDTO salvarEventoManualmente(EonetRequestDTO eonetRequestDTO) {
        eonetRepository.findByEonetIdApi(eonetRequestDTO.getEonetIdApi()).ifPresent(existingEvent -> {
            throw new IllegalArgumentException("Já existe um evento EONET registrado com o API ID: " + eonetRequestDTO.getEonetIdApi());
        });
        Eonet evento = eonetMapper.toEntity(eonetRequestDTO);
        Eonet eventoSalvo = eonetRepository.save(evento);
        return eonetMapper.toResponseDTO(eventoSalvo);
    }

    @Transactional
    @CachePut(value = "eonetEventoById", key = "#idInterno")
    @CacheEvict(value = {"eonetEventos", "eonetEventoByApiId", "eonetEventosPorData", "eonetStatsCountByCategory", "eventosProximosDaAPI"}, allEntries = true)
    public EonetResponseDTO atualizarEventoManualmente(Long idInterno, EonetRequestDTO eonetRequestDTO) {
        Eonet eventoExistente = eonetRepository.findById(idInterno)
                .orElseThrow(() -> new ResourceNotFoundException("Evento EONET não encontrado com o ID interno: " + idInterno));
        if (!eventoExistente.getEonetIdApi().equals(eonetRequestDTO.getEonetIdApi())) {
            eonetRepository.findByEonetIdApi(eonetRequestDTO.getEonetIdApi()).ifPresent(anotherEvent -> {
                if (!anotherEvent.getIdEonet().equals(idInterno)) {
                    throw new IllegalArgumentException("Já existe outro evento EONET registrado com o API ID: " + eonetRequestDTO.getEonetIdApi());
                }
            });
        }
        eventoExistente.setEonetIdApi(eonetRequestDTO.getEonetIdApi());
        eventoExistente.setJson(eonetRequestDTO.getJson());
        eventoExistente.setData(eonetRequestDTO.getData());
        Eonet eventoAtualizado = eonetRepository.save(eventoExistente);
        return eonetMapper.toResponseDTO(eventoAtualizado);
    }

    @Transactional
    @CacheEvict(value = {"eonetEventos", "eonetEventoById", "eonetEventoByApiId", "eonetEventosPorData", "eonetStatsCountByCategory", "eventosProximosDaAPI"}, allEntries = true)
    public void deletarEvento(Long idInterno) {
        if (!eonetRepository.existsById(idInterno)) {
            throw new ResourceNotFoundException("Evento EONET não encontrado com o ID interno: " + idInterno);
        }
        eonetRepository.deleteById(idInterno);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "eonetEventosPorData", key = "#dataInicial.toString() + '-' + #dataFinal.toString()")
    public List<EonetResponseDTO> buscarEventosPorIntervaloDeData(OffsetDateTime dataInicial, OffsetDateTime dataFinal) {
        if (dataInicial == null || dataFinal == null || dataInicial.isAfter(dataFinal)) {
            throw new IllegalArgumentException("Datas inválidas para busca. Data inicial deve ser anterior à data final.");
        }
        List<Eonet> eventos = eonetRepository.findByDataBetween(dataInicial, dataFinal);
        return eventos.stream()
                .map(eonetMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"eonetEventos", "eonetEventoById", "eonetEventoByApiId", "eonetEventosPorData", "eonetStatsCountByCategory", "eventosProximosDaAPI", "eonetStatsEventsOverTime"}, allEntries = true)
    public List<EonetResponseDTO> sincronizarEventosDaNasa(Integer limit, Integer days, String status, String source) {
        logger.info("Iniciando sincronização de eventos da NASA EONET. Limite: {}, Dias: {}, Status: {}, Fonte: {}",
                limit, days, status, source);
        // Passando null para os novos parâmetros (bbox, startDate, endDate, categoryId) pois não são usados aqui
        NasaEonetApiResponseDTO respostaDaApi = nasaEonetClient.getEvents(limit, days, status, source, null, null, null, null);
        List<EonetResponseDTO> eventosSalvosOuAtualizados = new ArrayList<>();

        if (respostaDaApi != null && respostaDaApi.getEvents() != null) {
            for (NasaEonetEventDTO eventoDtoDaApi : respostaDaApi.getEvents()) {
                if (eventoDtoDaApi.getId() == null) {
                    logger.warn("Evento da API EONET recebido sem ID, pulando: {}", eventoDtoDaApi.getTitle());
                    continue;
                }
                Eonet eventoParaSalvar = eonetRepository.findByEonetIdApi(eventoDtoDaApi.getId())
                        .orElse(new Eonet());
                eventoParaSalvar.setEonetIdApi(eventoDtoDaApi.getId());
                String eventoJsonString = nasaEonetClient.convertEventDtoToJsonString(eventoDtoDaApi);
                eventoParaSalvar.setJson(eventoJsonString);
                OffsetDateTime principalDate = null;
                if (eventoDtoDaApi.getGeometry() != null && !eventoDtoDaApi.getGeometry().isEmpty() && eventoDtoDaApi.getGeometry().get(0) != null) {
                    principalDate = eventoDtoDaApi.getGeometry().get(0).getDate();
                }
                eventoParaSalvar.setData(principalDate != null ? principalDate : OffsetDateTime.now());
                Eonet eonetSalvo = eonetRepository.save(eventoParaSalvar);
                eventosSalvosOuAtualizados.add(eonetMapper.toResponseDTO(eonetSalvo));
            }
            logger.info("{} eventos da NASA EONET processados. {} salvos/atualizados.",
                    respostaDaApi.getEvents().size(), eventosSalvosOuAtualizados.size());
        } else {
            logger.warn("Nenhum evento recebido da API da NASA EONET para os parâmetros fornecidos.");
        }
        return eventosSalvosOuAtualizados;
    }

    // ***** MÉTODO MODIFICADO PARA INCLUIR categoryId *****
    @Transactional(readOnly = true)
    @Cacheable(value = "eventosProximosDaAPI", key = "{#latitude, #longitude, #raioKm, #limit, #days, #status, #source, #startDate, #endDate, #categoryId}")
    public List<NasaEonetEventDTO> buscarEventosEonetProximosDaAPI(
            Double latitude, Double longitude, Double raioKm,
            Integer limit, Integer days, String status, String source,
            String startDate, String endDate, String categoryId) { // Novo parâmetro categoryId

        String bbox = null;
        Integer effectiveDays = days;

        if (StringUtils.hasText(startDate) || StringUtils.hasText(endDate)) {
            logger.info("Buscando eventos EONET por intervalo de datas: Start='{}', End='{}', Categoria='{}'", startDate, endDate, categoryId);
            effectiveDays = null;
        } else if (latitude != null && longitude != null && raioKm != null && raioKm > 0) {
            logger.info("Buscando eventos EONET próximos a Lat: {}, Lon: {}, Raio: {}km, Categoria='{}'", latitude, longitude, raioKm, categoryId);
            bbox = GeoUtils.calcularBoundingBox(latitude, longitude, raioKm);
            logger.info("Bounding Box calculado: {}", bbox);
        } else {
            logger.info("Buscando eventos EONET globais. Categoria='{}'", categoryId);
        }

        String effectiveStatus = status;
        if (bbox == null && !StringUtils.hasText(startDate) && !StringUtils.hasText(endDate) && !StringUtils.hasText(status)) {
            effectiveStatus = "all"; // NASA API usa 'all' para todos os status, não string vazia.
            // Ou deixe nulo/vazio se a API EONET tratar string vazia como "all".
            logger.info("Nenhum status especificado para busca global/por data, usando status 'all'.");
        }

        NasaEonetApiResponseDTO respostaDaApi = nasaEonetClient.getEvents(limit, effectiveDays, effectiveStatus, source, bbox, startDate, endDate, categoryId); // Passa categoryId

        if (respostaDaApi != null && respostaDaApi.getEvents() != null) {
            logger.info("{} eventos encontrados na API da NASA para os critérios fornecidos.", respostaDaApi.getEvents().size());
            return respostaDaApi.getEvents();
        }

        logger.info("Nenhum evento encontrado na API da NASA para os critérios fornecidos (respostaDaApi ou eventos nulos).");
        return Collections.emptyList();
    }
    // ***** FIM DA MODIFICAÇÃO *****

    @Transactional(readOnly = true)
    @Cacheable(value = "eonetStatsCountByCategory", key = "#daysAgo")
    public List<CategoryCountDTO> getEventCountByCategoryLastXDays(int daysAgo) {
        if (daysAgo <= 0) {
            throw new IllegalArgumentException("O número de dias ('daysAgo') deve ser positivo.");
        }
        OffsetDateTime dataFinal = OffsetDateTime.now();
        OffsetDateTime dataInicial = dataFinal.minus(daysAgo, ChronoUnit.DAYS);
        logger.info("Calculando estatísticas de eventos por categoria de {} até {}", dataInicial, dataFinal);
        List<Eonet> eventosNoPeriodo = eonetRepository.findByDataBetween(dataInicial, dataFinal);
        logger.info("Estatísticas: {} eventos locais encontrados entre {} e {} para contagem por categoria.", eventosNoPeriodo.size(), dataInicial, dataFinal);

        Map<String, Long> categoryCounts = eventosNoPeriodo.stream()
                .filter(eonet -> StringUtils.hasText(eonet.getJson()))
                .map(eonet -> {
                    try {
                        NasaEonetEventDTO eventoDetalhes = objectMapper.readValue(eonet.getJson(), NasaEonetEventDTO.class);
                        return eventoDetalhes.getCategories();
                    } catch (Exception e) {
                        logger.error("Erro ao parsear JSON do evento local ID {}: {}. JSON: {}",
                                eonet.getEonetIdApi() != null ? eonet.getEonetIdApi() : eonet.getIdEonet(),
                                e.getMessage(),
                                eonet.getJson().substring(0, Math.min(eonet.getJson().length(), 200)));
                        return Collections.<NasaEonetCategoryDTO>emptyList();
                    }
                })
                .filter(categories -> categories != null && !categories.isEmpty())
                .flatMap(List::stream) // Desaninha a lista de categorias de cada evento
                .map(NasaEonetCategoryDTO::getTitle) // Pega o título de cada categoria
                .filter(StringUtils::hasText) // Filtra títulos vazios
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting())); // Agrupa por título e conta

        return categoryCounts.entrySet().stream()
                .map(entry -> new CategoryCountDTO(entry.getKey(), entry.getValue()))
                .sorted((c1, c2) -> Long.compare(c2.getCount(), c1.getCount())) // Ordena por contagem decrescente
                .collect(Collectors.toList());
    }


}