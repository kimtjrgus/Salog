package com.codemouse.salog.members.repository;

import com.codemouse.salog.members.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
