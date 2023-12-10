package com.codemouse.salog.members.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional
@Service
@AllArgsConstructor
public class MemberService {
    private final JwtTokenizer jwtTokenizer;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public void createMember(Member member) {
        isExistEmail(member.getEmail());

        memberRepository.save(member);
    }

    public void updateMember(String token, Member updateMember) {
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        Optional.of(updateMember.isEmailAlarm())
                .ifPresent(findMember::setEmailAlarm);
        Optional.of(updateMember.isHomeAlarm())
                .ifPresent(findMember::setHomeAlarm);

        memberRepository.save(findMember);
    }

    public void updatePassword(String token, MemberDto.PatchPassword passwords) {
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        isQuit(findMember);

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

    public Member findMember(String token) {
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        isQuit(findMember);

        return findMember;
    }

    public void deleteMember(String token) {
        Member findMember = findVerifiedMember(jwtTokenizer.getMemberId(token));

        isQuit(findMember);

        memberRepository.deleteById(findMember.getMemberId());
    }

    // 존재하는 회원인지 체크
    public Member findVerifiedMember(long memberId){
        Optional<Member> optionalMember =
                memberRepository.findById(memberId);
        return optionalMember.orElseThrow(() ->
                new BusinessLogicException(ExceptionCode.MEMBER_NOT_FOUND));
    }

    // 존재하는 이메일인지 체크
    protected void isExistEmail(String email) {
        if (memberRepository.findByEmail(email))
            throw new BusinessLogicException(ExceptionCode.EMAIL_EXIST);
    }

    // 탈퇴여부 체크
    private static void isQuit(Member findMember) {
        if(findMember.getStatus().equals(Member.Status.MEMBER_QUIT))
            throw new BusinessLogicException(ExceptionCode.MEMBER_ALREADY_DELETED);
    }
}
