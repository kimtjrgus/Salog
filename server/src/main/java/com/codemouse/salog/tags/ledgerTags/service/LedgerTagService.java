package com.codemouse.salog.tags.ledgerTags.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class LedgerTagService {
    /* todo 2024-01 전체조회는 없고 수입, 지출 조회시 불려 나가기만 하면 됨
       태그 저장은 수입, 지출 상관없이 "저장 기능"만 있으면 될듯함 -> 어차피 수입,지출 id로 분류됨
       다만 수입, 지출 부를때 같이 조회되게끔 하는 로직을 짜야함 -> n+1 문제가 있을 수도
       그리고 회원 로그아웃 파악은 여기서는 안해도될 듯함 -> 어차피 수입, 지출에서 먼저하기 떄문
    */
}
