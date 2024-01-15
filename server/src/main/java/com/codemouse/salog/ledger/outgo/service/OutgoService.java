package com.codemouse.salog.ledger.outgo.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.ledger.outgo.mapper.OutgoMapper;
import com.codemouse.salog.ledger.outgo.repository.OutgoRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.repository.LedgerTagRepository;
import com.codemouse.salog.tags.ledgerTags.service.LedgerTagService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
@Transactional
public class OutgoService {
    private final OutgoRepository outgoRepository;
    private final OutgoMapper outgoMapper;
    private final LedgerTagRepository ledgerTagRepository;
    private final LedgerTagService ledgerTagService;
    private final JwtTokenizer jwtTokenizer;
    private final TokenBlackListService tokenBlackListService;
    private final MemberService memberService;


    // POST
    @Transactional
    public void postOutgo (String token, OutgoDto.Post outgoDTO){
        tokenBlackListService.isBlackListed(token);

        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        Outgo outgo = outgoMapper.OutgoPostDtoToOutgo(outgoDTO);
        outgo.setMember(member);
        // 태그 생성 로직
        tagHandler(outgoDTO.getOutgoTag(), token, outgo);
    }

    // PATCH
    @Transactional
    public void patchOutgo (String token, long outgoId, OutgoDto.Patch outgoDTO){
        tokenBlackListService.isBlackListed(token);

        Outgo findOutgo = findVerifiedOutgo(outgoId);
        memberService.verifiedRequest(token, findOutgo.getMember().getMemberId());

        Optional.ofNullable(outgoDTO.getDate()).ifPresent(date -> findOutgo.setDate(LocalDate.parse(date)));
        Optional.ofNullable(outgoDTO.getOutgoName()).ifPresent(findOutgo::setOutgoName);
        Optional.ofNullable(outgoDTO.getMoney()).ifPresent(findOutgo::setMoney);
        Optional.ofNullable(outgoDTO.getMemo()).ifPresent(findOutgo::setMemo);
        Optional.ofNullable(outgoDTO.getReceiptImg()).ifPresent(findOutgo::setReceiptImg);
        Optional.ofNullable(outgoDTO.getWasteList()).ifPresent(findOutgo::setWasteList);

        if(outgoDTO.getOutgoTag() != null){
            tagHandler(outgoDTO.getOutgoTag(), token, findOutgo);
        }
        else{
            outgoRepository.save(findOutgo);
        }
    }

    // GET All List
    @Transactional
    public MultiResponseDto<OutgoDto.Response> findAllOutgos (String token, int page, int size, String date, String outgoTag){
        tokenBlackListService.isBlackListed(token);
        long memberId = jwtTokenizer.getMemberId(token);

        Page<Outgo> outgoPage;
        // 월, 일별조회를 위한 변수선언
        LocalDate startDate;
        LocalDate endDate;

        // 1. 조회할 날짜 지정
        // date 끝자리에 00 입력시 월별 조회
        if (date.endsWith("00")) { // 2012-11-01
            LocalDate parsedDate = LocalDate.parse(date.substring(0, 7) + "-01");
            startDate = parsedDate.withDayOfMonth(1);
            endDate = parsedDate.withDayOfMonth(parsedDate.lengthOfMonth());
        } // 그외 경우 일별 조회
        else {
            startDate = LocalDate.parse(date);
            endDate = startDate;
        }

        // 2. 지정한 날짜에 대한 쿼리들(태그O, 태그X)
        if(outgoTag != null){ // 태그별 조회
            String decodedTag = URLDecoder.decode(outgoTag, StandardCharsets.UTF_8);
            log.info("DecodedTag To UTF-8 : {}", decodedTag);

            // 태그이름에 대한 검색 쿼리 outgo 쿼리
            List<LedgerTag> tags = ledgerTagRepository.findAllByMemberMemberIdAndTagName(memberId, decodedTag);
            List<Long> outgoIds = tags.stream()
                    .flatMap(tag -> tag.getOutgos().stream()) // 각 LedgerTag의 Outgo 리스트를 스트림으로 평탄화
                    .map(Outgo::getOutgoId)
                    .collect(Collectors.toList());

            outgoPage = outgoRepository.findAllByOutgoIdInAndDateBetween(
                    outgoIds, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }
        else{ // none tag
            outgoPage = outgoRepository.findAllByMemberMemberIdAndDateBetween(
                    memberId, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));

        }

        List<OutgoDto.Response> outgoDTOList = outgoPage.getContent().stream()
                .map(outgoMapper::OutgoToOutgoResponseDto)
                .collect(Collectors.toList());

        return new MultiResponseDto<>(outgoDTOList, outgoPage);
    }

    // DELETE
    @Transactional
    public void deleteOutgo (String token, long outgoId){
        log.info("Outgo delete requested - token: {}, outgoId: {}", token, outgoId);
        tokenBlackListService.isBlackListed(token);

        Outgo findOutgo = findVerifiedOutgo(outgoId);
        memberService.verifiedRequest(token, findOutgo.getMember().getMemberId());

        LedgerTag ledgerTag = findOutgo.getLedgerTag();

        outgoRepository.delete(findOutgo);

        // 삭제하려는 지출에만 연결된 태그인 경우, 태그 삭제
        if (ledgerTag != null && ledgerTag.getOutgos().size() == 1) {
            ledgerTagService.deleteLedgerTag(token, ledgerTag.getLedgerTagId());
        }
        else {
            // 연결된 태그가 있는 경우, 지출과 태그의 연결만을 끊음
            findOutgo.setLedgerTag(null);
        }

        log.info("Outgo successfully deleted - memberId: {}, outgoId: {}", jwtTokenizer.getMemberId(token), outgoId);
    }

    public Outgo findVerifiedOutgo(long outgoId){
        return outgoRepository.findById(outgoId).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.OUTGO_NOT_FOUND));
    }

    // 태그 등록, 중복 체크
    private void tagHandler(String outgoPostDto, String token, Outgo outgo) {
        LedgerTag ledgerTag = null;

        if (outgoPostDto != null) {
            String tagName = outgoPostDto;

            LedgerTag existTag = ledgerTagService.findLedgerTagByMemberIdAndTagName(token, tagName, LedgerTag.Group.OUTGO);

            if (existTag != null) {
                if (existTag.getCategory() == LedgerTag.Group.OUTGO) {
                    ledgerTag = existTag;
                }
            } else {
                LedgerTagDto.Post tagPost = new LedgerTagDto.Post(tagName, LedgerTag.Group.OUTGO);
                ledgerTag = ledgerTagService.postLedgerTag(token, tagPost);
            }
        }

        // 만약 ledgerTag가 null이 아니라면 outgo 객체에 설정
        if (ledgerTag != null) {
            outgo.setLedgerTag(ledgerTag);
        }

        outgoRepository.save(outgo);
        ledgerTagService.deleteUnusedOutgoTagsByMemberId(token);
    }
}
