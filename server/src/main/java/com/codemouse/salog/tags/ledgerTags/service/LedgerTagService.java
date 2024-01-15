package com.codemouse.salog.tags.ledgerTags.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.income.repository.IncomeRepository;
import com.codemouse.salog.ledger.outgo.repository.OutgoRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.mapper.LedgerTagMapper;
import com.codemouse.salog.tags.ledgerTags.repository.LedgerTagRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class LedgerTagService {
    private final LedgerTagRepository ledgerTagRepository;
    private final LedgerTagMapper mapper;
    private final JwtTokenizer jwtTokenizer;
    private final MemberService memberService;
    private final IncomeRepository incomeRepository;
    private final OutgoRepository outgoRepository;

    public LedgerTag postLedgerTag (String token, LedgerTagDto.Post tagDto){
        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        LedgerTag ledgerTag = mapper.ledgerTagPostDtoToLedgerTag(tagDto);

        ledgerTag.setMember(member);

        return ledgerTagRepository.save(ledgerTag);
    }

    public void deleteLedgerTag(String token, Long ledgerTagId) {
        memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        LedgerTag ledgerTag = findVerifiedLedgerTag(ledgerTagId);

        memberService.verifiedRequest(token,ledgerTag.getMember().getMemberId());

        ledgerTagRepository.deleteById(ledgerTagId);
    }

    public List<LedgerTagDto.Response> getAllIncomeTags(String token){
        long memberId = jwtTokenizer.getMemberId(token);
        List<LedgerTag> ledgerTags = ledgerTagRepository.findAllByMemberMemberId(memberId);

        List<LedgerTagDto.Response> tagList = new ArrayList<>();
        for (LedgerTag ledgerTag : ledgerTags) {
            LedgerTagDto.Response tagDto = mapper.ledgerTagToLedgerTagResponseDto(ledgerTag);
            tagList.add(tagDto);
        }

        return tagList;
    }

    public List<LedgerTagDto.Response> getAllOutgoTags(String token){
        long memberId = jwtTokenizer.getMemberId(token);
        List<LedgerTag> ledgerTags = ledgerTagRepository.findAllByMemberMemberId(memberId);

        List<LedgerTagDto.Response> tagList = new ArrayList<>();
        for (LedgerTag ledgerTag : ledgerTags) {
            LedgerTagDto.Response tagDto = mapper.ledgerTagToLedgerTagResponseDto(ledgerTag);
            tagList.add(tagDto);
        }

        return tagList;
    }

    // 해당 태그가 유효한지 검증
    public LedgerTag findVerifiedLedgerTag(long ledgerTagId){
        return ledgerTagRepository.findById(ledgerTagId).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.TAG_NOT_FOUND));
    }

    // 멤버와 태그이름에 해당하는 객체
    public LedgerTag findLedgerTagByMemberIdAndTagName(String token, String tagName, LedgerTag.Group category){
        long memberId = jwtTokenizer.getMemberId(token);

        return ledgerTagRepository.findByMemberMemberIdAndTagNameAndCategory(memberId, tagName, category);
    }

    // 잉여태그 삭제
    public void deleteUnusedIncomeTagsByMemberId(String token) {
        // 멤버 아이디로 모든 태그 검색
        long memberId = jwtTokenizer.getMemberId(token);
        List<LedgerTag> allTags = ledgerTagRepository.findAllByMemberMemberIdAndCategory(
                memberId, LedgerTag.Group.INCOME);

        for (LedgerTag tag : allTags) {
            long incomeCount = incomeRepository.countByLedgerTag(tag);

            if (incomeCount == 0) {
                ledgerTagRepository.delete(tag);
            }
        }
    }

    public void deleteUnusedOutgoTagsByMemberId(String token) {
        // 멤버 아이디로 모든 태그 검색
        long memberId = jwtTokenizer.getMemberId(token);

        List<LedgerTag> allTags = ledgerTagRepository.findAllByMemberMemberIdAndCategory(
                memberId, LedgerTag.Group.OUTGO);

        for (LedgerTag tag : allTags) {
            long outgoCount = outgoRepository.countByLedgerTag(tag);

            if (outgoCount == 0) {
                ledgerTagRepository.delete(tag);
            }
        }
    }
}