package com.codemouse.salog.tags.repository;

import com.codemouse.salog.tags.entity.DiaryTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface DiaryTagRepository extends JpaRepository<DiaryTag, Long> {
    List<DiaryTag> findAllByMemberMemberId(Long memberId);

    // memberId와 tagName에 맞는 다이어리 태그 찾기
    DiaryTag findByMemberMemberIdAndTagName(Long memberId, String tagName);
}
