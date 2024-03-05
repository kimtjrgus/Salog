package com.codemouse.salog.helper.naverOcr;

import lombok.AllArgsConstructor;
import lombok.Getter;

/*
ocrDto를 따로 생성하고 ocrDto로 받은것을 outgoDto에 옮겨담아줄 것
WHY? outgo와 ocr 클래스간의 결합도를 낮추기 위함.
 */
@AllArgsConstructor
@Getter
public class ClovaOcrDto {
    private String date;
    private int totalPrice;
    private String storeInfo;
}