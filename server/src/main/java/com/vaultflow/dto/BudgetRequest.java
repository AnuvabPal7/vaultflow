package com.vaultflow.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class BudgetRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Limit is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Budget limit cannot be negative")
    private BigDecimal limit;

    private String period = "monthly";

    public BudgetRequest() {
    }

    public BudgetRequest(String category, BigDecimal limit, String period) {
        this.category = category;
        this.limit = limit;
        this.period = period != null ? period : "monthly";
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
}
