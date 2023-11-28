package com.codemouse.salog.members.entity;

import com.codemouse.salog.audit.Auditable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@NoArgsConstructor
@Getter
@Setter
@Entity
public class Member extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int memberId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean emailAlarm;

    @Column(nullable = false)
    private boolean homeAlarm;

    @Column(nullable = false)
    private Status status = Status.MEMBER_ACTIVE;

    public enum Status {
        MEMBER_ACTIVE("활동중"),
        MEMBER_QUIT("탈퇴 상태");

        @Getter
        private String status;

        Status(String status){
            this.status = status;
        }
    }
}
