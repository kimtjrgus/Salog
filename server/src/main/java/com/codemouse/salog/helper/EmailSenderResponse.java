package com.codemouse.salog.helper;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmailSenderResponse { // 이메일 난수 전송
    private boolean isActive;
    private String message;
}
