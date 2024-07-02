package com.codemouse.salog.slice.members.repository;

import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataJpaTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 실제 데이터베이스 사용 시
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("회원 리포지터리 슬라이스 테스트")
public class MemberRepositoryTest {
    @Autowired
    private MemberRepository memberRepository;

    @Test
    @DisplayName("findByEmail")
    @Order(1)
    public void findByEmailTest() {
        // given
        Member member = new Member();
        member.setEmail("test@email.com");
        memberRepository.save(member);

        // when
        Optional<Member> findMember = memberRepository.findByEmail("test@email.com");

        // then
        assertThat(findMember).isPresent();
        assertThat(findMember.get().getEmail()).isEqualTo("test@email.com");
    }

    @Test
    @DisplayName("existsByEmail")
    @Order(2)
    public void existsByEmailTest() {
        // given
        Member member = new Member();
        member.setEmail("test@email.com");
        memberRepository.save(member);

        // when
        Boolean exists = memberRepository.existsByEmail("test@email.com");

        // then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("findById")
    @Order(3)
    public void findByIdTest() {
        // given
        Member member = new Member();
        member.setEmail("test@email.com");
        Member savedMember = memberRepository.save(member);

        // when
        Optional<Member> findMember = memberRepository.findById(savedMember.getMemberId());

        // then
        assertThat(findMember).isPresent();
        assertThat(findMember.get().getMemberId()).isEqualTo(savedMember.getMemberId());
    }
}
