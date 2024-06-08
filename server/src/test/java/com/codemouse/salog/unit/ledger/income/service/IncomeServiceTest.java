package com.codemouse.salog.unit.ledger.income.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.ledger.income.mapper.IncomeMapper;
import com.codemouse.salog.ledger.income.repository.IncomeRepository;
import com.codemouse.salog.ledger.income.service.IncomeService;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.service.LedgerTagService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("수입 서비스 유닛 테스트")
public class IncomeServiceTest {
    @InjectMocks
    private IncomeService incomeService;
    @Mock
    private IncomeRepository incomeRepository;
    @Mock
    private IncomeMapper incomeMapper;
    @Mock
    private MemberService memberService;
    @Mock
    private JwtTokenizer jwtTokenizer;
    @Mock
    private LedgerTagService tagService;
    @Mock
    private Validator validator;

    private Member member;
    private Income income;
    private LedgerTag ledgerTag;

    //setup
    @BeforeEach
    void setUp() {
        member = new Member();
        income = new Income();
        income.setMember(member);
        ledgerTag = new LedgerTag();
    }

    @Test
    @DisplayName("createIncome + tagHandler 1 : 태그가 null이 아니고, 새로 생성하는 경우")
    @Order(1)
    void createIncomeTest1() {
        // given
        String testToken = "testToken";
        String tagName = "testTag";

        IncomeDto.Post postDto = new IncomeDto.Post();
        postDto.setIncomeTag(tagName);
        IncomeDto.Response responseDto = new IncomeDto.Response();

        ledgerTag.setTagName(tagName);

        when(incomeMapper.incomePostDtoToIncome(postDto)).thenReturn(income);
        when(memberService.findVerifiedMember(1L)).thenReturn(member);
        when(jwtTokenizer.getMemberId(testToken)).thenReturn(1L);
        when(tagService.findLedgerTagByMemberIdAndTagName(testToken, tagName, LedgerTag.Group.INCOME)).thenReturn(null);
        when(tagService.postLedgerTag(eq(testToken), any(LedgerTagDto.Post.class))).thenReturn(ledgerTag);
        when(incomeRepository.save(income)).thenReturn(income);
        when(incomeMapper.incomeToIncomeResponseDto(income)).thenReturn(responseDto);

        // when
        IncomeDto.Response result = incomeService.createIncome("testToken", postDto);

        // then
        assertNotNull(result);
        assertEquals(income.getMember(), member);
        assertEquals(ledgerTag, income.getLedgerTag());
        assertEquals(responseDto, result);

        verify(incomeMapper, times(1)).incomePostDtoToIncome(postDto);
        verify(jwtTokenizer, times(1)).getMemberId("testToken");
        verify(memberService, times(1)).findVerifiedMember(1L);
        verify(tagService, times(1)).postLedgerTag(eq(testToken), any(LedgerTagDto.Post.class));
        verify(incomeRepository, times(1)).save(income);
        verify(incomeMapper, times(1)).incomeToIncomeResponseDto(income);
    }

    @Test
    @DisplayName("createIncome + tagHandler 2 : 태그가 null이 아니고, 이미 존재하는 경우")
    @Order(2)
    void createIncomeTest2() {
        // given
        String testToken = "testToken";
        String tagName = "testTag";

        IncomeDto.Post postDto = new IncomeDto.Post();
        postDto.setIncomeTag(tagName);
        IncomeDto.Response responseDto = new IncomeDto.Response();

        ledgerTag.setTagName(tagName);

        when(incomeMapper.incomePostDtoToIncome(postDto)).thenReturn(income);
        when(memberService.findVerifiedMember(1L)).thenReturn(member);
        when(jwtTokenizer.getMemberId(testToken)).thenReturn(1L);
        when(tagService.findLedgerTagByMemberIdAndTagName(testToken, tagName, LedgerTag.Group.INCOME)).thenReturn(ledgerTag);
        income.setLedgerTag(ledgerTag);
        when(incomeRepository.save(income)).thenReturn(income);
        when(incomeMapper.incomeToIncomeResponseDto(income)).thenReturn(responseDto);

        // when
        IncomeDto.Response result = incomeService.createIncome("testToken", postDto);

        // then
        assertNotNull(result);
        assertEquals(income.getMember(), member);
        assertEquals(ledgerTag, income.getLedgerTag());
        assertEquals(responseDto, result);

        verify(incomeMapper, times(1)).incomePostDtoToIncome(postDto);
        verify(jwtTokenizer, times(1)).getMemberId("testToken");
        verify(memberService, times(1)).findVerifiedMember(1L);
        verify(tagService, never()).postLedgerTag(eq(testToken), any(LedgerTagDto.Post.class));
        verify(incomeRepository, times(1)).save(income);
        verify(incomeMapper, times(1)).incomeToIncomeResponseDto(income);
    }

    @Test
    @DisplayName("createIncome + tagHandler 3 : 태그 유효성 검사 실패")
    @Order(3)
    void createIncomeTest3() {
        // given
        String testToken = "testToken";
        String tagName = "!!!";

        IncomeDto.Post postDto = new IncomeDto.Post();
        postDto.setIncomeTag(tagName);

        when(incomeMapper.incomePostDtoToIncome(postDto)).thenReturn(income);
        when(jwtTokenizer.getMemberId(testToken)).thenReturn(1L);
        when(memberService.findVerifiedMember(1L)).thenReturn(member);

        Set<ConstraintViolation<LedgerTagDto.Post>> violations = new HashSet<>();
        ConstraintViolation<LedgerTagDto.Post> violation = mock(ConstraintViolation.class);
        violations.add(violation);
        when(validator.validate(any(LedgerTagDto.Post.class))).thenReturn(violations);

        // when
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            incomeService.createIncome(testToken, postDto);
        });

        // then
        assertEquals(ExceptionCode.TAG_UNVALIDATED, exception.getExceptionCode());

        verify(tagService, never()).postLedgerTag(eq(testToken), any(LedgerTagDto.Post.class));
    }

    @Test
    @DisplayName("createIncome + tagHandler 4 : 태그가 null 인 경우")
    @Order(4)
    void createIncomeTest4() {
        // given
        String testToken = "testToken";

        IncomeDto.Post postDto = new IncomeDto.Post();
        postDto.setIncomeTag(null);
        IncomeDto.Response responseDto = new IncomeDto.Response();

        when(incomeMapper.incomePostDtoToIncome(postDto)).thenReturn(income);
        when(jwtTokenizer.getMemberId(testToken)).thenReturn(1L);
        when(memberService.findVerifiedMember(1L)).thenReturn(member);
        when(incomeRepository.save(any(Income.class))).thenReturn(income);
        when(incomeMapper.incomeToIncomeResponseDto(income)).thenReturn(responseDto);

        // when
        IncomeDto.Response response = incomeService.createIncome(testToken, postDto);

        // then
        assertNull(income.getLedgerTag());
        assertNotNull(response);

        verify(tagService, times(1)).deleteUnusedIncomeTagsByMemberId(testToken);
    }

    @Test
    @DisplayName("updateIncome")
    @Order(5)
    void updateIncomeTest() {
        // given
        IncomeDto.Patch patchDto = new IncomeDto.Patch();
        IncomeDto.Response responseDto = new IncomeDto.Response();

        // Update 테스트 시 Optional.of 로 nullable 이 아닌 데이터는 입력해야함
        income.setMoney(100);
        income.setIncomeName("testName");

        when(incomeMapper.incomePatchDtoToIncome(patchDto)).thenReturn(income);
        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income)); // findVerifiedIncome 메서드 핸들링
        doNothing().when(memberService).verifiedRequest(any(), anyLong());
        when(incomeRepository.save(income)).thenReturn(income);
        when(incomeMapper.incomeToIncomeResponseDto(income)).thenReturn(responseDto);

        // when
        IncomeDto.Response result = incomeService.updateIncome("testToken", 1L, patchDto);

        // then
        assertNotNull(result);
        assertEquals(income.getMember(), member);
        assertEquals(responseDto, result);
        assertDoesNotThrow(() -> memberService.verifiedRequest("testToken", 1L));

        verify(incomeMapper, times(1)).incomePatchDtoToIncome(patchDto);
        verify(incomeRepository, times(1)).save(income);
        verify(incomeMapper, times(1)).incomeToIncomeResponseDto(income);
    }

    @Test
    @DisplayName("getIncomes 1 : 태그가 있고, 특정 날짜로 수입 조회")
    @Order(6)
    void getIncomesTest1() {
        // given
        String token = "testToken";
        int page = 1;
        int size = 10;
        String incomeTag = "testTag";
        String date = "2024-01-01";

        List<Income> incomeList = Arrays.asList(income);
        Page<Income> pages = new PageImpl<>(incomeList);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(incomeRepository.findByDateAndTag(eq(1L), eq(2024), eq(1), eq(1), eq(incomeTag), any(PageRequest.class)))
                .thenReturn(pages);

        // when
        MultiResponseDto<IncomeDto.Response> result = incomeService.getIncomes(token, page, size, incomeTag, date);

        // then
        assertNotNull(result);
        assertFalse(result.getData().isEmpty());

        verify(incomeRepository, times(1)).findByDateAndTag(eq(1L), eq(2024), eq(1), eq(1), eq(incomeTag),
                any(PageRequest.class));
    }

    @Test
    @DisplayName("getIncomes 2 : 태그가 있고, 특정 월로 수입 조회")
    @Order(7)
    void getIncomesTest2() {
        // given
        String token = "testToken";
        int page = 1;
        int size = 10;
        String incomeTag = "testTag";
        String date = "2024-01-00";

        List<Income> incomeList = Arrays.asList(income);
        Page<Income> pages = new PageImpl<>(incomeList);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(incomeRepository.findByMonthAndTag(eq(1L), eq(2024), eq(1), eq(incomeTag), any(PageRequest.class)))
                .thenReturn(pages);

        // when
        MultiResponseDto<IncomeDto.Response> result = incomeService.getIncomes(token, page, size, incomeTag, date);

        // then
        assertNotNull(result);
        assertFalse(result.getData().isEmpty());

        verify(incomeRepository, times(1)).findByMonthAndTag(eq(1L), eq(2024), eq(1), eq(incomeTag),
                any(PageRequest.class));
    }

    @Test
    @DisplayName("getIncomes 3 : 태그가 없고, 특정 날짜로 수입 조회")
    @Order(8)
    void getIncomesTest3() {
        // given
        String token = "testToken";
        int page = 1;
        int size = 10;
        String incomeTag = null;
        String date = "2024-01-01";

        List<Income> incomeList = Arrays.asList(income);
        Page<Income> pages = new PageImpl<>(incomeList);

        when(jwtTokenizer.getMemberId("testToken")).thenReturn(1L);
        when(incomeRepository.findByDate(eq(1L), eq(2024), eq(1), eq(1), any(PageRequest.class)))
                .thenReturn(pages);

        // when
        MultiResponseDto<IncomeDto.Response> result = incomeService.getIncomes(token, page, size, incomeTag, date);

        // then
        assertNotNull(result);
        assertFalse(result.getData().isEmpty());

        verify(incomeRepository, times(1)).findByDate(eq(1L), eq(2024), eq(1), eq(1),
                any(PageRequest.class));
    }

    @Test
    @DisplayName("getIncomes 4 : 태그가 없고, 특정 월로 수입 조회")
    @Order(9)
    void getIncomesTest4() {
        // given
        String token = "testToken";
        int page = 1;
        int size = 10;
        String incomeTag = null;
        String date = "2024-01-00";

        List<Income> incomeList = Arrays.asList(income);
        Page<Income> pages = new PageImpl<>(incomeList);

        when(jwtTokenizer.getMemberId("testToken")).thenReturn(1L);
        when(incomeRepository.findByMonth(eq(1L), eq(2024), eq(1), any(PageRequest.class)))
                .thenReturn(pages);

        // when
        MultiResponseDto<IncomeDto.Response> result = incomeService.getIncomes(token, page, size, incomeTag, date);

        // then
        assertNotNull(result);
        assertFalse(result.getData().isEmpty());

        verify(incomeRepository, times(1)).findByMonth(eq(1L), eq(2024), eq(1),
                any(PageRequest.class));
    }

    @Test
    @DisplayName("getMonthlyIncome")
    @Order(10)
    void getMonthlyIncomeTest() {
        // Given
        String token = "testToken";
        String date = "2024-01";

        List<Object[]> totalIncomeByTag = new ArrayList<>();

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(incomeRepository.findTotalIncomeByMonthGroupByTag(1L,2024,1)).thenReturn(totalIncomeByTag);
        when(incomeRepository.findTotalIncomeByMonth(1L, 2024, 1)).thenReturn(10000L);

        // when
        IncomeDto.MonthlyResponse result = incomeService.getMonthlyIncome(token, date);

        // then
        assertNotNull(result);
        assertEquals(10000L, result.getMonthlyTotal());

        verify(jwtTokenizer, times(1)).getMemberId(token);
        verify(incomeRepository, times(1)).findTotalIncomeByMonthGroupByTag(1L, 2024, 1);
        verify(incomeRepository,times(1)).findTotalIncomeByMonth(1L, 2024, 1);
    }

    @Test
    @DisplayName("deleteIncome 1 : 태그가 없는 경우")
    @Order(11)
    void deleteIncomeTest1() {
        // given
        String token = "testToken";

        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));
        doNothing().when(memberService).verifiedRequest(any(), anyLong());

        // when
        incomeService.deleteIncome(token, 1L);

        // then
        verify(memberService, times(1)).verifiedRequest(anyString(), anyLong());
        verify(incomeRepository, times(1)).delete(any(Income.class));
        verify(tagService, never()).deleteLedgerTag(anyString(), anyLong());
    }

    @Test
    @DisplayName("deleteIncome 2 : 태그가 있는 경우")
    @Order(12)
    void deleteIncomeTest2() {
        // given
        String token = "testToken";

        LedgerTag tag = new LedgerTag();
        tag.setLedgerTagId(1L);
        tag.setIncomes(List.of(income));

        income.setLedgerTag(tag);

        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));
        doNothing().when(memberService).verifiedRequest(eq(token), anyLong());

        // when
        incomeService.deleteIncome(token, 1L);

        // then
        assertNull(income.getLedgerTag());

        verify(memberService, times(1)).verifiedRequest(eq(token), anyLong());
        verify(tagService, times(1)).deleteLedgerTag(token, 1L);
        verify(incomeRepository, times(1)).delete(income);
    }

    @Test
    @DisplayName("deleteIncome 2 : 태그가 여러 개 있는 경우")
    @Order(13)
    void deleteIncomeTest3() {
        // given
        String token = "testToken";

        income.setIncomeId(1L);
        Income income2 = new Income();
        income2.setIncomeId(2L);
        income2.setMember(member);

        LedgerTag tag = new LedgerTag();
        tag.setLedgerTagId(1L);
        tag.setIncomes(List.of(income, income2));

        income.setLedgerTag(tag);
        income2.setLedgerTag(tag);

        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));
        doNothing().when(memberService).verifiedRequest(eq(token), anyLong());

        // when
        incomeService.deleteIncome(token, 1L);

        // then
        assertNull(income.getLedgerTag());
        assertNotNull(income2);
        assertNotNull(income2.getLedgerTag());

        verify(memberService, times(1)).verifiedRequest(eq(token), anyLong());
        verify(tagService, times(0)).deleteLedgerTag(token, 1L);
        verify(incomeRepository, times(1)).delete(income);
    }

    @Test
    @DisplayName("findVerifiedIncome : 수입이 있는 경우")
    @Order(14)
    void findVerifiedIncomeTest1() {
        // given
        income.setIncomeId(1L);

        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));

        // when
        Income findIncome = incomeService.findVerifiedIncome(1L);

        // then
        assertEquals(income, findIncome);

        verify(incomeRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("findVerifiedIncome : 수입이 없는 경우")
    @Order(15)
    void findVerifiedIncomeTest2() {
        // given
        when(incomeRepository.findById(anyLong())).thenReturn(Optional.empty());

        // when & then
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () ->
                incomeService.findVerifiedIncome(anyLong()));

        assertEquals(ExceptionCode.INCOME_NOT_FOUND, exception.getExceptionCode());
    }

    @Test
    @DisplayName("getDailyTotalIncome 1 : 쿼리 결과, 데이터가 있는 경우")
    @Order(16)
    void getDailyTotalIncomeTest1() {
        // given
        String token = "testToken";
        LocalDate date = LocalDate.of(2024,1,1);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(incomeRepository.findTotalIncomeByDay(1L, date)).thenReturn(1000L);

        // when
        long result = incomeService.getDailyTotalIncome(token, date);

        // then
        assertEquals(result, 1000L);
        verify(jwtTokenizer, times(1)).getMemberId(token);
    }

    @Test
    @DisplayName("getDailyTotalIncome 1 : 쿼리 결과, 데이터가 없는 경우 (0 반환)")
    @Order(17)
    void getDailyTotalIncomeTest2() {
        // given
        String token = "testToken";
        LocalDate date = LocalDate.of(2024,1,1);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(incomeRepository.findTotalIncomeByDay(1L, date)).thenReturn(null);

        // when
        long result = incomeService.getDailyTotalIncome(token, date);

        // then
        assertEquals(result, 0);
        verify(jwtTokenizer, times(1)).getMemberId(token);
    }

    /*
    private 메서드는 테스트하는 것을 지양해야한다.
    private 메서드를 테스트하는 방법에는 두 가지가 있다.
    1. 아래의 케이스와 같이 리플렉션을 사용해서 접근을 우회하는 방법과
    2. 대상 메서드의 접근제어자를 package-protected로 변경하여 테스트 코드에서만 접근할 수 있게 하는 방법이다.
    그러나 첫 번째의 경우, 고정이 되어버리기 때문에 유지보수가 어렵다.
    두 번째의 경우, 캡슐화와 설계 원칙을 저해할 수 있다.
    그러므로 대상 private 메서드를 사용하는 public 메서드를 통해 로직을 테스트하는 것이 좋다.
    ref. https://mangkyu.tistory.com/235

    아래의 리플렉션을 통한 private 메서드 단위 테스트는 예시를 위해 작성 후 주석 처리한다.
    정확한 테스트는 1번, createIncome 테스트를 통해 진행한다.
     */
//    @Test
//    @DisplayName("tagHandler 1 : tag가 null이 아니고, 이미 존재하는 경우")
//    @Order(18)
//    void tagHandler1() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
//        // given
//        String incomePostDto = "existTag";
//        String token = "testToken";
//
//        LedgerTag existTag = new LedgerTag();
//        existTag.setTagName("existTag");
//        existTag.setCategory(LedgerTag.Group.INCOME);
//        existTag.setMember(member);
//
//        when(tagService.findLedgerTagByMemberIdAndTagName(token, incomePostDto, LedgerTag.Group.INCOME))
//                .thenReturn(existTag);
//        when(incomeRepository.save(income)).thenReturn(income);
//
//        // 리플렉션을 사용하여 private 메서드 호출
//        Method method = incomeService.getClass().getDeclaredMethod("tagHandler", String.class, String.class, Income.class);
//        method.setAccessible(true); // private 메서드 접근 가능하게 설정
//
//        // when
//        Income result = (Income) method.invoke(incomeService, incomePostDto, token, income);
//
//        // then
//        assertNotNull(result.getLedgerTag());
//        assertEquals("existTag", result.getLedgerTag().getTagName());
//        assertEquals(LedgerTag.Group.INCOME, result.getLedgerTag().getCategory());
//        assertEquals(member, result.getLedgerTag().getMember());
//
//        verify(tagService, times(1)).findLedgerTagByMemberIdAndTagName(token, incomePostDto, LedgerTag.Group.INCOME);
//        verify(incomeRepository, times(1)).save(income);
//    }
}
