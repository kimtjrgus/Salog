package com.codemouse.salog.ledger.outgo.repository;

import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface OutgoRepository extends JpaRepository<Outgo, Long> {
    // 태그별 조회시 태그에 대한 outgoId 리스트 쿼리
    Page<Outgo> findAllByOutgoIdInAndDateBetween(
            List<Long> outgoIds, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Outgo> findAllByOutgoIdInAndWasteListAndDateBetween(
            List<Long> outgoIds, boolean wasteList, LocalDate startDate, LocalDate endDate, Pageable pageable);

    // 월, 일별 조회에 대한 쿼리
    Page<Outgo> findAllByMemberMemberIdAndDateBetween(
            Long memberId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Outgo> findAllByMemberMemberIdAndWasteListAndDateBetween(
            Long memberId, boolean wasteList, LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query(value = "SELECT lt.tag_name, SUM(o.money) " +
            "FROM outgo o " +
            "JOIN ledger_tag lt ON o.ledger_tag_id = lt.ledger_tag_id " +
            "WHERE o.member_id = :memberId AND YEAR(o.date) = :year AND MONTH(o.date) = :month AND lt.category = 'OUTGO' " +
            "GROUP BY lt.ledger_tag_id, lt.tag_name", nativeQuery = true)
    List<Object[]> getSumOfOutgoListsByTag(Long memberId, int year, int month);

    @Query(value = "SELECT lt.tag_name, SUM(o.money) " +
            "FROM outgo o " +
            "JOIN ledger_tag lt ON o.ledger_tag_id = lt.ledger_tag_id " +
            "WHERE o.member_id = :memberId AND YEAR(o.date) = :year AND MONTH(o.date) = :month AND lt.category = 'OUTGO' AND waste_list = TRUE " +
            "GROUP BY lt.ledger_tag_id, lt.tag_name", nativeQuery = true)
    List<Object[]> getSumOfWasteListsByTag(Long memberId, int year, int month);

    long countByLedgerTag(LedgerTag ledgerTag);
}
