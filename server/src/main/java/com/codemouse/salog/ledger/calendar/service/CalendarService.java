package com.codemouse.salog.ledger.calendar.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.ledger.calendar.dto.CalendarDto;
import com.codemouse.salog.ledger.income.repository.IncomeRepository;
import com.codemouse.salog.ledger.income.service.IncomeService;
import com.codemouse.salog.ledger.outgo.repository.OutgoRepository;
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
}
