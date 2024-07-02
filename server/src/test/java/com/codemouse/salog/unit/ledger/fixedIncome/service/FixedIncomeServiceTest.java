package com.codemouse.salog.unit.ledger.fixedIncome.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.fixedIncome.dto.FixedIncomeDto;
import com.codemouse.salog.ledger.fixedIncome.entity.FixedIncome;
import com.codemouse.salog.ledger.fixedIncome.mapper.FixedIncomeMapper;
import com.codemouse.salog.ledger.fixedIncome.repository.FixedIncomeRepository;
import com.codemouse.salog.ledger.fixedIncome.service.FixedIncomeService;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("고정 수입 서비스 유닛 테스트")
public class FixedIncomeServiceTest {
    @InjectMocks
    private FixedIncomeService fixedIncomeService;
    @Mock
    private FixedIncomeRepository fixedIncomeRepository;
    @Mock
    private FixedIncomeMapper fixedIncomeMapper;
    @Mock
    private MemberService memberService;
    @Mock
    private JwtTokenizer jwtTokenizer;

    private Member member;
    private FixedIncome fixedIncome;

    // setup
    // given
    @BeforeEach
    void setup() {
        member = new Member();
        fixedIncome = new FixedIncome();
        fixedIncome.setMember(member);
    }

    @Test
    @DisplayName("createFixedIncome")
    @Order(1)
    void createFixedIncomeTest() {
        // given
        String token = "testToken";
        String fixedIncomeName = "testName";
        LocalDate date = LocalDate.of(2024,1,1);

        FixedIncomeDto.Post postDto = new FixedIncomeDto.Post(
                1000, fixedIncomeName, date
        );

        FixedIncomeDto.Response response = new FixedIncomeDto.Response(
                1L, 1000, fixedIncomeName, date
        );

        when(fixedIncomeMapper.fixedIncomePostDtoToFixedIncome(postDto)).thenReturn(fixedIncome);
        when(memberService.findVerifiedMember(1L)).thenReturn(member);
        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(fixedIncomeRepository.save(fixedIncome)).thenReturn(fixedIncome);
        when(fixedIncomeMapper.fixedIncomeToFixedIncomeResponseDto(fixedIncome)).thenReturn(response);

        // when
        FixedIncomeDto.Response result = fixedIncomeService.createFixedIncome(token, postDto);

        // then
        assertNotNull(result);
        assertEquals(fixedIncome.getMember(), member);
        assertEquals(response, result);

        verify(fixedIncomeMapper, times(1)).fixedIncomePostDtoToFixedIncome(postDto);
        verify(jwtTokenizer, times(1)).getMemberId("testToken");
        verify(memberService, times(1)).findVerifiedMember(1L);
        verify(fixedIncomeRepository, times(1)).save(fixedIncome);
        verify(fixedIncomeMapper, times(1)).fixedIncomeToFixedIncomeResponseDto(fixedIncome);
    }

    @Test
    @DisplayName("updateFixedIncome")
    @Order(2)
    void updateFixedIncomeTest() {
        // given
        String token = "testToken";
        String fixedIncomeName = "testName";
        LocalDate date = LocalDate.of(2024,1,1);

        FixedIncomeDto.Patch patchDto = new FixedIncomeDto.Patch(
                10001, fixedIncomeName, date
        );

        FixedIncomeDto.Response responseDto = new FixedIncomeDto.Response(
                1L, 10001, fixedIncomeName, date
        );

        fixedIncome.setMoney(1000);
        fixedIncome.setIncomeName(fixedIncomeName);
        fixedIncome.setDate(date);

        when(fixedIncomeMapper.fixedIncomePatchDtoToFixedIncome(patchDto)).thenReturn(fixedIncome);
        when(fixedIncomeRepository.findById(1L)).thenReturn(Optional.of(fixedIncome));
        doNothing().when(memberService).verifiedRequest(eq(token), anyLong());
        when(fixedIncomeRepository.save(fixedIncome)).thenReturn(fixedIncome);
        when(fixedIncomeMapper.fixedIncomeToFixedIncomeResponseDto(fixedIncome)).thenReturn(responseDto);

        // when
        FixedIncomeDto.Response result = fixedIncomeService.updateFixedIncome(token, 1L, patchDto);

        // then
        assertNotNull(result);
        assertEquals(fixedIncome.getMember(), member);
        assertEquals(responseDto, result);
        assertDoesNotThrow(() -> memberService.verifiedRequest(token, 1L));

        verify(fixedIncomeMapper, times(1)).fixedIncomePatchDtoToFixedIncome(patchDto);
        verify(fixedIncomeRepository, times(1)).save(fixedIncome);
        verify(fixedIncomeMapper, times(1)).fixedIncomeToFixedIncomeResponseDto(fixedIncome);
    }

    @Test
    @DisplayName("getFixedIncomes 1 : 특정 달로 조회")
    @Order(3)
    void getFixedIncomesTest1() {
        // given
        String token = "testToken";
        String date = "2024-01-00";
        int page = 1, size = 5;

        List<FixedIncome> fixedIncomes = Arrays.asList(fixedIncome);
        Page<FixedIncome> pages = new PageImpl<>(fixedIncomes);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(fixedIncomeRepository.findByMonth(eq(1L), eq(2024), eq(1),  any(PageRequest.class)))
                .thenReturn(pages);

        // when
        MultiResponseDto<FixedIncomeDto.Response> result = fixedIncomeService.getFixedIncomes(token, page, size, date);

        // then
        assertNotNull(result);
        assertFalse(result.getData().isEmpty());

        verify(fixedIncomeRepository, times(1)).findByMonth(eq(1L), eq(2024), eq(1),  any(PageRequest.class));
    }

    @Test
    @DisplayName("getFixedIncomes 2 : 특정 일로 조회")
    @Order(4)
    void getFixedIncomesTest2() {
        // given
        String token = "testToken";
        String date = "2024-01-01";
        int page = 1, size = 5;

        List<FixedIncome> fixedIncomes = Arrays.asList(fixedIncome);
        Page<FixedIncome> pages = new PageImpl<>(fixedIncomes);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(fixedIncomeRepository.findByDate(eq(1L), eq(2024), eq(1), eq(1),  any(PageRequest.class)))
                .thenReturn(pages);

        // when
        MultiResponseDto<FixedIncomeDto.Response> result = fixedIncomeService.getFixedIncomes(token, page, size, date);

        // then
        assertNotNull(result);
        assertFalse(result.getData().isEmpty());

        verify(fixedIncomeRepository, times(1)).findByDate(eq(1L), eq(2024), eq(1), eq(1),  any(PageRequest.class));
    }

    @Test
    @DisplayName("deleteFixedIncome")
    @Order(5)
    void deleteFixedIncome() {
        // given
        String token = "testToken";

        when(fixedIncomeRepository.findById(1L)).thenReturn(Optional.of(fixedIncome));
        doNothing().when(memberService).verifiedRequest(eq(token), anyLong());

        // when
        fixedIncomeService.deleteFixedIncome(token, 1L);

        // then
        verify(memberService, times(1)).verifiedRequest(anyString(), anyLong());
        verify(fixedIncomeRepository, times(1)).delete(any(FixedIncome.class));
    }

    @Test
    @DisplayName("findVerifiedFixedIncome 1 : 고정 수입이 있는 경우")
    @Order(6)
    void findVerifiedFixedIncome1() {
        // given
        fixedIncome.setFixedIncomeId(1L);

        when(fixedIncomeRepository.findById(1L)).thenReturn(Optional.of(fixedIncome));

        // when
        FixedIncome findFixedIncome = fixedIncomeService.findVerifiedFixedIncome(1L);

        // then
        assertEquals(fixedIncome, findFixedIncome);

        verify(fixedIncomeRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("findVerifiedFixedIncome 2 : 고정 수입이 없는 경우")
    @Order(7)
    void findVerifiedFixedIncome2() {
        // given
        when(fixedIncomeRepository.findById(anyLong())).thenReturn(Optional.empty());

        // when & then
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                fixedIncomeService.findVerifiedFixedIncome(anyLong()));

        assertEquals(ExceptionCode.FIXED_INCOME_NOT_FOUND, exception.getExceptionCode());
    }
}
