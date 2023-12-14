package com.codemouse.salog.helper;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailSenderResponse { // 이메일 난수 전송
    private boolean isActive;
    private String message;
}
