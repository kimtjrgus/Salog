package com.codemouse.salog.members.repository;

import com.codemouse.salog.members.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean findByEmail(String email);
}
