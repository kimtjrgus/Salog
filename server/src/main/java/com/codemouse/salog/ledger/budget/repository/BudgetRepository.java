package com.codemouse.salog.ledger.budget.repository;

import com.codemouse.salog.ledger.budget.entity.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BudgetRepository extends JpaRepository<MonthlyBudget, Long> {
    @Query("SELECT b FROM MonthlyBudget b WHERE b.member.memberId = :memberId AND YEAR(b.date) = :year AND MONTH(b.date) = :month")
    MonthlyBudget findByMonth(@Param("memberId") long memberId, @Param("year") int year, @Param("month") int month);
}
