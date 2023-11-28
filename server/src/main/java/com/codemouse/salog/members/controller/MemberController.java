package com.codemouse.salog.members.controller;

import com.codemouse.salog.members.dto.MemberDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/members")
@Validated
@Slf4j
public class MemberController {
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public void SignupMember(@Valid @RequestBody MemberDto.Post requestBody) {

    }

    @PatchMapping("/update")
    @ResponseStatus(HttpStatus.OK)
    public void SignupMember(@Valid @RequestBody MemberDto.Patch requestBody) {

    }

    @GetMapping("/get")
    public ResponseEntity SignupMember(@Valid @RequestBody MemberDto.Response requestBody) {
        return null;
    }

    @DeleteMapping("/leaveid")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void SignupMember() {

    }
}