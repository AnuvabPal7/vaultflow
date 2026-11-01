package com.vaultflow.controller;

import com.vaultflow.dto.BudgetRequest;
import com.vaultflow.model.Budget;
import com.vaultflow.security.UserPrincipal;
import com.vaultflow.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBudgets(@AuthenticationPrincipal UserPrincipal principal) {
        List<Budget> budgets = budgetService.getBudgets(principal.getId());
        return ResponseEntity.ok(Map.of(
                "budgets", budgets,
                "count", budgets.size()
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> setBudget(
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Budget saved = budgetService.setBudget(principal.getId(), request);
        return ResponseEntity.ok(Map.of(
                "budget", saved,
                "message", "Budget cap saved successfully"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBudget(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        budgetService.deleteBudget(id, principal.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Budget cap deleted successfully"
        ));
    }
}
