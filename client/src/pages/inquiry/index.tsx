import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { styled } from "styled-components";
import { type RootState } from "src/store";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "src/store/slices/toastSlice";
import Spinner from "../../assets/Rolling2-1s-21px.gif";

const Inquiry = () => {
  const member = useSelector((state: RootState) => state.persistedReducer.user);

  const [values, setValues] = useState({
    user_email: member?.email,
    ask_title: "",
    ask_message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useRef<HTMLFormElement>(null);
  const dispatch = useDispatch();

  const onChangeValues = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    if (form.current) {
      emailjs
        .send(
          `${process.env.REACT_APP_SERVICE_ID}`,
          `${process.env.REACT_APP_TEMPLATE_ID}`,
          values,
          `${process.env.REACT_APP_PUBLIC_KEY}`
        )
        .then(() => {
          setIsLoading(false);
          form.current?.reset();
          setValues((prev) => {
            return { ...prev, ask_title: "", ask_message: "" };
          });
          dispatch(
            showToast({
              message: "문의 내역이 발송되었습니다.",
              type: "success",
            })
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <FormContainer ref={form} onSubmit={sendEmail}>
      <h3>문의하기</h3>
      <p>문의하고싶은 내용을 작성하시면 이메일로 답변을 전송해드립니다.</p>
      <label>이메일</label>
      <input
        type="email"
        name="user_email"
        value={values.user_email}
        placeholder={values.user_email}
        disabled
      />
      <label>제목</label>
      <input
        type="text"
        name="ask_title"
        placeholder="제목을 입력해주세요"
        value={values.ask_title}
        onChange={onChangeValues}
      />
      <label>내용</label>
      <textarea
        name="ask_message"
        placeholder="내용을 입력해주세요"
        value={values.ask_message}
        onChange={onChangeValues}
      />
      <button type="submit">
        {isLoading ? <img src={Spinner} alt="로딩" /> : "전송"}
      </button>
    </FormContainer>
  );
};

export default Inquiry;

const FormContainer = styled.form`
  width: 90rem;
  height: 80vh;
  margin: 0 auto;
  margin-top: 3rem;
  padding: 3rem 22rem;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25);

  > label {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  > input {
    margin-bottom: 2rem;
    padding: 0 1rem;
    border: 1px solid #b3b3b3;
    border-radius: 6px;
    height: 3.5rem;
  }

  > button {
    height: 3.5rem;
    border: none;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    border-radius: 4px;
    color: white;
    cursor: pointer;

    &.disabled {
      opacity: 0.4;
    }
  }

  > textarea {
    margin-bottom: 2rem;
    border: 1px solid #b3b3b3;
    padding: 1rem;
    resize: none;
    border-radius: 6px;
    height: 15rem;
    outline: none;
  }

  > h3 {
    text-align: center;
    margin-bottom: 1rem;
    color: #000000;
  }

  > p {
    text-align: center;
    font-size: 1.4rem;
    color: #777777;
    margin-bottom: 5rem;
  }
`;
