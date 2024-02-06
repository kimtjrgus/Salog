package com.codemouse.salog.ledger.fixedOutgo.entity;

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
public class FixedOutgo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long fixedOutgoId;

    @Column
    private LocalDate date;

    @Column(nullable = false)
    private int money;

    @Column
    private String outgoName;

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;
}
