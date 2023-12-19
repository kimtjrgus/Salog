package com.codemouse.salog.diary.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.diary.dto.DiaryDto;
import com.codemouse.salog.diary.entity.Diary;
import com.codemouse.salog.diary.mapper.DiaryMapper;
import com.codemouse.salog.diary.repository.DiaryRepository;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import com.codemouse.salog.tags.dto.TagDto;
import com.codemouse.salog.tags.entity.DiaryTag;
import com.codemouse.salog.tags.entity.DiaryTagLink;
import com.codemouse.salog.tags.repository.DiaryTagLinkRepository;
import com.codemouse.salog.tags.service.TagService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class DiaryService {
    private final DiaryRepository repository;
    private final DiaryMapper mapper;
    private final TagService tagService;
    private final JwtTokenizer jwtTokenizer;
    private final MemberService memberService;
    private final DiaryTagLinkRepository diaryTagLinkRepository;


    // post
    @Transactional
    public void postDiary (String token, DiaryDto.Post diaryDto){
        Diary diary = mapper.DiaryPostDtoToDiary(diaryDto);
        Diary savedDiary = repository.save(diary);

        // 다이어리에 해당하는 멤버 지정
        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        savedDiary.setMember(member);

        // 태그 생성 후 지정
        List<DiaryTag> createdDiaryTags = new ArrayList<>();
        for(String tagName : diaryDto.getTagList()) {
            // 기존 태그 검색
            DiaryTag existingDiaryTag = tagService.findDiaryTagByMemberIdAndTagName(token, tagName);

            DiaryTag diaryTagToUse;
            if(existingDiaryTag != null) {
                // 기존 태그 사용
                diaryTagToUse = existingDiaryTag;
            } else {
                // 새 태그 생성
                TagDto.DiaryPost diaryPost = new TagDto.DiaryPost(tagName);
                diaryTagToUse = tagService.postDiaryTag(token, diaryPost);
            }
            createdDiaryTags.add(diaryTagToUse);
        }

        // 다이어리에 태그 추가
        for(DiaryTag diaryTag : createdDiaryTags) {
            DiaryTagLink link = new DiaryTagLink();
            link.setDiary(savedDiary);
            link.setDiaryTag(diaryTag);
            savedDiary.getDiaryTagLinks().add(link);
        }

        repository.save(savedDiary);
    }

    // patch
    @Transactional
    public void patchDiary (String token, Long diaryId, DiaryDto.Patch diaryDto){
        long memberId = jwtTokenizer.getMemberId(token);
        Diary findDiary = findVerifiedDiary(diaryId);

        verifiedRequest(findDiary.getMember().getMemberId(), memberId);

        Optional.ofNullable(diaryDto.getTitle()).ifPresent(findDiary::setTitle);
        Optional.ofNullable(diaryDto.getBody()).ifPresent(findDiary::setBody);
        Optional.ofNullable(diaryDto.getImg()).ifPresent(findDiary::setImg);

        // 태그 수정
        if(diaryDto.getTagList() != null) {
            // 기존의 태그 연결 삭제
            findDiary.getDiaryTagLinks().clear();

            // 새로운 태그 생성 및 연결
            for(String tagName : diaryDto.getTagList()) {
                TagDto.DiaryPost diaryPost = new TagDto.DiaryPost(tagName);

                // 기존 태그 검색
                DiaryTag existingDiaryTag = tagService.findDiaryTagByMemberIdAndTagName(token, tagName);

                DiaryTag diaryTagToUse;
                if(existingDiaryTag != null) {
                    // 기존 태그 사용
                    diaryTagToUse = existingDiaryTag;
                } else {
                    // 새 태그 생성
                    diaryTagToUse = tagService.postDiaryTag(token, diaryPost);
                }
                DiaryTagLink link = new DiaryTagLink();
                link.setDiary(findDiary);
                link.setDiaryTag(diaryTagToUse);
                findDiary.getDiaryTagLinks().add(link);
            }
            // 잉여태그 삭제
            tagService.deleteUnusedTagsByMemberId(token);
        }

        repository.save(findDiary);
    }

    // get 다이어리 상세조회
    public DiaryDto.Response findDiary (String token, Long diaryId){
        long memberId = jwtTokenizer.getMemberId(token);
        Diary diary = findVerifiedDiary(diaryId);

        verifiedRequest(diary.getMember().getMemberId(), memberId);

        DiaryDto.Response diaryResponse = mapper.DiaryToDiaryResponseDto(diary);

        // 태그 리스트 추가
        List<String> tagList = diary.getDiaryTagLinks().stream()
                .map(link -> link.getDiaryTag().getTagName())
                .collect(Collectors.toList());
        diaryResponse.setTagList(tagList);

        return diaryResponse;
    }

    //all List get
    @Transactional
    public MultiResponseDto findAllDiaries (String token, int page, int size,
                                            String diaryTag, Integer month, String date){
        long memberId = jwtTokenizer.getMemberId(token);

        Page<Diary> diaryPage;

        // 1. Only diaryTag에 대한 쿼리
        if (diaryTag != null && month == null && date == null) {
            List<DiaryTagLink> diaryTagLinks = diaryTagLinkRepository.findByDiaryTagTagNameAndDiaryTagMember(
                    diaryTag, memberService.findVerifiedMember(memberId));
            List<Long> diaryIds = diaryTagLinks.stream()
                    .map(DiaryTagLink::getDiary)
                    .map(Diary::getDiaryId)
                    .collect(Collectors.toList());;

            diaryPage = repository.findAllByDiaryIdIn(diaryIds,
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }
        // 2. Only month에 대한 쿼리
        else if (month != null && diaryTag == null && date == null) {
            diaryPage = repository.findAllByMonth(memberId, month,
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }
        // 3. Only date에 대한 쿼리
        else if (date != null && diaryTag == null && month == null) {
            diaryPage = repository.findAllByMemberMemberIdAndDate(memberId, LocalDate.parse(date),
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }

        // 4. 모두 null인 경우 전체 리스트 조회
        else if(diaryTag == null && month == null && date == null){
            diaryPage = repository.findAllByMemberMemberId(memberId,
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }
        else {
            throw new BusinessLogicException(ExceptionCode.DIARY_NOT_FOUND);
        }

        List<DiaryDto.Response> diaryDtoList = diaryPage.getContent().stream()
                    .map(diary -> {
                        DiaryDto.Response response = mapper.DiaryToDiaryResponseDto(diary);

                        // 태그 리스트 추가
                        List<String> tagList = diary.getDiaryTagLinks().stream()
                                .map(link -> link.getDiaryTag().getTagName())
                                .collect(Collectors.toList());
                        response.setTagList(tagList);

                        return response;
                    })
                    .collect(Collectors.toList());

            return new MultiResponseDto<>(diaryDtoList, diaryPage);
    }

    //title List get
    @Transactional
    public MultiResponseDto findTitleDiaries (String token, int page, int size, String title){
        long memberId = jwtTokenizer.getMemberId(token);

        // page 정보 생성
        Page<Diary> diaryPage = repository.findAllByMemberMemberIdAndTitleContaining(memberId,title,
                PageRequest.of(page -1, size, Sort.by("date").descending()));

        List<DiaryDto.Response> diaryDtoList = diaryPage.getContent().stream()
                .map(diary -> {
                    DiaryDto.Response response = mapper.DiaryToDiaryResponseDto(diary);

                    // 태그 리스트 추가
                    List<String> tagList = diary.getDiaryTagLinks().stream()
                            .map(link -> link.getDiaryTag().getTagName())
                            .collect(Collectors.toList());
                    response.setTagList(tagList);

                    return response;
                })
                .collect(Collectors.toList());

        return new MultiResponseDto<>(diaryDtoList, diaryPage);
    }



    // delete
    @Transactional
    public void deleteDiary (String token, Long diaryId){
        long memberId = jwtTokenizer.getMemberId(token);
        Diary diary = findVerifiedDiary(diaryId); // Diary가 존재하는지 확인 후 삭제하기 위함

        verifiedRequest(diary.getMember().getMemberId(), memberId);

        // 해당 다이어리와 연결된 모든 태그를 가져옴
        List<DiaryTag> diaryTags = diary.getDiaryTagLinks().stream()
                .map(DiaryTagLink::getDiaryTag)
                .collect(Collectors.toList());

        // 태그를 사용하는 다른 다이어리가 있는지 확인 후, 없으면 태그 삭제
        for (DiaryTag diaryTag : diaryTags) {
            List<DiaryTagLink> links = diaryTag.getDiaryTagLinks();
            if (links.size() == 1 && links.get(0).getDiary().getDiaryId().equals(diaryId)) {
                tagService.deleteDiaryTag(token ,diaryTag.getDiaryTagId());
            }
        }

        repository.deleteById(diaryId);
    }

    // 해당 다이어리가 유효한지 검증
    public Diary findVerifiedDiary(long diaryId){
        return repository.findById(diaryId).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.DIARY_MISMATCHED));
    }

    // 다이어리를 작성한 멤버가 맞는지 확인하는 메서드
    private void verifiedRequest(long diaryMemberId, long compareId) {
        if (diaryMemberId != compareId) {
            throw new BusinessLogicException(ExceptionCode.MEMBER_MISMATCHED);
        }
    }
}
