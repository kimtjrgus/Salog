package com.codemouse.salog.tags.diaryTags.entity;

import com.codemouse.salog.diary.entity.Diary;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class DiaryTagLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long DiaryTagLinkId;

    @ManyToOne
    @JoinColumn(name = "DIARY_ID")
    private Diary diary;

    @ManyToOne
    @JoinColumn(name = "DIARYTAG_ID")
    private DiaryTag diaryTag;
}
