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

    @Column(nullable = false)
    private String tagName;

    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private Group category;

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @OneToMany(mappedBy = "ledgerTag", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LedgerTagLink> ledgerTagLinks = new ArrayList<>();

    @Getter
    public enum Group {
        INCOME("수입 태그"),
        OUTGO("지출 태그");

        private final String group;

        Group(String group) {
            this.group = group;
        }
    }
}
