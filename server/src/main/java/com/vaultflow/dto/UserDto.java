package com.vaultflow.dto;

import com.vaultflow.model.User;

import java.math.BigDecimal;
import java.time.Instant;

public class UserDto {

    private String id;
    private String name;
    private String email;
    private String currencyCode;
    private BigDecimal startingBalance;
    private Instant createdAt;

    public UserDto() {
    }

    public UserDto(String id, String name, String email, String currencyCode, BigDecimal startingBalance, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.currencyCode = currencyCode;
        this.startingBalance = startingBalance;
        this.createdAt = createdAt;
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getCurrencyCode(),
            user.getStartingBalance(),
            user.getCreatedAt()
        );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
