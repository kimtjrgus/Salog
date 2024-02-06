package com.codemouse.salog.tags.diaryTags.repository;

import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.diaryTags.entity.DiaryTag;
import com.codemouse.salog.tags.diaryTags.entity.DiaryTagLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface DiaryTagLinkRepository extends JpaRepository<DiaryTagLink, Long> {
    List<DiaryTagLink> findByDiaryTagTagNameAndDiaryTagMember(String tagName, Member member);
    int countByDiaryTag(DiaryTag diaryTag);

    @Transactional
    @Modifying // update나 delete는 해당 어노테이션을 추가해줘야함. (@Query만 사용할 경우 기본 select)
    @Query("DELETE FROM DiaryTagLink d WHERE d.diary.diaryId = :diaryId")
    void deleteByDiaryId(@Param("diaryId") Long diaryId);
}
