package com.codemouse.salog.ledger.fixedOutgo.repository;

import com.codemouse.salog.ledger.fixedOutgo.entity.FixedOutgo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface FixedOutgoRepository extends JpaRepository<FixedOutgo, Long> {
     Page<FixedOutgo> findAllByMemberMemberIdAndDateBetween(
             long memberId, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
