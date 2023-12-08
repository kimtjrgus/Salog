package com.codemouse.salog.members.controller;

import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/members")
@Validated
@AllArgsConstructor
@Slf4j
public class MemberController {
    private final MemberService memberService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public void SignupMember(@Valid @RequestBody MemberDto.Post requestBody) {

    }

    @PatchMapping("/update")
    @ResponseStatus(HttpStatus.OK)
    public void updateMember(@Valid @RequestBody MemberDto.Patch requestBody) {

    }

    @GetMapping("/get")
    public ResponseEntity getMember(@RequestHeader(name = "Authorization") String token) {
        Member member = memberService.findMember(token);

        return null;
    }

    @DeleteMapping("/leaveid")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMember(@RequestHeader(name = "Authorization") String token) {
        memberService.deleteMember(token);
    }
}