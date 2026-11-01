package com.vaultflow.repository;

import com.vaultflow.model.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, String> {

    List<Budget> findByUserId(String userId);

    Optional<Budget> findByIdAndUserId(String id, String userId);

    Optional<Budget> findByUserIdAndCategory(String userId, String category);

    boolean existsByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}
