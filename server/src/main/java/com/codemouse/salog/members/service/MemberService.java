package com.codemouse.salog.members.service;

import com.codemouse.salog.members.entity.Member;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
@AllArgsConstructor
public class MemberService {
    public Member createMember(Member member) {
        return null;
    }

    public Member updateMember(Member member) {
        return null;
    }

    public void deleteMember(long memberId) {

    }

    public Member findMember(long memberId) {
        return null;
    }
}
