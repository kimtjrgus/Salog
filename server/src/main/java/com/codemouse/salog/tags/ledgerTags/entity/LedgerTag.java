package com.codemouse.salog.tags.ledgerTags.entity;

import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.members.entity.Member;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class LedgerTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long ledgerTagId;

    @Column(nullable = false)
    private String tagName;

    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private Group category;

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @Getter
    public enum Group {
        INCOME("수입 태그"),
        OUTGO("지출 태그");

        private final String group;

        Group(String group) {
            this.group = group;
        }
    }

    @OneToMany(mappedBy = "ledgerTag")
    private List<Income> incomes;

    @OneToMany(mappedBy = "ledgerTag")
    private List<Outgo> outgos;
}
