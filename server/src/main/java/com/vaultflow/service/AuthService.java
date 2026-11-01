package com.vaultflow.service;

import com.vaultflow.dto.AuthResponse;
import com.vaultflow.dto.LoginRequest;
import com.vaultflow.dto.RegisterRequest;
import com.vaultflow.dto.UpdateProfileRequest;
import com.vaultflow.dto.UserDto;
import com.vaultflow.exception.BadRequestException;
import com.vaultflow.exception.ResourceNotFoundException;
import com.vaultflow.exception.UnauthorizedException;
import com.vaultflow.model.User;
import com.vaultflow.repository.UserRepository;
import com.vaultflow.security.JwtUtils;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getName().trim(),
                normalizedEmail,
                hashedPassword,
                request.getCurrencyCode() != null ? request.getCurrencyCode() : "USD",
                request.getStartingBalance() != null ? request.getStartingBalance() : BigDecimal.ZERO
        );

        try {
            User savedUser = userRepository.save(user);
            String token = jwtUtils.generateTokenFromUserIdAndEmail(savedUser.getId(), savedUser.getEmail());
            return new AuthResponse(token, UserDto.fromEntity(savedUser));
        } catch (DuplicateKeyException ex) {
            throw new BadRequestException("An account with this email already exists.");
        }
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtils.generateTokenFromUserIdAndEmail(user.getId(), user.getEmail());
        return new AuthResponse(token, UserDto.fromEntity(user));
    }

    public UserDto updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setName(request.getName().trim());
        user.setCurrencyCode(request.getCurrencyCode());
        user.setStartingBalance(request.getStartingBalance());
        return UserDto.fromEntity(userRepository.save(user));
    }

    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserDto.fromEntity(user);
    }
}
