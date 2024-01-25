package com.codemouse.salog.ledger.income.entity;

import com.codemouse.salog.diary.entity.Diary;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;

@NoArgsConstructor
@Getter
@Setter
@Entity
public class Income {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long incomeId;

    @Column(nullable = false)
    private int money;

    @Column
    private String incomeName;

    @Column
    private String memo;

    @Column
    private LocalDate date; // 타입 안정성과 쿼리 호환을 위해 LocalDate 타입으로

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @ManyToOne
    @JoinColumn(name = "LEDGER_TAG_ID")
    private LedgerTag ledgerTag;
}
