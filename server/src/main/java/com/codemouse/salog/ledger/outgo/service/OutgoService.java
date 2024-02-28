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
    public OutgoDto.Response postOutgo (String token, OutgoDto.Post outgoDTO){
        tokenBlackListService.isBlackListed(token);

        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        Outgo outgo = outgoMapper.OutgoPostDtoToOutgo(outgoDTO);
        outgo.setMember(member);
        // 태그 생성 로직
        Outgo savedOutgo = tagHandler(outgoDTO.getOutgoTag(), token, outgo);

        return outgoMapper.OutgoToOutgoResponseDto(savedOutgo);
    }

    // PATCH
    @Transactional
    public OutgoDto.Response patchOutgo (String token, long outgoId, OutgoDto.Patch outgoDto){
        tokenBlackListService.isBlackListed(token);

        Outgo outgo = outgoMapper.OutgoPatchDtoToOutgo(outgoDto);
        Outgo findOutgo = findVerifiedOutgo(outgoId);
        memberService.verifiedRequest(token, findOutgo.getMember().getMemberId());

        Optional.of(outgo.getDate()).ifPresent(findOutgo::setDate);
        Optional.of(outgo.getOutgoName()).ifPresent(findOutgo::setOutgoName);
        Optional.of(outgo.getMoney()).ifPresent(findOutgo::setMoney);
        Optional.of(outgo.getPayment()).ifPresent(findOutgo::setPayment);
        Optional.ofNullable(outgo.getMemo()).ifPresent(findOutgo::setMemo);
        Optional.of(outgo.getReceiptImg()).ifPresent(findOutgo::setReceiptImg);
        Optional.of(outgo.isWasteList()).ifPresent(findOutgo::setWasteList);

        Outgo savedOutgo = tagHandler(outgoDto.getOutgoTag(), token, findOutgo);

        return outgoMapper.OutgoToOutgoResponseDto(savedOutgo);
    }

    // GET All List
    @Transactional
    public MultiResponseDto<OutgoDto.Response> findAllOutgos (String token, int page, int size, String date, String outgoTag){
        tokenBlackListService.isBlackListed(token);

        Page<Outgo> outgoPage = findOutgoPages(token, page, size, date, outgoTag, null);

        List<OutgoDto.Response> outgoDtoList = outgoPage.getContent().stream()
                .map(outgoMapper::OutgoToOutgoResponseDto)
                .collect(Collectors.toList());

        return new MultiResponseDto<>(outgoDtoList, outgoPage);
    }

    // GET WasteList
    public MultiResponseDto<OutgoDto.Response> findAllWasteLists(String token, int page, int size, String date, String outgoTag){
        tokenBlackListService.isBlackListed(token);
        Page<Outgo> wastePage = findOutgoPages(token, page, size, date, outgoTag, true);

        List<OutgoDto.Response> wasteDtoList = wastePage.getContent().stream()
                .map(outgoMapper::OutgoToOutgoResponseDto)
                .collect(Collectors.toList());

        return new MultiResponseDto<>(wasteDtoList, wastePage);
    }

    // GET Outgo Sum
    public OutgoDto.MonthlyResponse getSumOfOutgoLists(String token, String date){
        tokenBlackListService.isBlackListed(token);
        long memberId = jwtTokenizer.getMemberId(token);

        String[] dateParts = date.split("-");
        int year = Integer.parseInt(dateParts[0]);
        int month = Integer.parseInt(dateParts[1]);

        List<Object[]> results = outgoRepository.getSumOfOutgoListsByTag(memberId, year, month);
        List<LedgerTagDto.MonthlyResponse> sumByTags = results.stream()
                .map(result -> {
                    String tagName = (String) result[0];
                    long tagSum = (result[1] != null ? ((Number) result[1]).longValue() : 0L);
                    return new LedgerTagDto.MonthlyResponse(tagName, tagSum);
                })
                .collect(Collectors.toList());

        // 월간 지출 합계를 계산합니다.
        long monthlyOutgo = Optional.ofNullable(
                outgoRepository.findTotalOutgoByMonth(memberId, year, month))
                .orElse(0L);

        return new OutgoDto.MonthlyResponse(monthlyOutgo, sumByTags);
    }

    // GET WasteList Sum
    public OutgoDto.MonthlyResponse getSumOfWasteLists(String token, String date){
        tokenBlackListService.isBlackListed(token);
        long memberId = jwtTokenizer.getMemberId(token);

        String[] dateParts = date.split("-");
        int year = Integer.parseInt(dateParts[0]);
        int month = Integer.parseInt(dateParts[1]);

        List<Object[]> results = outgoRepository.getSumOfWasteListsByTag(memberId, year, month);
        List<LedgerTagDto.MonthlyResponse> sumByTags = results.stream()
                .map(result -> {
                    String tagName = (String) result[0];
                    long tagSum = (result[1] != null ? ((Number) result[1]).longValue() : 0L);
                    return new LedgerTagDto.MonthlyResponse(tagName, tagSum);
                })
                .collect(Collectors.toList());

        long monthlyWasteList =
                sumByTags.stream().mapToLong(LedgerTagDto.MonthlyResponse::getTagSum).sum();

        return new OutgoDto.MonthlyResponse(monthlyWasteList, sumByTags);
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

    public long getDailyTotalOutgo(String token, LocalDate curDate){
        long memberId = jwtTokenizer.getMemberId(token);

        return Optional.ofNullable(
                outgoRepository.findTotalOutgoByDay(memberId, curDate)
        ).orElse(0L); // 쿼리결과 null 값이 반환될 경우 0이 대신 반환
    }

    // 태그 등록, 중복 체크
    private Outgo tagHandler(String outgoPostDto, String token, Outgo outgo) {
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

        Outgo savedOutgo = outgoRepository.save(outgo);
        ledgerTagService.deleteUnusedOutgoTagsByMemberId(token);

        return savedOutgo;
    }

    // 페이지 생성 중복 코드 통일
    private Page<Outgo> findOutgoPages(String token, int page, int size, String date, String outgoTag, Boolean isWasteList) {
        long memberId = jwtTokenizer.getMemberId(token);
        Page<Outgo> outgoPage = null;

        // 1. 조회할 날짜 지정
        LocalDate startDate;
        LocalDate endDate;

        // 월별 조회
        if (date.endsWith("00")) {
            LocalDate parsedDate = LocalDate.parse(date.substring(0, 7) + "-01");
            startDate = parsedDate.withDayOfMonth(1);
            endDate = parsedDate.withDayOfMonth(parsedDate.lengthOfMonth());
        } // 그외 경우 일별 조회
        else {
            startDate = LocalDate.parse(date);
            endDate = startDate;
        }

        // 2. 지정한 날짜에 대한 쿼리들(태그O, 태그X)
        if (outgoTag != null) { // 태그별 조회
            String decodedTag = URLDecoder.decode(outgoTag, StandardCharsets.UTF_8);
            log.info("DecodedTag To UTF-8 : {}", decodedTag);

            // 태그이름에 대한 검색 쿼리 outgo 쿼리
            List<LedgerTag> tags = ledgerTagRepository.findAllByMemberMemberIdAndTagName(memberId, decodedTag);
            List<Long> outgoIds = tags.stream()
                    .flatMap(tag -> tag.getOutgos().stream()) // 각 LedgerTag의 Outgo 리스트를 스트림으로 평탄화
                    .map(Outgo::getOutgoId)
                    .collect(Collectors.toList());

            if(isWasteList == null){
                outgoPage = outgoRepository.findAllByOutgoIdInAndDateBetween(
                        outgoIds, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));

            } else if(isWasteList){
                outgoPage = outgoRepository.findAllByOutgoIdInAndWasteListAndDateBetween(
                        outgoIds, true, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));

            }
        }
        else { // none tag
            if (isWasteList == null){
                outgoPage = outgoRepository.findAllByMemberMemberIdAndDateBetween(
                        memberId, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));
            } else if (isWasteList) {
                outgoPage = outgoRepository.findAllByMemberMemberIdAndWasteListAndDateBetween(
                        memberId, true, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));
            }
        }

        return outgoPage;
    }
    
    // 상단의 페이지생성 메서드오버로딩
    public List<OutgoDto.Response> findOutgoPagesAsList(String token, int page, int size, String date, String outgoTag, Boolean isWasteList){
        Page<Outgo> outgoPage = findOutgoPages(token, page, size, date, outgoTag, isWasteList);
        return outgoPage.getContent().stream()
                .map(outgoMapper::OutgoToOutgoResponseDto)
                .collect(Collectors.toList());
    }
}
