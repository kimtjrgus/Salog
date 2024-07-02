package com.codemouse.salog.slice.ledger.fixedIncome.repository;

import com.codemouse.salog.ledger.fixedIncome.entity.FixedIncome;
import com.codemouse.salog.ledger.fixedIncome.repository.FixedIncomeRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 실제 데이터베이스 사용 시
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("고정 수입 리포지터리 슬라이스 테스트")
public class FixedIncomeRepositoryTest {
    @Autowired
    private FixedIncomeRepository fixedIncomeRepository;
    @Autowired
    private MemberRepository memberRepository;

    private Member member;

    // given
    @BeforeEach
    void setup() {
        member = new Member();
        member.setEmail("test@email.com");
        member.setEmailAlarm(true);
        member.setHomeAlarm(true);
        memberRepository.save(member);

        FixedIncome fixedIncome = new FixedIncome();
        fixedIncome.setFixedIncomeId(1L);
        fixedIncome.setMoney(1000);
        fixedIncome.setIncomeName("testName");
        fixedIncome.setDate(LocalDate.of(2024,1,1));
        fixedIncome.setMember(member);
        fixedIncomeRepository.save(fixedIncome);
    }

    @Test
    @DisplayName("findByMonth")
    @Order(1)
    void findByMonthTest() {
        // when
        Page<FixedIncome> result = fixedIncomeRepository.findByMonth(member.getMemberId(), 2024, 1, PageRequest.of(0, 5));

        // then
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent().get(0).getMember()).isEqualTo(member);
    }

    @Test
    @DisplayName("findByDate")
    @Order(2)
    void findByDateTest() {
        // when
        Page<FixedIncome> result = fixedIncomeRepository.findByDate(member.getMemberId(), 2024, 1, 1, PageRequest.of(0, 5));

        // then
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent().get(0).getMember()).isEqualTo(member);
    }
}
