package com.codemouse.salog.tags.diaryTags.service;

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
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class DiaryTagService {
    private final DiaryTagRepository diaryTagRepository;
    private final DiaryTagLinkRepository diaryTagLinkRepository;
    private final DiaryTagMapper mapper;
    private final JwtTokenizer jwtTokenizer;
    private final MemberService memberService;
    private final TokenBlackListService tokenBlackListService;

    // Diary Post
    public DiaryTag postDiaryTag (String token, DiaryTagDto.Post tagDto){
        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        DiaryTag diaryTag = mapper.DiaryTagPostDtoToDiaryTag(tagDto);

        diaryTag.setMember(member);

        return diaryTagRepository.save(diaryTag);
    }

    // Diary Delete
    public void deleteDiaryTag(String token, Long diaryTagId) {
        memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        findVerifiedDiaryTag(diaryTagId);

        diaryTagRepository.deleteById(diaryTagId);
    }

    // All DiaryTagList
    public List<DiaryTagDto.ResponseTagList> getAllDiaryTagList(String token){
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크
        long memberId = jwtTokenizer.getMemberId(token);
        List<DiaryTag> diaryTags = diaryTagRepository.findAllByMemberMemberId(memberId);

        List<DiaryTagDto.ResponseTagList> tagList = new ArrayList<>();
        for (DiaryTag diaryTag : diaryTags) {
            int diaryCount = diaryTagLinkRepository.countByDiaryTag(diaryTag);
            DiaryTagDto.ResponseTagList tagDto = new DiaryTagDto.ResponseTagList(
                    diaryTag.getDiaryTagId(), diaryTag.getTagName(), diaryCount);

            tagList.add(tagDto);
        }

        return tagList;
    }

    // 해당 다이어리태그가 유효한지 검증
    public DiaryTag findVerifiedDiaryTag(long diaryTagId){
        return diaryTagRepository.findById(diaryTagId).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.TAG_NOT_FOUND));
    }

    // 멤버와 다이어리태그이름에 해당하는 객체
    public DiaryTag findDiaryTagByMemberIdAndTagName(String token, String tagName){
        long memberId = jwtTokenizer.getMemberId(token);

        return diaryTagRepository.findByMemberMemberIdAndTagName(memberId, tagName);
    }

    // 잉여태그 삭제
    public void deleteUnusedTagsByMemberId(String token) {
        // 멤버 아이디로 모든 태그 검색
        long memberId = jwtTokenizer.getMemberId(token);
        List<DiaryTag> allTags = diaryTagRepository.findAllByMemberMemberId(memberId);

        for (DiaryTag tag : allTags) {
            // 태그와 연결된 다이어리 개수 조회
            int diaryCount = diaryTagLinkRepository.countByDiaryTag(tag);

            if (diaryCount == 0) {
                // 다이어리와 연결점이 없는 경우 태그 삭제
                diaryTagRepository.delete(tag);
            }
        }
    }
}
