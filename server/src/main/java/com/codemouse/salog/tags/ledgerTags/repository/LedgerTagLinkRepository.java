package com.codemouse.salog.tags.ledgerTags.repository;

import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.diaryTags.entity.DiaryTagLink;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTagLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerTagLinkRepository extends JpaRepository<LedgerTagLink, Long> {
    List<LedgerTagLink> findByLedgerTagTagNameAndLedgerTagMember(String tagName, Member member);
    Long countByLedgerTag(LedgerTag ledgerTag);
}
