package com.codemouse.salog.diary.mapper;

import com.codemouse.salog.diary.dto.DiaryDto;
import com.codemouse.salog.diary.entity.Diary;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;


@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DiaryMapper {
    Diary DiaryPostDtoToDiary(DiaryDto.Post requestBody);
    Diary DiaryPatchDtoToDiary(DiaryDto.Patch requestBody);

    DiaryDto.Response DiaryToDiaryResponseDto(Diary diary);

}
