package com.vaultflow.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^\\p{L}[\\p{L}\\p{M} .'\\u2019-]{1,49}$",
             message = "Name can only contain letters, spaces, hyphens, apostrophes and periods, and must be 2 to 50 characters long")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters long")
    private String password;

    private String currencyCode;

    @DecimalMin(value = "0.0", inclusive = true, message = "Starting balance cannot be negative")
    private BigDecimal startingBalance;

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String password, String currencyCode, BigDecimal startingBalance) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.currencyCode = currencyCode;
        this.startingBalance = startingBalance;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
