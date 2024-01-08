package com.codemouse.salog.ledger.income.repository;

import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    @Query("SELECT i FROM Income i WHERE i.member.memberId = :memberId AND YEAR(i.date) = :year AND MONTH(i.date) = :month AND i.ledgerTag.tagName = :tag")
    Page<Income> findByMonthAndTag(@Param("memberId") long memberId, @Param("year") int year, @Param("month") int month, @Param("tag") String tag, Pageable pageable);

    @Query("SELECT i FROM Income i WHERE i.member.memberId = :memberId AND YEAR(i.date) = :year AND MONTH(i.date) = :month AND DAY(i.date) = :day AND i.ledgerTag.tagName = :tag")
    Page<Income> findByDateAndTag(@Param("memberId") long memberId, @Param("year") int year, @Param("month") int month, @Param("day") int day, @Param("tag") String tag, Pageable pageable);

    @Query("SELECT i FROM Income i WHERE i.member.memberId = :memberId AND YEAR(i.date) = :year AND MONTH(i.date) = :month")
    Page<Income> findByMonth(@Param("memberId") long memberId, @Param("year") int year, @Param("month") int month, Pageable pageable);

    @Query("SELECT i FROM Income i WHERE i.member.memberId = :memberId AND YEAR(i.date) = :year AND MONTH(i.date) = :month AND DAY(i.date) = :day")
    Page<Income> findByDate(@Param("memberId") long memberId, @Param("year") int year, @Param("month") int month, @Param("day") int day, Pageable pageable);

    long countByLedgerTag(LedgerTag ledgerTag);
}