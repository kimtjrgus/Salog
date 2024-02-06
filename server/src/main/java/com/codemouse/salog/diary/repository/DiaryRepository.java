package com.codemouse.salog.diary.repository;

import com.codemouse.salog.diary.entity.Diary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Long> {
    Page<Diary> findAllByMemberMemberId(long memberId, Pageable pageRequest);
    Page<Diary> findAllByDiaryIdIn(List<Long> diaryIds, Pageable pageable);

    Page<Diary> findAllByMemberMemberIdAndDate(Long memberId, LocalDate date, Pageable pageable);
    Page<Diary> findAllByMemberMemberIdAndTitleContaining(long memberId, String title, Pageable pageRequest);

    @Query("SELECT DISTINCT d.date FROM Diary d WHERE d.member.id = :memberId AND YEAR(d.date) = :year AND MONTH(d.date) = :month")
    List<LocalDate> findDistinctDatesByMemberIdAndYearAndMonth(@Param("memberId") Long memberId, @Param("year") int year, @Param("month") int month);
}
