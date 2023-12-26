package com.codemouse.salog.ledger.income.entity;

import com.codemouse.salog.audit.Auditable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@NoArgsConstructor
@Getter
@Setter
@Entity
public class Income extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long incomeId;

    @Column(nullable = false)
    private int money;

    @Column
    private String incomeName;

    @Column
    private String memo;
}
