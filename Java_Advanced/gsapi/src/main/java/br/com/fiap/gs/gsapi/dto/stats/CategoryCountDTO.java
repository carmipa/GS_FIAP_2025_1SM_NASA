// Arquivo: src/main/java/br/com/fiap/gs/gsapi/dto/stats/CategoryCountDTO.java
package br.com.fiap.gs.gsapi.dto.stats;

public class CategoryCountDTO {
    private String categoryTitle;
    private long count;

    public CategoryCountDTO() {
    }

    public CategoryCountDTO(String categoryTitle, long count) {
        this.categoryTitle = categoryTitle;
        this.count = count;
    }

    // Getters e Setters
    public String getCategoryTitle() {
        return categoryTitle;
    }

    public void setCategoryTitle(String categoryTitle) {
        this.categoryTitle = categoryTitle;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}