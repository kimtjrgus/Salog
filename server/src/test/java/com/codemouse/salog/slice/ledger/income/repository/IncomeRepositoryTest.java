package com.codemouse.salog.slice.ledger.income.repository;

import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.ledger.income.repository.IncomeRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.repository.LedgerTagRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 실제 데이터베이스 사용 시
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("수입 리포지터리 슬라이스 테스트")
public class IncomeRepositoryTest {
    @Autowired
    private IncomeRepository incomeRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private LedgerTagRepository ledgerTagRepository;

    private Member member;
    private LedgerTag ledgerTag;
    private Income income;

    // given
    @BeforeEach
    void setUp() {
        member = new Member();
        member.setEmail("test@email.com");
        member.setEmailAlarm(true);
        member.setHomeAlarm(true);
        memberRepository.save(member);

        ledgerTag = new LedgerTag();
        ledgerTag.setTagName("testTag");
        ledgerTag.setCategory(LedgerTag.Group.INCOME);
        ledgerTag.setMember(member);
        ledgerTagRepository.save(ledgerTag);

        income = new Income();
        income.setMoney(10000);
        income.setMember(member);
        income.setDate(LocalDate.of(2024, 1, 1));
        income.setLedgerTag(ledgerTag);
        incomeRepository.save(income);
    }

    @Test
    @DisplayName("findByMonthAndTag")
    @Order(1)
    void findByMonthAndTagTest() {
        // when
        Page<Income> result = incomeRepository.findByMonthAndTag(member.getMemberId(), 2024, 1, "testTag", PageRequest.of(0, 5));

        // then
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent().get(0).getMember()).isEqualTo(member);
        assertThat(result.getContent().get(0).getLedgerTag().getTagName()).isEqualTo("testTag");
    }

    @Test
    @DisplayName("findByDateAndTag")
    @Order(2)
    void findByDateAndTagTest() {
        // when
        Page<Income> result = incomeRepository.findByDateAndTag(member.getMemberId(), 2024, 1, 1, "testTag", PageRequest.of(0, 5));

        // then
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent().get(0).getMember()).isEqualTo(member);
        assertThat(result.getContent().get(0).getLedgerTag().getTagName()).isEqualTo("testTag");
    }

    @Test
    @DisplayName("findByMonth")
    @Order(3)
    void findByMonthTest() {
        // when
        Page<Income> result = incomeRepository.findByMonth(member.getMemberId(), 2024, 1, PageRequest.of(0, 5));

        // then
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent().get(0).getMember()).isEqualTo(member);
        assertThat(result.getContent().get(0).getLedgerTag().getTagName()).isEqualTo("testTag");
    }

    @Test
    @DisplayName("findByDate")
    @Order(4)
    void findByDateTest() {
        // when
        Page<Income> result = incomeRepository.findByDate(member.getMemberId(), 2024, 1, 1, PageRequest.of(0, 5));

        // then
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent().get(0).getMember()).isEqualTo(member);
        assertThat(result.getContent().get(0).getLedgerTag().getTagName()).isEqualTo("testTag");
    }

    @Test
    @DisplayName("findTotalIncomeByMonth")
    @Order(5)
    void findTotalIncomeByMonthTest() {
        // when
        Long result = incomeRepository.findTotalIncomeByMonth(member.getMemberId(), 2024, 1);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(0);
    }

    @Test
    @DisplayName("findTotalIncomeByMonthGroupByTag")
    @Order(6)
    void findTotalIncomeByMonthGroupByTagTest() {
        // when
        List<Object[]> result = incomeRepository.findTotalIncomeByMonthGroupByTag(member.getMemberId(), 2024, 1);

        // then
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("findTotalIncomeByDay")
    @Order(7)
    void findTotalIncomeByDayTest() {
        // given
        LocalDate date = LocalDate.of(2024,1,1);

        // when
        Long result = incomeRepository.findTotalIncomeByDay(member.getMemberId(), date);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(0);
    }

    @Test
    @DisplayName("countByLedgerTag")
    @Order(8)
    void countByLedgerTagTest() {
        // when
        Long result = incomeRepository.countByLedgerTag(ledgerTag);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(0);
    }
}
