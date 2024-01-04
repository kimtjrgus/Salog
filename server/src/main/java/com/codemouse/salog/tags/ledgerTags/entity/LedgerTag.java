package com.codemouse.salog.tags.ledgerTags.entity;

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

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @OneToMany(mappedBy = "ledgerTag", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LedgerTagLink> ledgerTagLinks = new ArrayList<>();
}
