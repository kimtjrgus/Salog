package com.codemouse.salog.ledger.outgo.repository;

import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface OutgoRepository extends JpaRepository<Outgo, Long> {
    // 태그별 조회시 태그에 대한 outgoId 리스트 쿼리
    Page<Outgo> findAllByOutgoIdInAndDateBetween(
            List<Long> outgoIds, LocalDate startDate, LocalDate endDate, Pageable pageable);

    // 월, 일별 조회에 대한 쿼리
    Page<Outgo> findAllByMemberMemberIdAndDateBetween(
            Long memberId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    long countByLedgerTag(LedgerTag ledgerTag);
}
