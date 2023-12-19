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
    @Query("SELECT d FROM Diary d WHERE d.member.id = :memberId AND EXTRACT(MONTH FROM d.date) = :month")
    Page<Diary> findAllByMonth(@Param("memberId") Long memberId, @Param("month") Integer month, Pageable pageable);
    Page<Diary> findAllByMemberMemberIdAndDate(Long memberId, LocalDate date, Pageable pageable);
    Page<Diary> findAllByMemberMemberIdAndTitleContaining(long memberId, String title,
                                                          Pageable pageRequest);
}
