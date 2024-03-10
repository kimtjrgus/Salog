package com.codemouse.salog.members.service;

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
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.mail.AuthenticationFailedException;
import javax.mail.MessagingException;
import javax.mail.SendFailedException;
import java.util.*;

@Transactional
@Service
@AllArgsConstructor
public class MemberService {
    private final JwtTokenizer jwtTokenizer;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomAuthorityUtils authorityUtils;
    private final MemberMapper memberMapper;
    private final EmailSender emailSender;

    public void createMember(MemberDto.Post postDto) {
        Member member = memberMapper.memberPostDtoToMember(postDto);

        isExistEmail(member.getEmail());

        // JWT
        String encryptedPassword = passwordEncoder.encode(member.getPassword());
        member.setPassword(encryptedPassword);

        List<String> roles = authorityUtils.createRoles(member.getEmail());
        member.setRoles(roles);

        memberRepository.save(member);
    }

    public void updateMember(String token, MemberDto.Patch patchDto) {
        Member member = memberMapper.memberPatchDtoToMember(patchDto);
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        Optional.of(member.isEmailAlarm())
                .ifPresent(findMember::setEmailAlarm);
        Optional.of(member.isHomeAlarm())
                .ifPresent(findMember::setHomeAlarm);

        memberRepository.save(findMember);
    }

    // 비번 변경
    public void updatePassword(String token, MemberDto.PatchPassword passwords) {
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        socialCheck(findMember);

        String curPassword = passwords.getCurPassword();
        String newPassword = passwords.getNewPassword();

        if (passwordEncoder.matches(curPassword, findMember.getPassword())) {
            if (!passwordEncoder.matches(newPassword, findMember.getPassword())) {
                findMember.setPassword(passwordEncoder.encode(newPassword));
                memberRepository.save(findMember);
            } else {
                throw new BusinessLogicException(ExceptionCode.PASSWORD_IDENTICAL);
            }
        } else {
            throw new BusinessLogicException(ExceptionCode.PASSWORD_MISMATCHED);
        }
    }

    // 비번 찾기
    public void findPassword(String email, String newPassword) {
        Optional<Member> findMember = memberRepository.findByEmail(email);

        if (findMember.isPresent()) {
            Member member = findMember.get();

            socialCheck(member);

            String encryptedPassword = passwordEncoder.encode(newPassword);
            member.setPassword(encryptedPassword);

            memberRepository.save(member);
        } else {
            throw new BusinessLogicException(ExceptionCode.MEMBER_NOT_FOUND);
        }
    }

    public MemberDto.Response findMember(String token) {
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        return memberMapper.memberToMemberResponseDto(findMember);
    }

    public void deleteMember(String token) {
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        memberRepository.delete(findMember);
    }

    // 존재하는 회원인지 체크
    public Member findVerifiedMember(long memberId){
        Optional<Member> optionalMember =
                memberRepository.findById(memberId);
        return optionalMember.orElseThrow(() ->
                new BusinessLogicException(ExceptionCode.MEMBER_NOT_FOUND));
    }

    // 존재하는 이메일인지 체크
    public void isExistEmail(String email) {
        if (memberRepository.existsByEmail(email))
            throw new BusinessLogicException(ExceptionCode.EMAIL_EXIST);
    }

    // 존재하는 이메일인지 체크 (boolean)
    public boolean verifiedEmail(String email) {
        return memberRepository.existsByEmail(email);
    }

    // 탈퇴여부 체크
//    private static void isQuit(Member findMember) {
//        if(findMember.getStatus().equals(Member.Status.MEMBER_QUIT))
//            throw new BusinessLogicException(ExceptionCode.MEMBER_ALREADY_DELETED);
//    }

    // 이메일 발송, 에러 핸들링
    public String sendEmail(String email) throws MessagingException {
        // 인증번호 생성기
        String verificationCode = RandomGenerator.generateRandomCode(4);

        try {
            emailSender.sendVerificationEmail(email, verificationCode); // 메일 발송
        } catch (AuthenticationFailedException e) {
            // 메일 발신 계정의 정보가 잘못된 경우 처리
            throw new MessagingException("인증에 실패했습니다. 이메일과 비밀번호를 확인해주세요", e);
        } catch (SendFailedException e) {
            // 수신자의 이메일 주소가 유효하지 않거나 도달할 수 없는 경우 처리
            throw new MessagingException("이메일이 정상적으로 전송되지 않았습니다.", e);
        } catch (MessagingException e) {
            // SMTP 서버와의 통신 문제나 메일 전송 중에 예기치 않은 오류가 발생할 경우 처리
            throw new MessagingException("이메일 전송 중 오류가 발생했습니다.", e);
        }

        return verificationCode;
    }

    // 회원이 해당 서비스의 소유자인지 파악
    public void verifiedRequest(String token, long serviceMemberId) {
        if (jwtTokenizer.getMemberId(token) != serviceMemberId) {
            throw new BusinessLogicException(ExceptionCode.MEMBER_MISMATCHED);
        }
    }

    // 소셜 가입한 회원인지 체크
    public void socialCheck(Member member) {
        if (member.getPassword() == null) {
            throw new BusinessLogicException(ExceptionCode.SOCIAL_MEMBER);
        }
    }
}
