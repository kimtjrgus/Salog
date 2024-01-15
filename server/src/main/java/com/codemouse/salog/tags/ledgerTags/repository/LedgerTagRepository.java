package com.codemouse.salog.tags.ledgerTags.repository;

import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerTagRepository extends JpaRepository<LedgerTag, Long> {
    List<LedgerTag> findAllByMemberMemberId(Long memberId);
    List<LedgerTag> findAllByMemberMemberIdAndCategory(Long memberId, LedgerTag.Group category);

    // memberId와 tagName에 맞는 태그 찾기
    LedgerTag findByMemberMemberIdAndTagNameAndCategory(long memberId, String tagName, LedgerTag.Group category);
    List<LedgerTag> findAllByMemberMemberIdAndTagName(long memberId, String tagName);
}
