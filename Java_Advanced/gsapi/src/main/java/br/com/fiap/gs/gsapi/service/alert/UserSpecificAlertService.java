// Pacote: br.com.fiap.gs.gsapi.service.alert
package br.com.fiap.gs.gsapi.service.alert;

import br.com.fiap.gs.gsapi.dto.alert.AlertableEventDTO;
import br.com.fiap.gs.gsapi.exception.ResourceNotFoundException;
import br.com.fiap.gs.gsapi.model.Cliente; // Usando a entidade Cliente existente
import br.com.fiap.gs.gsapi.model.Contato; // Para pegar o email do contato principal
import br.com.fiap.gs.gsapi.repository.ClienteRepository; // Usando o repositório existente
import br.com.fiap.gs.gsapi.service.notification.EmailNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Optional;

@Service
public class UserSpecificAlertService {

    private static final Logger logger = LoggerFactory.getLogger(UserSpecificAlertService.class);

    private final ClienteRepository clienteRepository;
    private final EmailNotificationService emailNotificationService;

    @Autowired
    public UserSpecificAlertService(ClienteRepository clienteRepository,
                                    EmailNotificationService emailNotificationService) {
        this.clienteRepository = clienteRepository;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional(readOnly = true) // readOnly = true pois apenas lê e envia email (envio de email é externo)
    public void processAndSendAlert(Long userId, AlertableEventDTO eventDetails) {
        logger.info("Processando alerta para usuário ID: {} sobre evento: {}", userId, eventDetails.getTitle());

        Cliente usuario = clienteRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Usuário com ID: {} não encontrado para envio de alerta.", userId);
                    return new ResourceNotFoundException("Usuário com ID: " + userId + " não encontrado.");
                });

        // Tenta obter o e-mail do primeiro contato ou do contato marcado como principal (se houver tal lógica)
        // Por simplicidade, pegaremos o primeiro e-mail encontrado.
        Optional<String> recipientEmailOpt = usuario.getContatos().stream()
                .filter(contato -> contato.getEmail() != null && !contato.getEmail().isEmpty())
                .map(Contato::getEmail)
                // Poderia adicionar uma lógica para priorizar contato "Principal" se existir esse campo.
                // .sorted(Comparator.comparing(contato -> "Principal".equalsIgnoreCase(contato.getTipoContato()) ? 0 : 1)) 
                .findFirst();

        if (recipientEmailOpt.isPresent()) {
            String recipientEmail = recipientEmailOpt.get();
            String userName = usuario.getNome(); // Ou nome completo se preferir

            // Preenchendo a descrição do evento para o email, caso não venha do frontend
            String eventDescriptionForEmail = eventDetails.getDescription();
            if (eventDescriptionForEmail == null || eventDescriptionForEmail.isEmpty()) {
                eventDescriptionForEmail = "Um evento natural foi detectado nas proximidades.";
            }
            AlertableEventDTO emailEventDetails = new AlertableEventDTO(
                    eventDetails.getEventId(),
                    eventDetails.getTitle(),
                    eventDetails.getEventDate(),
                    eventDetails.getLink(),
                    eventDescriptionForEmail
            );

            emailNotificationService.sendEventAlertEmail(recipientEmail, userName, emailEventDetails);
        } else {
            logger.warn("Usuário ID: {} ({}) não possui um e-mail de contato válido cadastrado. Alerta não enviado.", userId, usuario.getNome());
            // Poderia lançar uma exceção customizada ou apenas logar, dependendo da política de negócios.
        }
    }
}