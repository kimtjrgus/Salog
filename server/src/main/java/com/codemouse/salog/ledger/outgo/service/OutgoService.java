package com.codemouse.salog.ledger.outgo.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.ledger.outgo.mapper.OutgoMapper;
import com.codemouse.salog.ledger.outgo.repository.OutgoRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@AllArgsConstructor
@Transactional
public class OutgoService {
    private final OutgoRepository repository;
    private final OutgoMapper mapper;
    private final JwtTokenizer jwtTokenizer;
    private final TokenBlackListService tokenBlackListService;
    private final MemberService memberService;


    // POST
    public void postOutgo (String token, OutgoDto.Post outgoDto){
        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        Outgo outgo = mapper.OutgoPostDtoToOutgo(outgoDto);
        outgo.setMember(member);

        repository.save(outgo);
    }

    // PATCH
    public void patchOutgo (String token, long outgoId,OutgoDto.Patch outgoDto){

    }

    // GET All List
    public String findAllOutgos (String token, int page, int size, String outgoTag, String date){
        return "작성중입니다";
    }

    // DELETE
    public void deleteOutgo (String token, Long outgoId){

    }
}
