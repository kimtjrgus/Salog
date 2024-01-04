package com.codemouse.salog.tags.ledgerTags.entity;

import com.codemouse.salog.ledger.income.entity.Income;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class LedgerTagLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long ledgerTagLinkId;

    @ManyToOne
    @JoinColumn(name = "INCOME_ID")
    private Income income;

    @ManyToOne
    @JoinColumn(name = "LEDGERTAG_ID")
    private LedgerTag ledgerTag;
}
