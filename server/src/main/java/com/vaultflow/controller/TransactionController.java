package com.vaultflow.controller;

import com.vaultflow.dto.TransactionRequest;
import com.vaultflow.model.Transaction;
import com.vaultflow.security.UserPrincipal;
import com.vaultflow.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search
    ) {
        List<Transaction> transactions = transactionService.getTransactions(
                principal.getId(),
                startDate,
                endDate,
                category,
                type,
                search
        );

        return ResponseEntity.ok(Map.of(
                "transactions", transactions,
                "count", transactions.size()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Transaction tx = transactionService.getTransactionById(id, principal.getId());
        return ResponseEntity.ok(tx);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Transaction created = transactionService.createTransaction(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "transaction", created,
                "message", "Transaction created successfully"
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTransaction(
            @PathVariable String id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Transaction updated = transactionService.updateTransaction(id, principal.getId(), request);
        return ResponseEntity.ok(Map.of(
                "transaction", updated,
                "message", "Transaction updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTransaction(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        transactionService.deleteTransaction(id, principal.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Transaction deleted successfully"
        ));
    }
}
