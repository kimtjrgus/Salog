package com.codemouse.salog.tags.ledgerTags.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import com.codemouse.salog.tags.diaryTags.dto.DiaryTagDto;
import com.codemouse.salog.tags.diaryTags.entity.DiaryTag;
import com.codemouse.salog.tags.diaryTags.mapper.DiaryTagMapper;
import com.codemouse.salog.tags.diaryTags.repository.DiaryTagLinkRepository;
import com.codemouse.salog.tags.diaryTags.repository.DiaryTagRepository;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.mapper.LedgerTagMapper;
import com.codemouse.salog.tags.ledgerTags.repository.LedgerTagLinkRepository;
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
    private final LedgerTagLinkRepository ledgerTagLinkRepository;
    private final LedgerTagMapper mapper;
    private final JwtTokenizer jwtTokenizer;
    private final MemberService memberService;

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
    public LedgerTag findLedgerTagByMemberIdAndTagName(String token, String tagName){
        long memberId = jwtTokenizer.getMemberId(token);

        return ledgerTagRepository.findByMemberMemberIdAndTagName(memberId, tagName);
    }

    // 잉여태그 삭제
    public void deleteUnusedTagsByMemberId(String token) {
        // 멤버 아이디로 모든 태그 검색
        long memberId = jwtTokenizer.getMemberId(token);
        List<LedgerTag> allTags = ledgerTagRepository.findAllByMemberMemberId(memberId);

        for (LedgerTag tag : allTags) {
            // 태그와 연결된 다이어리 개수 조회
            long ledgerCount = ledgerTagLinkRepository.countByLedgerTag(tag);

            if (ledgerCount == 0) {
                // 다이어리와 연결점이 없는 경우 태그 삭제
                ledgerTagRepository.delete(tag);
            }
        }
    }
}