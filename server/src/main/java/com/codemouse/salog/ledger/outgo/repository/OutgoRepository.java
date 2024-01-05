package com.codemouse.salog.ledger.outgo.repository;

import com.codemouse.salog.ledger.outgo.entity.Outgo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface OutgoRepository extends JpaRepository<Outgo, Long> {
    // 월, 일별 조회에 대한 쿼리
    Page<Outgo> findAllByMemberMemberIdAndDateBetween(
            Long memberId, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
