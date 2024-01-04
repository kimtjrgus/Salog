package com.codemouse.salog.tags.ledgerTags.repository;

import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LedgerTagRepository extends JpaRepository<LedgerTag, Long> {
}
