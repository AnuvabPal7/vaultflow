package com.vaultflow.service;

import com.vaultflow.dto.TransactionRequest;
import com.vaultflow.exception.BadRequestException;
import com.vaultflow.exception.ResourceNotFoundException;
import com.vaultflow.model.Transaction;
import com.vaultflow.repository.TransactionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final MongoTemplate mongoTemplate;

    public TransactionService(TransactionRepository transactionRepository, MongoTemplate mongoTemplate) {
        this.transactionRepository = transactionRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public List<Transaction> getTransactions(
            String userId,
            String startDate,
            String endDate,
            String category,
            String type,
            String search
    ) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        // Always strictly scoped to the authenticated user's ID
        criteriaList.add(Criteria.where("userId").is(userId));

        if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("all")) {
            criteriaList.add(Criteria.where("type").is(type.trim().toLowerCase()));
        }

        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            criteriaList.add(Criteria.where("category").is(category.trim()));
        }

        LocalDate startLocalDate = null;
        LocalDate endLocalDate = null;

        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                startLocalDate = LocalDate.parse(startDate.trim());
            } catch (DateTimeParseException e) {
                throw new BadRequestException("startDate must be in YYYY-MM-DD format");
            }
        }

        if (endDate != null && !endDate.trim().isEmpty()) {
            try {
                endLocalDate = LocalDate.parse(endDate.trim());
            } catch (DateTimeParseException e) {
                throw new BadRequestException("endDate must be in YYYY-MM-DD format");
            }
        }

        if (startLocalDate != null && endLocalDate != null) {
            if (startLocalDate.isAfter(endLocalDate)) {
                throw new BadRequestException("startDate cannot be after endDate");
            }
            criteriaList.add(Criteria.where("date").gte(startLocalDate).lte(endLocalDate));
        } else if (startLocalDate != null) {
            criteriaList.add(Criteria.where("date").gte(startLocalDate));
        } else if (endLocalDate != null) {
            criteriaList.add(Criteria.where("date").lte(endLocalDate));
        }

        // Security fix: wrap search text in Pattern.quote to prevent regex injection
        if (search != null && !search.trim().isEmpty()) {
            String literalPattern = Pattern.quote(search.trim());
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("notes").regex(literalPattern, "i"),
                    Criteria.where("category").regex(literalPattern, "i")
            ));
        }

        query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        query.with(Sort.by(Sort.Direction.DESC, "date"));

        return mongoTemplate.find(query, Transaction.class);
    }

    public Transaction getTransactionById(String id, String userId) {
        // Security fix: Return 404 regardless of whether the ID doesn't exist or belongs to another user
        return transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
    }

    public Transaction createTransaction(String userId, TransactionRequest request) {
        Transaction tx = new Transaction(
                userId,
                request.getType().toLowerCase(),
                request.getCategory().trim(),
                request.getAmount().abs(),
                request.getDate(),
                request.getNotes() != null ? request.getNotes().trim() : "",
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "credit_card"
        );

        return transactionRepository.save(tx);
    }

    public Transaction updateTransaction(String id, String userId, TransactionRequest request) {
        Transaction existing = getTransactionById(id, userId);

        existing.setType(request.getType().toLowerCase());
        existing.setCategory(request.getCategory().trim());
        existing.setAmount(request.getAmount().abs());
        existing.setDate(request.getDate());
        if (request.getNotes() != null) {
            existing.setNotes(request.getNotes().trim());
        }
        if (request.getPaymentMethod() != null) {
            existing.setPaymentMethod(request.getPaymentMethod());
        }

        return transactionRepository.save(existing);
    }

    public void deleteTransaction(String id, String userId) {
        Transaction existing = getTransactionById(id, userId);
        transactionRepository.delete(existing);
    }
}
