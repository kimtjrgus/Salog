package com.codemouse.salog.unit.members.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.CustomAuthorityUtils;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.helper.EmailSender;
import com.codemouse.salog.helper.RandomGenerator;
import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.mapper.MemberMapper;
import com.codemouse.salog.members.repository.MemberRepository;
import com.codemouse.salog.members.service.MemberService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.mail.MessagingException;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class) // 순서보장 (cf. https://junit.org/junit5/docs/current/user-guide/#writing-tests-test-execution-order)
@DisplayName("회원 서비스 유닛 테스트")
public class MemberServiceTest {
    @InjectMocks
    private MemberService memberService;
    @Mock
    private JwtTokenizer jwtTokenizer;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CustomAuthorityUtils authorityUtils;
    @Mock
    private MemberMapper memberMapper;
    @Mock
    private EmailSender emailSender;
    @Mock
    private RandomGenerator randomGenerator;

    // log
    private static final Logger logger = LoggerFactory.getLogger(MemberServiceTest.class);

    // setup test user
    @BeforeEach
    void setUp() {
        member = new Member();
    }

    @Test
    @DisplayName("createMember")
    @Order(1)
    void createMemberTest() {
        // Given
        MemberDto.Post postDto = new MemberDto.Post();
        postDto.setEmail("test@email.com");
        postDto.setPassword("password");

        member.setEmail("test@email.com");
        member.setPassword("password");

        when(memberMapper.memberPostDtoToMember(postDto)).thenReturn(member);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(authorityUtils.createRoles("test@email.com")).thenReturn(List.of("ROLE_USER"));
        when(memberRepository.save(any(Member.class))).thenReturn(member);

        // When
        memberService.createMember(postDto);

        // Then
        verify(memberRepository, times(1)).save(member);
        assertEquals("encodedPassword", member.getPassword());
        assertEquals(List.of("ROLE_USER"), member.getRoles());

        // logs
        logger.info("Member Email: {}", member.getEmail());
        logger.info("Member Password: {}", member.getPassword());
        logger.info("Member Roles: {}", member.getRoles());
    }

    @Test
    @DisplayName("updateMember")
    @Order(2)
    void updateMemberTest() {
        // Given
        String token = "testToken";
        MemberDto.Patch patchDto = new MemberDto.Patch();
        patchDto.setEmailAlarm(true);
        patchDto.setHomeAlarm(false);

        member.setEmailAlarm(true);
        member.setHomeAlarm(false);

        Member findMember = new Member();
        findMember.setEmailAlarm(false);
        findMember.setHomeAlarm(true);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(memberMapper.memberPatchDtoToMember(patchDto)).thenReturn(member);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(findMember));

        // When
        memberService.updateMember(token, patchDto);

        // Then
        verify(memberRepository, times(1)).save(findMember);
        assertTrue(findMember.isEmailAlarm());
        assertFalse(findMember.isHomeAlarm());

        // logs
        logger.info("Member Email Alarm: {}", findMember.isEmailAlarm());
        logger.info("Member Home Alarm: {}", findMember.isHomeAlarm());
    }

    private static final String TOKEN = "testToken";
    private static final Long MEMBER_ID = 1L;
    private static final String CUR_PASSWORD = "currentPassword";
    private static final String NEW_PASSWORD = "newPassword";
    private Member member;

    @Test
    @DisplayName("updatePassword 1 : 변경 성공")
    @Order(3)
    void updatePasswordTest1() {
        // Given
        MemberDto.PatchPassword patchPasswordDto = new MemberDto.PatchPassword();
        patchPasswordDto.setCurPassword(CUR_PASSWORD);
        patchPasswordDto.setNewPassword(NEW_PASSWORD);

        when(passwordEncoder.encode(NEW_PASSWORD)).thenReturn("encodedNewPassword");

        member.setPassword(passwordEncoder.encode(NEW_PASSWORD));

        when(jwtTokenizer.getMemberId(TOKEN)).thenReturn(MEMBER_ID);
        when(memberRepository.findById(MEMBER_ID)).thenReturn(Optional.of(member));
        when(passwordEncoder.matches(CUR_PASSWORD, member.getPassword())).thenReturn(true);
        when(passwordEncoder.matches(NEW_PASSWORD, member.getPassword())).thenReturn(false);

        // When
        memberService.updatePassword(TOKEN, patchPasswordDto);

        // Then
        assertEquals("encodedNewPassword", member.getPassword());
        verify(memberRepository, times(1)).save(member);

        // logs
        logger.info("Member Current Password: {}", member.getPassword());
    }

    @Test
    @DisplayName("updatePassword 2 : 현재 비밀번호 불일치")
    @Order(4)
    void updatePasswordTest2() {
        // Given
        MemberDto.PatchPassword patchPasswordDto = new MemberDto.PatchPassword();
        patchPasswordDto.setCurPassword("wrongPassword");
        patchPasswordDto.setNewPassword(NEW_PASSWORD);

        when(passwordEncoder.encode(CUR_PASSWORD)).thenReturn("encodedCurPassword");

        member.setPassword(passwordEncoder.encode(CUR_PASSWORD));

        when(jwtTokenizer.getMemberId(TOKEN)).thenReturn(MEMBER_ID);
        when(memberRepository.findById(MEMBER_ID)).thenReturn(Optional.of(member));
        when(passwordEncoder.matches("wrongPassword", member.getPassword())).thenReturn(false);

        // When & Then
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            memberService.updatePassword(TOKEN, patchPasswordDto);
        });

        assertEquals(ExceptionCode.PASSWORD_MISMATCHED, exception.getExceptionCode());
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    @DisplayName("updatePassword 3 : 새 비밀번호가 현재 비밀번호와 동일")
    @Order(5)
    void updatePasswordTest3() {
        // Given
        MemberDto.PatchPassword patchPasswordDto = new MemberDto.PatchPassword();
        patchPasswordDto.setCurPassword(CUR_PASSWORD);
        patchPasswordDto.setNewPassword(CUR_PASSWORD);

        when(passwordEncoder.encode(CUR_PASSWORD)).thenReturn("encodedCurPassword");

        member.setPassword(passwordEncoder.encode(CUR_PASSWORD));

        when(jwtTokenizer.getMemberId(TOKEN)).thenReturn(MEMBER_ID);
        when(memberRepository.findById(MEMBER_ID)).thenReturn(Optional.of(member));
        when(passwordEncoder.matches(CUR_PASSWORD, member.getPassword())).thenReturn(true);

        // When & Then
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            memberService.updatePassword(TOKEN, patchPasswordDto);
        });

        assertEquals(ExceptionCode.PASSWORD_IDENTICAL, exception.getExceptionCode());
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    @DisplayName("findPassword 1 : 가입한 회원")
    @Order(6)
    void findPasswordTest1() {
        // Given
        member.setEmail("test@email.com");
        member.setPassword("password");

        when(memberRepository.findByEmail("test@email.com")).thenReturn(Optional.of(member));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        // When
        memberService.findPassword(member.getEmail(), "newPassword");

        // Then
        verify(memberRepository).save(member);
        verify(passwordEncoder).encode("newPassword");
        assertEquals("encodedNewPassword", member.getPassword());

        // logs
        logger.info("Member Changed Password: {}", member.getPassword());
    }

    @Test
    @DisplayName("findPassword 2 : 가입하지 않은 회원")
    @Order(7)
    void findPasswordTest2() {
        // Given
        String email = "test@email.com";
        String newPassword = "newPassword";

        when(memberRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When & Then
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
                memberService.findPassword(email, newPassword);
        });

        assertEquals(ExceptionCode.MEMBER_NOT_FOUND, exception.getExceptionCode());
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    @DisplayName("findMember")
    @Order(8)
    void findMemberTest() {
        // Given
        String token = "testToken";
        member.setMemberId(1L);
        member.setEmail("test@email.com");
        member.setPassword("testPassword");
        member.setEmailAlarm(true);
        member.setEmailAlarm(true);

        MemberDto.Response responseDto = new MemberDto.Response();
        responseDto.setMemberId(member.getMemberId());
        responseDto.setEmail(member.getEmail());
        responseDto.setEmailAlarm(member.isEmailAlarm());
        responseDto.setHomeAlarm(member.isHomeAlarm());

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(memberMapper.memberToMemberResponseDto(member)).thenReturn(responseDto);

        // When
        MemberDto.Response response = memberService.findMember(token);

        // Then
        assertEquals(responseDto.getMemberId(), response.getMemberId());
        assertEquals(responseDto.getEmail(), response.getEmail());
        assertEquals(responseDto.isEmailAlarm(), response.isEmailAlarm());
        assertEquals(responseDto.isHomeAlarm(), response.isHomeAlarm());
        verify(jwtTokenizer).getMemberId(token);
        verify(memberRepository).findById(1L);
        verify(memberMapper).memberToMemberResponseDto(member);

        // logs
        logger.info("Response Member Id: {}", response.getMemberId());
        logger.info("Response Member Email: {}", response.getEmail());
        logger.info("Response Member Email Alarm: {}", response.isEmailAlarm());
        logger.info("Response Member Home Alarm: {}", response.isHomeAlarm());
    }

    @Test
    @DisplayName("deleteMember")
    @Order(9)
    void deleteMemberTest() {
        // Given
        String token = "testToken";
        member.setMemberId(1L);
        member.setEmail("test@email.com");
        member.setPassword("testPassword");
        member.setEmailAlarm(true);
        member.setEmailAlarm(true);

        when(jwtTokenizer.getMemberId(token)).thenReturn(1L);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // When
        memberService.deleteMember(token);

        // Then
        verify(jwtTokenizer).getMemberId(token);
        verify(memberRepository).findById(1L);
        verify(memberRepository).delete(member);
    }

    @Test
    @DisplayName("findVerifiedMember 1 : 존재하는 회원")
    @Order(10)
    void findVerifiedMemberTest1() {
        // Given
        long memberId = 1L;

        member.setMemberId(1L);

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        // When
        Member findMember = memberService.findVerifiedMember(memberId);

        // Then
        assertNotNull(findMember);
        assertEquals(memberId, findMember.getMemberId());

        // logs
        logger.info("Find Member Id: {}", memberId);
        logger.info("Exist Member Id: {}", findMember.getMemberId());
    }

    @Test
    @DisplayName("findVerifiedMember 2 : 존재하지 않는 회원")
    @Order(11)
    void findVerifiedMemberTest2() {
        // Given
        long memberId = 1L;

        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(BusinessLogicException.class, () -> {
            memberService.findVerifiedMember(memberId);
        });
    }

    @Test
    @DisplayName("isExistEmail 1 : 이메일 중복 X")
    @Order(12)
    void isExistEmailTest1() {
        // Given
        String email = "test@email.com";

        when(memberRepository.existsByEmail(email)).thenReturn(false);

        // When & Then
        assertDoesNotThrow(() -> {
            memberService.isExistEmail(email);
        });
    }

    @Test
    @DisplayName("isExistEmail 1 : 이메일 중복 O")
    @Order(13)
    void isExistEmailTest2() {
        // Given
        String email = "test@email.com";

        when(memberRepository.existsByEmail(email)).thenReturn(true);

        // When & Then
        assertThrows(BusinessLogicException.class, () ->{
            memberService.isExistEmail(email);
        });
    }

    @Test
    @DisplayName("verifiedEmail 1 : 이메일 존재 true")
    @Order(14)
    void verifiedEmailTest1() {
        // Given
        String email = "test@email.com";

        when(memberRepository.existsByEmail(email)).thenReturn(true);

        // When
        boolean result = memberService.verifiedEmail(email);

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("verifiedEmail 2 : 이메일 존재 false")
    @Order(15)
    void verifiedEmailTest2() {
        // Given
        String email = "test@email.com";

        when(memberRepository.existsByEmail(email)).thenReturn(false);

        // When
        boolean result = memberService.verifiedEmail(email);

        // Then
        assertFalse(result);
    }

//    @Test
//    @DisplayName("sendEmail 1 : 정상 실행")
//    @Order(16)
//    void sendEmail1() throws MessagingException {
//        // Given
//        String email = "test@email.com";
//        String verificationCode = "1234";
//
//        when(randomGenerator.generateRandomCode(4)).thenReturn(verificationCode);
//
//        // When
//        emailSender.sendVerificationEmail(email, verificationCode);
//
//        // Then
//        verify(randomGenerator).generateRandomCode(4);
//        verify(emailSender).sendVerificationEmail(email, verificationCode);
//    }

    @Test
    @DisplayName("sendEmail 2 : AuthenticationFailedException")
    @Order(16)
    void sendEmail2() {
        // Given
        // When
        // Then
    }

    @Test
    @DisplayName("sendEmail 3 : SendFailedException")
    @Order(16)
    void sendEmail3() {
        // Given
        // When
        // Then
    }

    @Test
    @DisplayName("sendEmail 4 : MessagingException")
    @Order(16)
    void sendEmail4() {
        // Given
        // When
        // Then
    }
}
