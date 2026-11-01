package com.vaultflow.service;

import com.vaultflow.dto.BudgetRequest;
import com.vaultflow.exception.ResourceNotFoundException;
import com.vaultflow.model.Budget;
import com.vaultflow.repository.BudgetRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public List<Budget> getBudgets(String userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Budget setBudget(String userId, BudgetRequest request) {
        String cleanCategory = request.getCategory().trim();
        BigDecimal cleanLimit = (request.getLimit() != null && request.getLimit().compareTo(BigDecimal.ZERO) >= 0)
                ? request.getLimit()
                : BigDecimal.ZERO;

        Optional<Budget> existingOpt = budgetRepository.findByUserIdAndCategory(userId, cleanCategory);

        if (existingOpt.isPresent()) {
            Budget existing = existingOpt.get();
            existing.setLimit(cleanLimit);
            if (request.getPeriod() != null) {
                existing.setPeriod(request.getPeriod());
            }
            return budgetRepository.save(existing);
        } else {
            Budget budget = new Budget(
                    userId,
                    cleanCategory,
                    cleanLimit,
                    request.getPeriod() != null ? request.getPeriod() : "monthly"
            );
            try {
                return budgetRepository.save(budget);
            } catch (DuplicateKeyException ex) {
                // Concurrent insert race condition on unique compound index (userId, category):
                // Re-read the budget created by the concurrent request and update it
                Budget existing = budgetRepository.findByUserIdAndCategory(userId, cleanCategory)
                        .orElseThrow(() -> ex);
                existing.setLimit(cleanLimit);
                if (request.getPeriod() != null) {
                    existing.setPeriod(request.getPeriod());
                }
                return budgetRepository.save(existing);
            }
        }
    }

    public void deleteBudget(String id, String userId) {
        // Security fix: Return 404 whether the budget does not exist or belongs to another user
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        budgetRepository.delete(budget);
    }
}
