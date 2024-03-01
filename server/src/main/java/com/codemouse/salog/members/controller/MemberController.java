package com.codemouse.salog.members.controller;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.dto.SingleResponseDto;
import com.codemouse.salog.helper.EmailSenderResponse;
import com.codemouse.salog.members.dto.EmailRequestDto;
import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.service.MemberService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.mail.MessagingException;
import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/members")
@Validated
@AllArgsConstructor
@Slf4j
public class MemberController {
    private final MemberService memberService;
    private final TokenBlackListService tokenBlackListService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public void SignupMember(@Valid @RequestBody MemberDto.Post requestBody) {
        memberService.createMember(requestBody);
    }

    @PatchMapping("/update")
    @ResponseStatus(HttpStatus.OK)
    public void updateMember(@RequestHeader(name = "Authorization") String token,
                             @Valid @RequestBody MemberDto.Patch requestBody) {
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크
        memberService.updateMember(token, requestBody);
    }

    @PatchMapping("/changePassword")
    @ResponseStatus(HttpStatus.OK)
    public void changePassword(@RequestHeader(name = "Authorization") String token,
                               @Valid @RequestBody MemberDto.PatchPassword requestBody) {
        tokenBlackListService.isBlackListed(token);
        memberService.updatePassword(token, requestBody);
    }

    // 비번찾기
    @PostMapping("/findPassword")
    @ResponseStatus(HttpStatus.OK)
    public void findPassword(@RequestBody EmailRequestDto emailRequestDto) {
        memberService.findPassword(emailRequestDto.getEmail(), emailRequestDto.getNewPassword());
    }

    @GetMapping("/get")
    public ResponseEntity getMember(@RequestHeader(name = "Authorization") String token) {
        tokenBlackListService.isBlackListed(token);
        MemberDto.Response response = memberService.findMember(token);
        return new ResponseEntity<>(
                new SingleResponseDto<>(response), HttpStatus.OK);
    }

    @DeleteMapping("/leaveid")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMember(@RequestHeader(name = "Authorization") String token) {
        tokenBlackListService.isBlackListed(token);
        memberService.deleteMember(token);
    }

    // 이메일 중복 체크
    @PostMapping("/emailcheck")
    @ResponseStatus(HttpStatus.OK)
    public void emailCheckMember(@Valid @RequestBody EmailRequestDto requestBody) {
        memberService.isExistEmail(requestBody.getEmail());
    }

    // 이메일 인증(회원가입시)
    // todo - 2023-12-14 추후 서비스로 로직이동 시킬 것
    @PostMapping("/signup/sendmail")
    public ResponseEntity sendVerificationEmail(@RequestBody EmailRequestDto emailRequestDto) throws MessagingException {
        String email = emailRequestDto.getEmail();

        if (memberService.verifiedEmail(email)) {
            EmailSenderResponse response = new EmailSenderResponse();
            response.setActive(true);
            response.setMessage("이미 존재하는 이메일입니다.");

            return ResponseEntity.status(HttpStatus.OK).body(response);
        } else {
            // 이메일 인증 코드 생성 및 이메일 발송
            String verificationCode = memberService.sendEmail(email);

            EmailSenderResponse response = new EmailSenderResponse();
            response.setActive(false);
            response.setMessage(verificationCode);

            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }

    // 이메일 인증(비밀번호 찾기시)
    // todo - 2023-12-14 추후 서비스로 로직이동 시킬 것
    @PostMapping("/findPassword/sendmail")
    public ResponseEntity findPasswordSendVerificationEmail(@RequestBody EmailRequestDto emailRequestDto) throws MessagingException {
        String email = emailRequestDto.getEmail();

        if (memberService.verifiedEmail(email)) { // 이메일이 존재한다면
            // 이메일 인증 코드 생성 및 이메일 발송
            String verificationCode = memberService.sendEmail(email);

            EmailSenderResponse response = new EmailSenderResponse();
            response.setActive(true);
            response.setMessage(verificationCode);

            return ResponseEntity.status(HttpStatus.OK).body(response);
        } else {
            EmailSenderResponse response = new EmailSenderResponse();
            response.setActive(false);
            response.setMessage("이메일이 존재하지 않습니다.");

            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }

    // todo 2023-12-20 로그아웃 시 토큰 블랙리스트에 리프레쉬도 추가해야함 (리프레쉬 탈취 방지)
    // 로그아웃
    @PostMapping("/logout")
    public String logout(@RequestHeader (name="Authorization") String token) {
        tokenBlackListService.addToBlackList(token);
        return "redirect:/";
    }
}