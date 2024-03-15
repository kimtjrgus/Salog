import { useState } from "react";
import { styled } from "styled-components";

export interface receiptType {
  outgoName: string;
  date: string;
  money: number;
  receiptImg: string;
}

interface ReceiptModalProps {
  receipt: receiptType;
  children: React.ReactNode;
}

const ReceiptModal = ({ receipt, children }: ReceiptModalProps) => {
  const [values, setValues] = useState<receiptType>({
    outgoName: receipt.outgoName,
    date: receipt.date,
    money: receipt.money,
    receiptImg: receipt.receiptImg,
  });

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "money") {
      // '원'과 컴마를 제거하고 숫자로 변환
      processedValue = value.replace(/원|,/g, "");
    }
    setValues((prev) => {
      return { ...prev, [name]: processedValue };
    });
  };

  return (
    <Container>
      <div className="container__left">
        <img src={receipt.receiptImg} alt="영수증 이미지" />
      </div>
      <ul className="container__right">
        <h4>입력 내용 확인</h4>
        <p>잘못 인식된 내용은 수정할 수 있습니다.</p>
        {Object.entries(values)
          .filter(([key, _]) => key !== "receiptImg")
          .map(([key, value], idx) => {
            return (
              <li className="list" key={idx}>
                <p>
                  {key === "outgoName"
                    ? "거래처"
                    : key === "date"
                      ? "거래일시"
                      : "총 금액"}
                </p>
                <input
                  name={key}
                  type={key === "date" ? "date" : "text"}
                  value={
                    key === "money"
                      ? `${Number(value).toLocaleString()}원`
                      : value
                  }
                  onChange={onChangeValue}
                />
              </li>
            );
          })}
        <div className="buttons">{children}</div>
      </ul>
    </Container>
  );
};

export default ReceiptModal;

const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  width: 70rem;
  height: 50rem;
  background: white;
  border-radius: 4px;
  border: 1px solid gray;
  display: flex;
  gap: 1rem;
  padding: 6rem 2rem;

  .container__left {
    width: 50%;

    > img {
      width: 100%;
      height: 100%;
    }
  }

  .container__right {
    position: relative;
    width: 50%;
    border: 1px solid #dcdcdc;
    padding: 1.5rem;

    > h4 {
      font-size: 1.4rem;
      margin-bottom: 1rem;
    }

    > p {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #797979;
    }
  }

  .list {
    margin-top: 2.5rem;
    display: flex;
    gap: 6rem;
    padding: 0 0.4rem;
    padding-bottom: 0.5rem;
    align-items: center;
    border-bottom: 1px solid #ababab;

    > p {
      font-size: 1.2rem;
      width: 5rem;
    }

    > input {
      cursor: pointer;
      border: none;
      outline: none;
      font-size: 1.2rem;
      font-weight: 500;
    }
  }

  .buttons {
    position: absolute;
    bottom: 2.5rem;
    right: 0;
    width: 100%;
    margin-top: 2rem;
    display: flex;
    gap: 2rem;
    justify-content: center;

    > button {
      padding: 0.8rem 2.5rem;
      border-radius: 4px;
      background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      color: white;
      font-size: 1.2rem;

      &:first-child {
        background-color: white;
        border: 1px solid #cecece;
        color: #000000;
      }
    }
  }
`;
