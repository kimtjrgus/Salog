package com.codemouse.salog.helper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

@Component
public class EmailSender {
    private final JavaMailSender javaMailSender;
    private final String emailSenderPassword;
    private final String emailSenderMan;

    @Autowired
    public EmailSender(JavaMailSender javaMailSender,
                       @Value("${email.sender.man}") String emailSenderMan,
                       @Value("${email.sender.password}") String emailSenderPassword) {
        this.javaMailSender = javaMailSender;
        this.emailSenderPassword = emailSenderPassword;
        this.emailSenderMan = emailSenderMan;
    }

    public void sendVerificationEmail(String to, String verificationCode) throws MessagingException {
        String from = emailSenderMan; // 보내는 사람의 이메일 주소
        String password = emailSenderPassword; // 보내는 사람의 이메일 계정 비밀번호
        String host = "smtp.gmail.com"; // 구글 메일 서버 호스트 이름

        // SMTP 프로토콜 설정
        Properties props = new Properties();
        props.setProperty("mail.smtp.host", host);
        props.setProperty("mail.smtp.port", "587");
        props.setProperty("mail.smtp.auth", "true");
        props.setProperty("mail.smtp.starttls.enable", "true");

        // 보내는 사람 계정 정보 설정
        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(from, password);
            }
        });

        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(from));
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
        msg.setSubject("샐로그 - Email 인증 코드입니다.");

        String content =
                "안녕하세요! 비주얼 가계부 『샐로그』입니다! \n"
                        + "가입해주셔서 감사합니다.\n"
                        + "샐로그 회원가입 인증 코드입니다 : "
                        + verificationCode;
        msg.setText(content);

        // 메일 보내기
        Transport.send(msg);

        System.out.println("Success.");
        System.out.println("Authentication code: " + verificationCode);
    }
}
