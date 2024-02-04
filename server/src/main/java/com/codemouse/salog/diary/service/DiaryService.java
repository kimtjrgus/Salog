package com.codemouse.salog.diary.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.diary.dto.DiaryDto;
import com.codemouse.salog.diary.entity.Diary;
import com.codemouse.salog.diary.mapper.DiaryMapper;
import com.codemouse.salog.diary.repository.DiaryRepository;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import com.codemouse.salog.tags.diaryTags.dto.DiaryTagDto;
import com.codemouse.salog.tags.diaryTags.mapper.DiaryTagMapper;
import com.codemouse.salog.tags.diaryTags.service.DiaryTagService;
import com.codemouse.salog.tags.diaryTags.entity.DiaryTag;
import com.codemouse.salog.tags.diaryTags.entity.DiaryTagLink;
import com.codemouse.salog.tags.diaryTags.repository.DiaryTagLinkRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@AllArgsConstructor
public class DiaryService {
    private final DiaryRepository diaryRepository;
    private final DiaryMapper diaryMapper;
    private final DiaryTagService tagService;
    private final DiaryTagMapper tagMapper;
    @Autowired
    private final Validator validator; // 일기태그 유효성 검사
    private final DiaryTagLinkRepository diaryTagLinkRepository;
    private final JwtTokenizer jwtTokenizer;
    private final TokenBlackListService tokenBlackListService;
    private final MemberService memberService;


    // post
    @Transactional
    public void postDiary (String token, DiaryDto.Post diaryDto){
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크

        Diary diary = diaryMapper.DiaryPostDtoToDiary(diaryDto);
        Diary savedDiary = diaryRepository.save(diary);

        // 다이어리에 해당하는 멤버 지정
        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        savedDiary.setMember(member);

        // 태그 생성 후 지정
        List<DiaryTag> createdDiaryTags = new ArrayList<>();
        for(String tagName : diaryDto.getTagList()) {
            if(tagName == null || tagName.length() == 0) {
                continue;
            }

            // 기존 태그 검색
            DiaryTag existingDiaryTag = tagService.findDiaryTagByMemberIdAndTagName(token, tagName);

            DiaryTag diaryTagToUse;
            if(existingDiaryTag != null) {
                // 기존 태그 사용
                diaryTagToUse = existingDiaryTag;
            } else {
                // 새 태그 생성
                DiaryTagDto.Post diaryPost = new DiaryTagDto.Post(tagName);

                // 추가: diaryPost에 대한 유효성 검사
                Set<ConstraintViolation<DiaryTagDto.Post>> violations = validator.validate(diaryPost);
                if (!violations.isEmpty()) {
                    throw new BusinessLogicException(ExceptionCode.TAG_UNVALIDATED);
                }

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

        diaryRepository.save(savedDiary);
    }

    // patch
    @Transactional
    public void patchDiary (String token, Long diaryId, DiaryDto.Patch diaryDto){
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크

        long memberId = jwtTokenizer.getMemberId(token);
        Diary diary = diaryMapper.DiaryPatchDtoToDiary(diaryDto);
        Diary findDiary = findVerifiedDiary(diaryId);

        verifiedRequest(findDiary.getMember().getMemberId(), memberId);

        Optional.ofNullable(diary.getTitle()).ifPresent(findDiary::setTitle);
        Optional.ofNullable(diary.getBody()).ifPresent(findDiary::setBody);
        Optional.ofNullable(diary.getImg()).ifPresent(findDiary::setImg);

        // 태그 수정
        if(diaryDto.getTagList() != null) {
            // 기존의 태그 연결 삭제
            findDiary.getDiaryTagLinks().clear();

            // 새로운 태그 생성 및 연결
            for(String tagName : diaryDto.getTagList()) {
                // 기존 태그 검색
                DiaryTag existingDiaryTag = tagService.findDiaryTagByMemberIdAndTagName(token, tagName);

                DiaryTag diaryTagToUse;
                if(existingDiaryTag != null) {
                    // 기존 태그 사용
                    diaryTagToUse = existingDiaryTag;
                } else {
                    // 새 태그 생성
                    DiaryTagDto.Post diaryPost = new DiaryTagDto.Post(tagName);

                    // 추가: diaryPost에 대한 유효성 검사
                    Set<ConstraintViolation<DiaryTagDto.Post>> violations = validator.validate(diaryPost);
                    if (!violations.isEmpty()) {
                        throw new BusinessLogicException(ExceptionCode.TAG_UNVALIDATED);
                    }

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

        diaryRepository.save(findDiary);
    }

    // get 다이어리 상세조회
    public DiaryDto.Response findDiary (String token, Long diaryId){
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크
        long memberId = jwtTokenizer.getMemberId(token);

        Diary diary = findVerifiedDiary(diaryId);

        verifiedRequest(diary.getMember().getMemberId(), memberId);

        DiaryDto.Response diaryResponse = diaryMapper.DiaryToDiaryResponseDto(diary);

        // 태그 리스트 추가
        List<DiaryTagDto.Response> tagList = diary.getDiaryTagLinks().stream()
                .map(DiaryTagLink::getDiaryTag)
                .map(tagMapper::DiaryTagToDiaryTagResponseDto)
                .collect(Collectors.toList());
        diaryResponse.setTagList(tagList);

        return diaryResponse;
    }

    //all List get
    @Transactional
    public MultiResponseDto<DiaryDto.Response> findAllDiaries (String token, int page, int size,
                                            String diaryTag, String date){
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크
        long memberId = jwtTokenizer.getMemberId(token);

        Page<Diary> diaryPage;

        // 1. Only diaryTag에 대한 쿼리
        if (diaryTag != null && date == null) {
            // UTF-8로 디코딩
            String decodedTag = URLDecoder.decode(diaryTag, StandardCharsets.UTF_8);
            log.info("DecodedTag To UTF-8 : {}", decodedTag);

            List<DiaryTagLink> diaryTagLinks = diaryTagLinkRepository.findByDiaryTagTagNameAndDiaryTagMember(
                    decodedTag, memberService.findVerifiedMember(memberId));
            List<Long> diaryIds = diaryTagLinks.stream()
                    .map(DiaryTagLink::getDiary)
                    .map(Diary::getDiaryId)
                    .collect(Collectors.toList());

            diaryPage = diaryRepository.findAllByDiaryIdIn(diaryIds,
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }

        // 2. date에 대한 쿼리
        else if (date != null && diaryTag == null) {
            diaryPage = diaryRepository.findAllByMemberMemberIdAndDate(memberId, LocalDate.parse(date),
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }

        // 3. 모두 null인 경우 전체 리스트 조회
        else if(diaryTag == null && date == null){
            diaryPage = diaryRepository.findAllByMemberMemberId(memberId,
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }
        else {
            throw new BusinessLogicException(ExceptionCode.DIARY_NOT_FOUND);
        }

        List<DiaryDto.Response> diaryDtoList = diaryPage.getContent().stream()
                    .map(diary -> {
                        DiaryDto.Response response = diaryMapper.DiaryToDiaryResponseDto(diary);

                        // 태그 리스트 추가
                        List<DiaryTagDto.Response> tagList = diary.getDiaryTagLinks().stream()
                                .map(DiaryTagLink::getDiaryTag)
                                .map(tagMapper::DiaryTagToDiaryTagResponseDto)
                                .collect(Collectors.toList());
                        response.setTagList(tagList);

                        return response;
                    })
                    .collect(Collectors.toList());

            return new MultiResponseDto<>(diaryDtoList, diaryPage);
    }

    //title List get
    @Transactional
    public MultiResponseDto<DiaryDto.Response> findTitleDiaries (String token, int page, int size, String title){
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크
        long memberId = jwtTokenizer.getMemberId(token);

        // UTF-8로 디코딩
        String decodedTitle = URLDecoder.decode(title, StandardCharsets.UTF_8);
        log.info("DecodedTitle To UTF-8 : {}", decodedTitle);

        // page 정보 생성
        Page<Diary> diaryPage = diaryRepository.findAllByMemberMemberIdAndTitleContaining(memberId, decodedTitle,
                PageRequest.of(page -1, size, Sort.by("date").descending()));

        List<DiaryDto.Response> diaryDtoList = diaryPage.getContent().stream()
                .map(diary -> {
                    DiaryDto.Response response = diaryMapper.DiaryToDiaryResponseDto(diary);

                    // 태그 리스트 추가
                    List<DiaryTagDto.Response> tagList = diary.getDiaryTagLinks().stream()
                            .map(DiaryTagLink::getDiaryTag)
                            .map(tagMapper::DiaryTagToDiaryTagResponseDto)
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
        tokenBlackListService.isBlackListed(token); // 로그아웃 된 회원인지 체크
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
        // 중간 테이블의 레코드를 삭제
        diaryTagLinkRepository.deleteByDiaryId(diaryId);

        diaryRepository.deleteById(diaryId);
    }

    // 해당 다이어리가 유효한지 검증
    public Diary findVerifiedDiary(long diaryId){
        return diaryRepository.findById(diaryId).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.DIARY_NOT_FOUND));
    }

    // 다이어리를 작성한 멤버가 맞는지 확인하는 메서드
    private void verifiedRequest(long diaryMemberId, long compareId) {
        if (diaryMemberId != compareId) {
            throw new BusinessLogicException(ExceptionCode.MEMBER_MISMATCHED);
        }
    }
}
