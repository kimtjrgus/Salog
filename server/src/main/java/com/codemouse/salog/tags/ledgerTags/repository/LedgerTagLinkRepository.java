package com.codemouse.salog.tags.ledgerTags.repository;

import com.codemouse.salog.tags.diaryTags.entity.DiaryTagLink;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LedgerTagLinkRepository extends JpaRepository<DiaryTagLink, Long> {
}
