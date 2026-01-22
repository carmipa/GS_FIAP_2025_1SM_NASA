package br.com.fiap.gs.gsapi.service;

import br.com.fiap.gs.gsapi.dto.request.ClienteRequestDTO;
import br.com.fiap.gs.gsapi.dto.response.ClienteResponseDTO;
import br.com.fiap.gs.gsapi.exception.ResourceNotFoundException;
import br.com.fiap.gs.gsapi.mapper.ClienteMapper;
// Não precisamos mais de ContatoMapper e EnderecoMapper injetados aqui para lógica de aninhados
// import br.com.fiap.gs.gsapi.mapper.ContatoMapper;
// import br.com.fiap.gs.gsapi.mapper.EnderecoMapper;
import br.com.fiap.gs.gsapi.model.Cliente;
import br.com.fiap.gs.gsapi.model.Contato;
import br.com.fiap.gs.gsapi.model.Endereco;
import br.com.fiap.gs.gsapi.repository.ClienteRepository;
import br.com.fiap.gs.gsapi.repository.ContatoRepository;
import br.com.fiap.gs.gsapi.repository.EnderecoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ContatoRepository contatoRepository;
    private final EnderecoRepository enderecoRepository;
    private final ClienteMapper clienteMapper;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository,
                          ContatoRepository contatoRepository,
                          EnderecoRepository enderecoRepository,
                          ClienteMapper clienteMapper) {
        this.clienteRepository = clienteRepository;
        this.contatoRepository = contatoRepository;
        this.enderecoRepository = enderecoRepository;
        this.clienteMapper = clienteMapper;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "clientes", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
    public Page<ClienteResponseDTO> listarTodos(Pageable pageable) {
        Page<Cliente> clientesPage = clienteRepository.findAll(pageable);
        return clientesPage.map(clienteMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "clienteById", key = "#id")
    public ClienteResponseDTO buscarPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o ID: " + id));
        return clienteMapper.toResponseDTO(cliente);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "clienteByDocumento", key = "#documento")
    public ClienteResponseDTO buscarPorDocumento(String documento) {
        Cliente cliente = clienteRepository.findByDocumento(documento)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o documento: " + documento));
        return clienteMapper.toResponseDTO(cliente);
    }

    @Transactional
    @CacheEvict(value = {"clientes", "clienteById", "clienteByDocumento", "clientesSearch"}, allEntries = true)
    public ClienteResponseDTO criarCliente(ClienteRequestDTO clienteRequestDTO) {
        if (clienteRepository.findByDocumento(clienteRequestDTO.getDocumento()).isPresent()) {
            throw new IllegalArgumentException("Já existe um cliente cadastrado com o documento: " + clienteRequestDTO.getDocumento());
        }

        Cliente cliente = clienteMapper.toEntity(clienteRequestDTO);

        if (clienteRequestDTO.getContatosIds() != null && !clienteRequestDTO.getContatosIds().isEmpty()) {
            Set<Contato> contatos = new HashSet<>(contatoRepository.findAllById(clienteRequestDTO.getContatosIds()));
            if (contatos.size() != clienteRequestDTO.getContatosIds().size()) {
                Set<Long> foundIds = contatos.stream().map(Contato::getIdContato).collect(Collectors.toSet());
                Set<Long> notFoundIds = clienteRequestDTO.getContatosIds().stream()
                        .filter(id -> !foundIds.contains(id))
                        .collect(Collectors.toSet());
                throw new ResourceNotFoundException("Um ou mais IDs de Contato não foram encontrados: " + notFoundIds);
            }
            cliente.setContatos(contatos);
        } else {
            cliente.setContatos(new HashSet<>());
        }

        if (clienteRequestDTO.getEnderecosIds() != null && !clienteRequestDTO.getEnderecosIds().isEmpty()) {
            Set<Endereco> enderecos = new HashSet<>(enderecoRepository.findAllById(clienteRequestDTO.getEnderecosIds()));
            if (enderecos.size() != clienteRequestDTO.getEnderecosIds().size()) {
                Set<Long> foundIds = enderecos.stream().map(Endereco::getIdEndereco).collect(Collectors.toSet());
                Set<Long> notFoundIds = clienteRequestDTO.getEnderecosIds().stream()
                        .filter(id -> !foundIds.contains(id))
                        .collect(Collectors.toSet());
                throw new ResourceNotFoundException("Um ou mais IDs de Endereço não foram encontrados: " + notFoundIds);
            }
            cliente.setEnderecos(enderecos);
        } else {
            cliente.setEnderecos(new HashSet<>());
        }

        Cliente clienteSalvo = clienteRepository.save(cliente);
        return clienteMapper.toResponseDTO(clienteSalvo);
    }

    @Transactional
    @CachePut(value = "clienteById", key = "#id")
    @CacheEvict(value = {"clientes", "clienteByDocumento", "clientesSearch"}, allEntries = true)
    public ClienteResponseDTO atualizarCliente(Long id, ClienteRequestDTO clienteRequestDTO) {
        Cliente clienteExistente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o ID: " + id));

        if (!clienteExistente.getDocumento().equals(clienteRequestDTO.getDocumento()) &&
                clienteRepository.findByDocumento(clienteRequestDTO.getDocumento()).filter(c -> !c.getIdCliente().equals(id)).isPresent()) {
            throw new IllegalArgumentException("Já existe outro cliente cadastrado com o documento: " + clienteRequestDTO.getDocumento());
        }

        clienteMapper.updateClienteFromDto(clienteRequestDTO, clienteExistente);

        if (clienteRequestDTO.getContatosIds() != null) {
            if (clienteRequestDTO.getContatosIds().isEmpty()){
                clienteExistente.getContatos().clear();
            } else {
                Set<Contato> contatos = new HashSet<>(contatoRepository.findAllById(clienteRequestDTO.getContatosIds()));
                if (contatos.size() != clienteRequestDTO.getContatosIds().size()) {
                    Set<Long> foundIds = contatos.stream().map(Contato::getIdContato).collect(Collectors.toSet());
                    Set<Long> notFoundIds = clienteRequestDTO.getContatosIds().stream()
                            .filter(contactId -> !foundIds.contains(contactId))
                            .collect(Collectors.toSet());
                    throw new ResourceNotFoundException("Um ou mais IDs de Contato fornecidos para atualização não foram encontrados: " + notFoundIds);
                }
                clienteExistente.setContatos(contatos);
            }
        } else { // Se contatosIds for nulo, não altera os contatos existentes (ou pode optar por limpar, dependendo da regra)
            // clienteExistente.getContatos().clear(); // Descomente se nulo deve limpar
        }


        if (clienteRequestDTO.getEnderecosIds() != null) {
            if (clienteRequestDTO.getEnderecosIds().isEmpty()){
                clienteExistente.getEnderecos().clear();
            } else {
                Set<Endereco> enderecos = new HashSet<>(enderecoRepository.findAllById(clienteRequestDTO.getEnderecosIds()));
                if (enderecos.size() != clienteRequestDTO.getEnderecosIds().size()) {
                    Set<Long> foundIds = enderecos.stream().map(Endereco::getIdEndereco).collect(Collectors.toSet());
                    Set<Long> notFoundIds = clienteRequestDTO.getEnderecosIds().stream()
                            .filter(addressId -> !foundIds.contains(addressId))
                            .collect(Collectors.toSet());
                    throw new ResourceNotFoundException("Um ou mais IDs de Endereço fornecidos para atualização não foram encontrados: " + notFoundIds);
                }
                clienteExistente.setEnderecos(enderecos);
            }
        } else { // Se enderecosIds for nulo, não altera os endereços existentes
            // clienteExistente.getEnderecos().clear(); // Descomente se nulo deve limpar
        }

        Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
        return clienteMapper.toResponseDTO(clienteAtualizado);
    }

    @Transactional
    @CacheEvict(value = {"clientes", "clienteById", "clienteByDocumento", "clientesSearch"}, allEntries = true)
    public void deletarCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente não encontrado com o ID: " + id);
        }
        clienteRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "clientesSearch", key = "#termo + '-' + #pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
    public Page<ClienteResponseDTO> pesquisarClientes(String termo, Pageable pageable) {
        Page<Cliente> clientesPage = clienteRepository.searchByNomeOrSobrenome(termo, pageable);
        return clientesPage.map(clienteMapper::toResponseDTO);
    }
}