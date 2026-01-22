// Pacote: br.com.fiap.gs.gsapi.service.notification
package br.com.fiap.gs.gsapi.service.notification;

import br.com.fiap.gs.gsapi.dto.alert.AlertableEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    private final JavaMailSender mailSender;

    @Autowired
    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEventAlertEmail(String recipientEmail, String userName, AlertableEventDTO eventDetails) {
        if (recipientEmail == null || recipientEmail.isEmpty()) {
            logger.warn("Não foi possível enviar email de alerta: destinatário de email nulo ou vazio para o usuário {}", userName);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject("GS Alerta Desastres: Novo Evento Próximo à Sua Localização!");

            StringBuilder emailBody = new StringBuilder();
            emailBody.append("Olá, ").append(userName).append("!\n\n");
            emailBody.append("Detectamos um evento de desastre natural próximo a uma de suas localizações cadastradas:\n\n");
            emailBody.append("Evento: ").append(eventDetails.getTitle()).append("\n");
            if (eventDetails.getEventDate() != null && !eventDetails.getEventDate().isEmpty()) {
                emailBody.append("Data do Evento: ").append(eventDetails.getEventDate()).append("\n");
            }
            if (eventDetails.getDescription() != null && !eventDetails.getDescription().isEmpty()) {
                emailBody.append("Descrição: ").append(eventDetails.getDescription()).append("\n");
            }
            if (eventDetails.getLink() != null && !eventDetails.getLink().isEmpty()) {
                emailBody.append("Mais informações em: ").append(eventDetails.getLink()).append("\n");
            }
            emailBody.append("\nPor favor, tome as precauções necessárias.\n\n");
            emailBody.append("Atenciosamente,\nEquipe GS Alerta Desastres");

            message.setText(emailBody.toString());

            // Você precisará configurar o remetente no application.properties (spring.mail.username)
            // message.setFrom("seu-email@example.com"); // Opcional se já configurado globalmente

            mailSender.send(message);
            logger.info("Email de alerta enviado com sucesso para {} sobre o evento {}", recipientEmail, eventDetails.getEventId());

        } catch (MailException e) {
            logger.error("Falha ao enviar email de alerta para {}: {}", recipientEmail, e.getMessage(), e);
            // Considerar adicionar uma lógica de retentativa ou notificar um administrador
        } catch (Exception e) {
            logger.error("Erro inesperado ao tentar enviar email de alerta para {}: {}", recipientEmail, e.getMessage(), e);
        }
    }
}