package br.com.fiap.gs.gsapi.service;

import br.com.fiap.gs.gsapi.dto.request.ContatoRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.ContatoResponseDTO;
import br.com.fiap.gs.gsapi.exception.ResourceNotFoundException;
import br.com.fiap.gs.gsapi.mapper.ContatoMapper;
import br.com.fiap.gs.gsapi.model.Contato;
import br.com.fiap.gs.gsapi.repository.ContatoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContatoService {

    private final ContatoRepository contatoRepository;
    private final ContatoMapper contatoMapper; // Mapper injetado

    @Autowired
    public ContatoService(ContatoRepository contatoRepository, ContatoMapper contatoMapper) { // Construtor
        this.contatoRepository = contatoRepository;
        this.contatoMapper = contatoMapper;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "contatos", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
    public Page<ContatoResponseDTO> listarTodos(Pageable pageable) {
        Page<Contato> contatosPage = contatoRepository.findAll(pageable);
        return contatosPage.map(contatoMapper::toResponseDTO); // Usando o mapper
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "contatoById", key = "#id")
    public ContatoResponseDTO buscarPorId(Long id) {
        Contato contato = contatoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contato não encontrado com o ID: " + id));
        return contatoMapper.toResponseDTO(contato); // Usando o mapper
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "contatoByEmail", key = "#email")
    public ContatoResponseDTO buscarPorEmail(String email) {
        Contato contato = contatoRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Contato não encontrado com o e-mail: " + email));
        return contatoMapper.toResponseDTO(contato);
    }

    @Transactional
    @CacheEvict(value = {"contatos", "contatoById", "contatoByEmail"}, allEntries = true)
    public ContatoResponseDTO criarContato(ContatoRequestDTO contatoRequestDTO) {
        // Validação de e-mail duplicado (exemplo de regra de negócio)
        if (contatoRepository.findByEmail(contatoRequestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Já existe um contato cadastrado com o e-mail: " + contatoRequestDTO.getEmail());
        }

        Contato contato = contatoMapper.toEntity(contatoRequestDTO); // Usando o mapper
        // A associação com Cliente é feita através do ClienteService ou por endpoints específicos
        // de associação, não diretamente aqui na criação isolada de um contato.
        Contato contatoSalvo = contatoRepository.save(contato);
        return contatoMapper.toResponseDTO(contatoSalvo); // Usando o mapper
    }

    @Transactional
    @CachePut(value = "contatoById", key = "#id")
    @CacheEvict(value = {"contatos", "contatoByEmail"}, allEntries = true)
    public ContatoResponseDTO atualizarContato(Long id, ContatoRequestDTO contatoRequestDTO) {
        Contato contatoExistente = contatoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contato não encontrado com o ID: " + id));

        // Validação para não alterar o e-mail para um já existente em outro contato
        if (!contatoExistente.getEmail().equalsIgnoreCase(contatoRequestDTO.getEmail()) &&
                contatoRepository.findByEmail(contatoRequestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Já existe outro contato cadastrado com o e-mail: " + contatoRequestDTO.getEmail());
        }

        // Atualiza os campos da entidade existente
        // Poderia usar MapStruct com @MappingTarget: contatoMapper.updateEntityFromDto(contatoRequestDTO, contatoExistente);
        contatoExistente.setDdd(contatoRequestDTO.getDdd());
        contatoExistente.setTelefone(contatoRequestDTO.getTelefone());
        contatoExistente.setCelular(contatoRequestDTO.getCelular());
        contatoExistente.setWhatsapp(contatoRequestDTO.getWhatsapp());
        contatoExistente.setEmail(contatoRequestDTO.getEmail());
        contatoExistente.setTipoContato(contatoRequestDTO.getTipoContato());

        Contato contatoAtualizado = contatoRepository.save(contatoExistente);
        return contatoMapper.toResponseDTO(contatoAtualizado); // Usando o mapper
    }

    @Transactional
    @CacheEvict(value = {"contatos", "contatoById", "contatoByEmail"}, allEntries = true)
    public void deletarContato(Long id) {
        Contato contato = contatoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contato não encontrado com o ID: " + id));

        // Antes de deletar, é importante considerar as associações com Cliente.
        // A exclusão de um Contato aqui removerá o registro da tb_contato3. [cite: 8]
        // As entradas na tabela de junção tb_clientecontato3 [cite: 4] que referenciam este contato
        // também devem ser removidas. O provedor JPA (Hibernate) geralmente cuida disso
        // se o relacionamento ManyToMany for corretamente configurado (especialmente do lado do Cliente).
        // Se um contato for deletado, os Clientes associados não serão deletados, apenas a associação será desfeita.
        if (!contato.getClientes().isEmpty()) {
            // Poderia lançar uma exceção se a regra de negócio impedir deletar contato associado,
            // ou desassociar programaticamente (embora a JPA deva cuidar disso ao remover da coleção em Cliente ou pela FK).
            // Ex: throw new IllegalStateException("Não é possível deletar contato pois está associado a clientes.");
            // Ou, limpar as associações nos clientes se necessário (geralmente não é feito aqui).
        }
        contatoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "contatosPorTipo", key = "#tipoContato + '-' + #pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
    public Page<ContatoResponseDTO> buscarPorTipoContato(String tipoContato, Pageable pageable) {
        // Supondo que você crie um método no ContatoRepository:
        // Page<Contato> findByTipoContatoIgnoreCase(String tipoContato, Pageable pageable);
        // Se não, pode ser List<Contato> e você faz a paginação manualmente (menos ideal)
        // ou ajusta o repositório.
        // Por ora, vou usar o método que retorna List e adaptar, ou sugerir a criação do método paginável.
        // Para este exemplo, vou assumir que você adicionará o método paginável ao repositório:
        // Page<Contato> contatosPage = contatoRepository.findByTipoContatoIgnoreCase(tipoContato, pageable);
        // return contatosPage.map(contatoMapper::toResponseDTO);

        // Se o método no repositório for List<Contato> findByTipoContatoIgnoreCase(String tipoContato);
        List<ContatoResponseDTO> listaContatos = contatoRepository.findByTipoContatoIgnoreCase(tipoContato)
                .stream()
                .map(contatoMapper::toResponseDTO)
                .collect(Collectors.toList());
        // A conversão para Page aqui seria manual e mais complexa. É melhor ter o método paginado no repositório.
        // Se você adicionar Page<Contato> findByTipoContatoIgnoreCase(String tipoContato, Pageable pageable)
        // no ContatoRepository, o código acima (comentado) é o ideal.
        // Por enquanto, vou deixar como está, mas recomendo o ajuste no repositório para paginação correta.

        // Para fins de exemplo e para não falhar, se o método no repo for List:
        // Este retorno não é paginado, mas demonstra a busca.
        // return new PageImpl<>(listaContatos, pageable, listaContatos.size());
        // O ideal é:
        // Page<Contato> page = contatoRepository.findByTipoContatoIgnoreCase(tipoContato, pageable);
        // return page.map(contatoMapper::toResponseDTO);
        // Para isso, o ContatoRepository precisaria de:
        // Page<Contato> findByTipoContatoIgnoreCase(String tipoContato, Pageable pageable);
        // Vou assumir que você adicionará esse método ao ContatoRepository.
        // Se não for adicionado, este método do serviço precisará de ajustes ou não suportará paginação corretamente.
        // throw new UnsupportedOperationException("Paginable findByTipoContatoIgnoreCase não implementado no repositório.");

        // Assumindo que ContatoRepository.findByTipoContatoIgnoreCase(tipoContato, pageable) existe:
        Page<Contato> contatosPage = contatoRepository.findByTipoContatoIgnoreCase(tipoContato, pageable); // Supondo que este método foi adicionado ao ContatoRepository
        return contatosPage.map(contatoMapper::toResponseDTO);
    }
}
