package com.codemouse.salog.ledger.outgo.entity;

import com.codemouse.salog.diary.entity.Diary;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTagLink;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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
    @JoinColumn(name = "DIARY_ID", nullable = true) // 기본적으로 지정안하면 nullable 이라고 함
    private Diary diary;

    @OneToMany(mappedBy = "outgo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LedgerTagLink> ledgerTagLinks = new ArrayList<>();
}
