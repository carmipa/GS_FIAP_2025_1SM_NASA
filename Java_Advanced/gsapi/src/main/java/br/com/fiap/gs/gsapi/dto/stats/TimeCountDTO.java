// Arquivo: src/main/java/br/com/fiap/gs/gsapi/dto/stats/TimeCountDTO.java
package br.com.fiap.gs.gsapi.dto.stats;

public class TimeCountDTO {
    private String timeLabel;
    private Long count; // Assegure que é Long (wrapper)

    // Construtor padrão (JPA/Hibernate podem precisar em alguns cenários, bom ter)
    public TimeCountDTO() {
    }

    // Construtor que a query JPQL usará - DEVE ser (String, Long)
    public TimeCountDTO(String timeLabel, Long count) {
        this.timeLabel = timeLabel;
        this.count = count;
    }

    // Getters
    public String getTimeLabel() {
        return timeLabel;
    }

    public Long getCount() {
        return count;
    }

    // Setters (Opcionais para DTOs de resposta, mas incluídos por completude)
    public void setTimeLabel(String timeLabel) {
        this.timeLabel = timeLabel;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}