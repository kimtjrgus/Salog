package com.codemouse.salog.slice.ledger.budget.repository;
import com.codemouse.salog.ledger.budget.entity.MonthlyBudget;
import com.codemouse.salog.ledger.budget.repository.BudgetRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 실제 데이터베이스 사용 시
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("예산 리포지터리 슬라이스 테스트")
public class BudgetRepositoryTest {
    @Autowired
    private BudgetRepository budgetRepository;
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

        MonthlyBudget monthlyBudget = new MonthlyBudget();
        monthlyBudget.setBudgetId(1L);
        monthlyBudget.setDate(LocalDate.of(2024,1,1));
        monthlyBudget.setBudget(10000);
        monthlyBudget.setMember(member);
        budgetRepository.save(monthlyBudget);
    }

    @Test
    @DisplayName("findByMonth")
    @Order(1)
    void findByMonthTest() {
        // when
        MonthlyBudget result = budgetRepository.findByMonth(member.getMemberId(), 2024, 1);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getMember()).isEqualTo(member);
    }
}
