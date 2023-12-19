package com.codemouse.salog.diary.entity;

import com.codemouse.salog.audit.Auditable;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.entity.DiaryTagLink;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Entity
@NoArgsConstructor
@Getter
@Setter
public class Diary extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long diaryId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String title;

    @Column
    private String body;

    @Column
    private String img;

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID")
    private Member member;

    // orphanRemoval : 다이어리 삭제시 매핑되어있는 객체도 함께 삭제해주는 옵션
    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaryTagLink> diaryTagLinks = new ArrayList<>();
}