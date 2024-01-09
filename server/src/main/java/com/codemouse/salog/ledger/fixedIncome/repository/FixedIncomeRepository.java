package com.codemouse.salog.ledger.fixedIncome.repository;

import com.codemouse.salog.ledger.fixedIncome.entity.FixedIncome;
import com.codemouse.salog.ledger.income.entity.Income;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FixedIncomeRepository extends JpaRepository<FixedIncome, Long> {

    @Query("SELECT f FROM FixedIncome f WHERE f.member.memberId = :memberId AND YEAR(f.date) = :year AND MONTH(f.date) = :month")
    Page<FixedIncome> findByMonth(@Param("memberId") long memberId, @Param("year") int year, @Param("month") int month, Pageable pageable);

    @Query("SELECT f FROM FixedIncome f WHERE f.member.memberId = :memberId AND YEAR(f.date) = :year AND MONTH(f.date) = :month AND DAY(f.date) = :day")
    Page<FixedIncome> findByDate(@Param("memberId") long memberId, @Param("year") int year, @Param("month") int month, @Param("day") int day, Pageable pageable);
}
