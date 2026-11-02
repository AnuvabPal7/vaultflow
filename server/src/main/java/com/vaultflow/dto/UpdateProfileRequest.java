package com.vaultflow.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^\\p{L}[\\p{L}\\p{M} .'\\u2019-]{1,49}$",
             message = "Name can only contain letters, spaces, hyphens, apostrophes and periods, and must be 2 to 50 characters long")
    private String name;

    @NotBlank(message = "Currency code is required")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be a 3-letter code such as INR")
    private String currencyCode;

    @NotNull(message = "Starting balance is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Starting balance cannot be negative")
    private BigDecimal startingBalance;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String name, String currencyCode, BigDecimal startingBalance) {
        this.name = name;
        this.currencyCode = currencyCode;
        this.startingBalance = startingBalance;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public BigDecimal getStartingBalance() {
        return startingBalance;
    }

    public void setStartingBalance(BigDecimal startingBalance) {
        this.startingBalance = startingBalance;
    }
}