package com.codemouse.salog.ledger.outgo.entity;

import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class Outgo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long outgoId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long money;

    @Column
    private String outgoName;

    @Column
    private String payment; // 결제 수단 추가

    @Column(nullable = false)
    private boolean wasteList;

    @Column
    private String memo;

    @Column
    private String receiptImg;

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @ManyToOne
    @JoinColumn(name = "LEDGER_TAG_ID", nullable = false)
    private LedgerTag ledgerTag;
}
