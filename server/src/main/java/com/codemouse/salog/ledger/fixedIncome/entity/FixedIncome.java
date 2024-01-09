package com.codemouse.salog.ledger.fixedIncome.entity;

import com.codemouse.salog.members.entity.Member;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;

@NoArgsConstructor
@Getter
@Setter
@Entity
public class FixedIncome {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long fixedIncomeId;

    @Column(nullable = false)
    private int money;

    @Column
    private String incomeName;

    @Column
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;
}
