package com.codemouse.salog.members.entity;

import com.codemouse.salog.audit.Auditable;
import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.*;

@NoArgsConstructor
@Getter
@Setter
@Entity
public class Member extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long memberId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true) // oauth
    private String password;

    @Column(nullable = false)
    private boolean emailAlarm;

    @Column(nullable = false)
    private boolean homeAlarm;

//    @Enumerated(value = EnumType.STRING)
//    @Column(nullable = false)
//    private Status status = Status.MEMBER_ACTIVE;

    // JWT - 역할 부여
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> roles = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    private List<LedgerTag> ledgerTags;


//    public enum Status {
//        MEMBER_ACTIVE("활동중"),
//        MEMBER_QUIT("탈퇴 상태");
//
//        @Getter
//        private final String status;
//
//        Status(String status){
//            this.status = status;
//        }
//    }
}
