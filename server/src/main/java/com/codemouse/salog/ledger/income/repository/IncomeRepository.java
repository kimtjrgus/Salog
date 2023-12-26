package com.codemouse.salog.ledger.income.repository;

import com.codemouse.salog.ledger.income.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Long> {
}
