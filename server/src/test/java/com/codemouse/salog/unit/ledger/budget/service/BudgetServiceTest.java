package com.codemouse.salog.unit.ledger.budget.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.budget.dto.BudgetDto;
import com.codemouse.salog.ledger.budget.entity.MonthlyBudget;
import com.codemouse.salog.ledger.budget.mapper.BudgetMapper;
import com.codemouse.salog.ledger.budget.repository.BudgetRepository;
import com.codemouse.salog.ledger.budget.service.BudgetService;
import com.codemouse.salog.ledger.outgo.repository.OutgoRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("예산 서비스 유닛 테스트")
public class BudgetServiceTest {
    @InjectMocks
    private BudgetService budgetService;
    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private BudgetMapper budgetMapper;
    @Mock
    private MemberService memberService;
    @Mock
    private JwtTokenizer jwtTokenizer;
    @Mock
    private OutgoRepository outgoRepository;

    Member member;
    MonthlyBudget budget;

    @BeforeEach
    void setup() {
        member = new Member();
        member.setMemberId(1L);

        budget = new MonthlyBudget();
        budget.setDate(LocalDate.of(2024,1,1));
        budget.setMember(member);
    }

    @Test
    @DisplayName("createBudget 1: 등록된 예산이 없는 경우")
    @Order(1)
    void createBudgetTest1() {
        // given
        String token = "testToken";

        BudgetDto.Post postDto = new BudgetDto.Post(
                LocalDate.of(2024,1,1), 1000
        );

        when(budgetMapper.budgetPostDtoToBudget(postDto)).thenReturn(budget);
        when(memberService.findVerifiedMember(1L)).thenReturn(member);
        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(budgetRepository.findByMonth(eq(1L), eq(2024), eq(1))).thenReturn(null);
        when(budgetRepository.save(budget)).thenReturn(budget);

        // when
        assertDoesNotThrow(() -> budgetService.createBudget(token, postDto));

        // then
        assertEquals(budget.getMember(), member);

        verify(budgetMapper, times(1)).budgetPostDtoToBudget(postDto);
        verify(jwtTokenizer, times(1)).getMemberId("testToken");
        verify(memberService, times(1)).findVerifiedMember(1L);
        verify(budgetRepository, times(1)).findByMonth(eq(1L), eq(2024), eq(1));
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("createBudget 2: 등록된 예산이 있는 경우")
    @Order(2)
    void createBudgetTest2() {
        // given
        String token = "testToken";

        BudgetDto.Post postDto = new BudgetDto.Post(
                LocalDate.of(2024,1,1), 1000
        );

        when(budgetMapper.budgetPostDtoToBudget(postDto)).thenReturn(budget);
        when(memberService.findVerifiedMember(1L)).thenReturn(member);
        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(budgetRepository.findByMonth(eq(1L), eq(2024), eq(1))).thenReturn(budget);

        // when
        BusinessLogicException exception =
                assertThrows(BusinessLogicException.class, () -> budgetService.createBudget(token, postDto));

        // then
        assertEquals(ExceptionCode.BUDGET_EXIST, exception.getExceptionCode());
    }

    @Test
    @DisplayName("updateBudget")
    @Order(3)
    void updateBudgetTest() {
        // given
        String token = "testToken";

        budget.setDate(LocalDate.of(2024,2,1));
        budget.setBudget(1000);

        BudgetDto.Patch patchDto = new BudgetDto.Patch(
                LocalDate.of(2024,1,1), 1000
        );

        when(budgetMapper.budgetPatchDtoToBudget(patchDto)).thenReturn(budget);
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));
        doNothing().when(memberService).verifiedRequest(eq(token), anyLong());

        // when
        budgetService.updateBudget(token, 1L, patchDto);

        // then
        assertEquals(budget.getMember(), member);
        assertDoesNotThrow(() -> memberService.verifiedRequest(eq(token), anyLong()));

        verify(budgetMapper, times(1)).budgetPatchDtoToBudget(patchDto);
        verify(budgetRepository, times(1)).findById(anyLong());
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("findBudget 1 : 예산이 있고, 지출 내역이 있는 경우")
    @Order(4)
    void findBudgetTest1() {
        String token = "testToken";
        LocalDate date = LocalDate.of(2024,1,1);

        BudgetDto.Response responseDto = new BudgetDto.Response(
                1L, date, 1000, 1000, 1
        );

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(budgetRepository.findByMonth(1L, 2024, 1)).thenReturn(budget);
        when(budgetMapper.budgetToBudgetResponseDto(budget)).thenReturn(responseDto);
        when(outgoRepository.findTotalOutgoByMonth(1L, 2024,1)).thenReturn(1000L);

        // when
        BudgetDto.Response result = budgetService.findBudget(token, "2024-01-01");

        // then
        assertNotNull(result);
        assertTrue(result.getTotalOutgo() > 0);

        verify(budgetRepository, times(1)).findByMonth(1L, 2024, 1);
        verify(budgetMapper, times(1)).budgetToBudgetResponseDto(budget);
    }

    @Test
    @DisplayName("findBudget 2 : 예산이 있고, 지출 내역이 없는 경우")
    @Order(5)
    void findBudgetTest2() {
        // given
        String token = "testToken";
        LocalDate date = LocalDate.of(2024,1,1);

        BudgetDto.Response responseDto = new BudgetDto.Response(
                1L, date, 1000, 0, 1
        );

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(budgetRepository.findByMonth(1L, 2024, 1)).thenReturn(budget);
        when(budgetMapper.budgetToBudgetResponseDto(budget)).thenReturn(responseDto);
        when(outgoRepository.findTotalOutgoByMonth(1L, 2024,1)).thenReturn(0L);

        // when
        BudgetDto.Response result = budgetService.findBudget(token, "2024-01-01");

        // then
        assertNotNull(result);
        assertFalse(result.getTotalOutgo() > 0);

        verify(budgetRepository, times(1)).findByMonth(1L, 2024, 1);
        verify(budgetMapper, times(1)).budgetToBudgetResponseDto(budget);
    }

    @Test
    @DisplayName("findBudget 3 : 예산이 없는 경우")
    @Order(6)
    void findBudgetTest3() {
        // given
        String token = "testToken";
        String date = "2024-01-01";

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(budgetRepository.findByMonth(1L, 2024, 1)).thenReturn(null);

        // when
        BudgetDto.Response result = budgetService.findBudget(token, date);

        // then
        assertNull(result);

        verify(jwtTokenizer, times(1)).getMemberId(token);
        verify(budgetRepository, times(1)).findByMonth(1L, 2024, 1);
        verify(budgetMapper, times(1)).budgetToBudgetResponseDto(any());
    }

    // private 메서드인 findVerifiedBudget 포함
    @Test
    @DisplayName("deleteBudget + findVerifiedBudget 1 : 예산이 있는 경우")
    @Order(7)
    void deleteBudgetTest1() {
        // given
        String token = "testToken";
        long budgetId = 1L;

        when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(budget));
        doNothing().when(memberService).verifiedRequest(token, 1L);

        // when
        assertDoesNotThrow(() -> budgetService.deleteBudget(token, budgetId));

        // then
        assertEquals(budget.getMember(), member);

        verify(budgetRepository, times(1)).findById(budgetId);
        verify(memberService, times(1)).verifiedRequest(token, 1L);
        verify(budgetRepository, times(1)).delete(budget);
    }

    @Test
    @DisplayName("deleteBudget + findVerifiedBudget 2 : 예산이 없는 경우")
    @Order(8)
    void deleteBudgetTest2() {
        // given
        String token = "testToken";
        long budgetId = 1L;

        when(budgetRepository.findById(budgetId)).thenReturn(Optional.empty());

        // when
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                budgetService.deleteBudget(token, budgetId));

        // then
        assertEquals(ExceptionCode.BUDGET_NOT_FOUND, exception.getExceptionCode());

        verify(budgetRepository, times(1)).findById(budgetId);
        verify(memberService, times(0)).verifiedRequest(token, 1L);
        verify(budgetRepository, times(0)).delete(budget);
    }
}
