package com.vaultflow.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "budgets")
@CompoundIndexes({
    @CompoundIndex(name = "user_category_unique_idx", def = "{'userId': 1, 'category': 1}", unique = true)
})
public class Budget {

    @Id
    private String id;

    private String userId;

    private String category;

    private BigDecimal limit;

    private String period = "monthly";

    private Instant createdAt = Instant.now();

    public Budget() {
    }

    public Budget(String userId, String category, BigDecimal limit, String period) {
        this.userId = userId;
        this.category = category;
        this.limit = limit;
        this.period = period != null ? period : "monthly";
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getLimit() {
        return limit;
    }

    public void setLimit(BigDecimal limit) {
        this.limit = limit;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
