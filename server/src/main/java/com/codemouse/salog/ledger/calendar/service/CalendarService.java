package com.codemouse.salog.ledger.calendar.service;

import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.dto.PageInfo;
import com.codemouse.salog.ledger.calendar.dto.CalendarDto;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.service.IncomeService;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.service.OutgoService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@Slf4j
@AllArgsConstructor
public class CalendarService {
    private final IncomeService incomeService;
    private final OutgoService outgoService;

    public List<CalendarDto.Response> getCalendar(String token, String date){
        List<CalendarDto.Response> responses = new ArrayList<>();

        LocalDate parsedDate = LocalDate.parse(date.substring(0, 7) + "-01");
        LocalDate startDate = parsedDate.withDayOfMonth(1);
        LocalDate endDate = parsedDate.withDayOfMonth(parsedDate.lengthOfMonth());

        // 해당 월의 모든 날짜를 순회
        for (LocalDate curDate = startDate; !curDate.isAfter(endDate); curDate = curDate.plusDays(1)) {
            // 날짜별로 totalOutgo와 totalIncome을 조회
            long totalOutgo = outgoService.getDailyTotalOutgo(token, curDate);
            long totalIncome = incomeService.getDailyTotalIncome(token, curDate);

            // CalendarDto.Response 객체를 생성하고 리스트에 추가
            responses.add(new CalendarDto.Response(curDate.toString(), totalOutgo, totalIncome));
        }

        return responses;
    }

    public MultiResponseDto<CalendarDto.LedgerResponse> getIntegratedLedger(String token, int page, int size, String date, String ledgerTag){
        List<IncomeDto.Response> incomeList = incomeService.getIncomes(token, 1, Integer.MAX_VALUE, ledgerTag, date).getData();
        List<OutgoDto.Response> outgoList = outgoService.findOutgoPagesAsList(token, 1, Integer.MAX_VALUE, date, ledgerTag, null);

        List<CalendarDto.LedgerResponse> ledgerResponses = new ArrayList<>();

        for (IncomeDto.Response income : incomeList) {
            ledgerResponses.add(
                    new CalendarDto.LedgerResponse(
                            income.getIncomeId(),
                            null, // outgoId는 null
                            income.getDate(),
                            income.getMoney(),
                            income.getIncomeName(),
                            null,
                            income.getMemo(),
                            income.getIncomeTag(),
                            null,
                            null
                    ));
        }

        for (OutgoDto.Response outgo : outgoList) {
            ledgerResponses.add(
                    new CalendarDto.LedgerResponse(
                            null, // incomeId는 null
                            outgo.getOutgoId(),
                            outgo.getDate(),
                            outgo.getMoney(),
                            outgo.getOutgoName(),
                            outgo.getPayment(),
                            outgo.getMemo(),
                            outgo.getOutgoTag(),
                            outgo.isWasteList(),
                            outgo.getReceiptImg()
                    ));
        }

        ledgerResponses.sort((o1, o2) -> o2.getDate().compareTo(o1.getDate()));

        // 페이지 처리
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, ledgerResponses.size());
        long totalElements = ledgerResponses.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        PageInfo pageInfo = new PageInfo(page, size, totalElements, totalPages);

        List<CalendarDto.LedgerResponse> pagedData = new ArrayList<>();
        if(ledgerResponses != null && fromIndex <= toIndex) {
            pagedData = ledgerResponses.subList(fromIndex, toIndex);
            // subList가 fromIndex <= toIndex 해당 조건안에서 동작하기 위함.
        }

        return new MultiResponseDto<>(pagedData, pageInfo);
    }
}
