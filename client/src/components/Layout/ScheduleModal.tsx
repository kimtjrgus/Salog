import { List } from "src/pages/dashboard/Schedule";
import { api } from "src/utils/refreshToken";
import { styled } from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { showToast } from "src/store/slices/toastSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SvgIcon } from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "src/utils/timeFunc";

interface incomeType {
  [key: string]: any;
  fixedIncomeId: number;
  date: string;
  money: number;
  incomeName: string;
}

interface outgoType {
  [key: string]: any;
  fixedOutgoId: number;
  date: string;
  money: number;
  outgoName: string;
}

interface modalType {
  alarm: boolean;
  schedule: boolean;
  outgo: outgoType[];
  income: incomeType[];
}

interface outgoValueType extends outgoType {
  tag: string;
  payment: string;
}

interface incomeValueType extends incomeType {
  tag: string;
}

// interface outgoValueType {
//   [key: string]: any;
//   fixedOutgoId: number;
//   date: string;
//   money: number;
//   outgoName: string;
//   tag: string;
//   payment: string;
// }

// interface incomeValueType {
//   [key: string]: any;
//   fixedIncomeId: number;
//   date: string;
//   money: number;
//   incomeName: string;
//   tag: string;
// }

interface Props {
  isOpen: modalType;
  setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
}

const ScheduleModal = ({ isOpen, setIsOpen }: Props) => {
  const [outgoValues, setOutgoValues] = useState<outgoValueType[]>(
    isOpen.outgo.map((el) => {
      return { ...el, tag: "", payment: "" };
    })
  );
  const [incomeValues, setIncomeValues] = useState<incomeValueType[]>(
    isOpen.income.map((el) => {
      return { ...el, tag: "" };
    })
  );
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  console.log(isDisabled, outgoValues, incomeValues);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onClickPlus = () => {
    navigate("/dashboard/#input");
  };

  // 모달의 취소 버튼을 누르면
  const onClickCloseBtn = async () => {
    if (isOpen.outgo.length !== 0) {
      try {
        await Promise.all(
          isOpen.outgo.map(async (el) => {
            // 날짜 문자열을 Date 객체로 변환
            const date = new Date(el.date);
            // 월을 하나 추가
            date.setMonth(date.getMonth() + 1);
            // Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
            const dateString = date.toISOString().split("T")[0];

            return await api.patch(`/fixedOutgo/update/${el.fixedOutgoId}`, {
              date: dateString,
              money: Number(el.money),
              outgoName: el.outgoName,
            });
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
    if (isOpen.income.length !== 0) {
      try {
        await Promise.all(
          isOpen.income.map(async (el) => {
            // 날짜 문자열을 Date 객체로 변환
            const date = new Date(el.date);
            // 월을 하나 추가
            date.setMonth(date.getMonth() + 1);
            // Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
            const dateString = date.toISOString().split("T")[0];

            return await api.patch(`/fixedIncome/update/${el.fixedIncomeId}`, {
              date: dateString,
              money: Number(el.money),
              outgoName: el.incomeName,
            });
          })
        );
      } catch (error) {
        console.error(error);
      }
    }

    // 일정을 현재 달 + 1 해야함
    setIsOpen((prev) => {
      return { ...prev, schedule: false };
    });
  };

  const handleOutgoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx: number
  ) => {
    const { name, value } = e.target;
    const updateValues = [...outgoValues];
    updateValues[idx] = { ...updateValues[idx], [name]: value };
    setOutgoValues(updateValues);
  };

  const handleIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx: number
  ) => {
    const { name, value } = e.target;
    const updateValues = [...incomeValues];
    updateValues[idx] = { ...updateValues[idx], [name]: value };
    setIncomeValues(updateValues);
  };

  // 모달의 확인 버튼을 누르면
  const onClickPlusBtn = async () => {
    // 가계부에 추가해야함
    if (outgoValues.length !== 0) {
      try {
        await Promise.all(
          // 400 에러 해결해야함
          outgoValues.map(async (el) => {
            return await api.post("/outgo/post", {
              date: el.date,
              outgoName: el.outgoName,
              money: Number(el.money),
              memo: "고정지출",
              outgoTag: el.tag,
              wasteList: false,
              payment: el.payment,
              receiptImg: "",
            });
          })
        );
        onClickCloseBtn().catch((error) => {
          console.log(error);
        });
      } catch (error) {
        console.error(error);
      }
    }
    if (incomeValues.length !== 0) {
      try {
        await Promise.all(
          incomeValues.map(async (el) => {
            return await api.post("/income/post", {
              date: el.date,
              incomeName: el.incomeName,
              money: Number(el.money),
              memo: "고정수입",
              incomeTag: el.tag,
              receiptImg: "",
            });
          })
        );
        onClickCloseBtn().catch((error) => {
          console.log(error);
        });
      } catch (error) {
        console.error(error);
      }
    }

    dispatch(
      showToast({
        message: "작성이 완료되었습니다",
        type: "success",
      })
    );

    setIsOpen((prev) => {
      return { ...prev, schedule: false };
    });
  };

  const checkValues = useCallback(
    debounce(
      (outgoValues: outgoValueType[], incomeValues: incomeValueType[]) => {
        let isBlank = false;
        let isNotValid = true;

        // 빈 값 체크
        if (outgoValues.length !== 0) {
          outgoValues.forEach((value: outgoValueType) => {
            for (const key in value) {
              if (value[key] === "") {
                isBlank = true;
              }
            }
          });
        }

        if (incomeValues.length !== 0) {
          incomeValues.forEach((value: incomeValueType) => {
            for (const key in value) {
              if (value[key] === "") {
                isBlank = true;
              }
            }
          });
        }

        if (!isBlank) {
          isNotValid = false;
        }

        setIsDisabled(isNotValid);
      },
      700
    ),
    []
  );

  useEffect(() => {
    checkValues(outgoValues, incomeValues);
  }, [outgoValues, incomeValues]);

  return (
    <Background>
      {location.hash !== "#input" ? (
        <Container>
          <div className="main">
            <header>
              <h3>오늘의 금융 일정이 있습니다.</h3>
              <p>
                고정 지출 및 수입 항목을 가계부에
                <br /> 추가하시겠습니까?
              </p>
              <span>
                * 취소를 누르더라도 해당 일정들은 다음 달로 이월됩니다.
              </span>
            </header>
            <div className="schedule">
              {isOpen.outgo.map((el) => {
                return (
                  <List key={uuidv4()} $date={el.date}>
                    <div className="list__day__outgo">
                      {new Date(el.date).getDate()}일
                    </div>
                    <div className="list__write__outgo">
                      <p>{el.outgoName}</p>
                      <p>
                        {el.money.toLocaleString()}원 / <span>지출</span>
                      </p>
                    </div>
                  </List>
                );
              })}
              {isOpen.income.map((el) => {
                return (
                  <List key={uuidv4()} $date={el.date}>
                    <div className="list__day__income">
                      {new Date(el.date).getDate()}일
                    </div>
                    <div className="list__write__income">
                      <p>{el.incomeName}</p>
                      <p>
                        {el.money.toLocaleString()}원 / <span>수입</span>
                      </p>
                    </div>
                  </List>
                );
              })}
            </div>
          </div>
          <div className="buttons">
            <button onClick={onClickCloseBtn}>취소</button>
            <button onClick={onClickPlus}>확인</button>
          </div>
        </Container>
      ) : (
        <Container>
          <div className="main">
            <div className="inputs">
              <h4>아래의 항목을 선택해주세요</h4>
              <div className="category__header">
                <p>거래처</p>
                <p>카테고리</p>
                <p>결제수단</p>
              </div>
              {isOpen.outgo.map((el, idx) => {
                return (
                  <div className="list" key={el.fixedOutgoId}>
                    <p>{el.outgoName}</p>
                    <div className="select">
                      <select
                        className="category__select"
                        name="tag"
                        value={outgoValues[idx]?.tag ?? "선택"}
                        onChange={(e) => {
                          handleOutgoChange(e, idx);
                        }}
                      >
                        <>
                          <option value="">선택</option>
                          <option value="출금">출금</option>
                          <option value="식품">식비</option>
                          <option value="쇼핑">쇼핑</option>
                          <option value="취미">취미</option>
                          <option value="교통">교통</option>
                          <option value="통신">통신</option>
                          <option value="의류">의류</option>
                          <option value="뷰티">뷰티</option>
                          <option value="교육">교육</option>
                          <option value="여행">여행</option>
                        </>
                      </select>
                      <SvgIcon
                        className="arrow__down"
                        component={ArrowDropDownOutlinedIcon}
                        sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                      />
                    </div>
                    <div className="select">
                      <select
                        className="category__select"
                        name="payment"
                        value={outgoValues[idx]?.payment ?? "선택"}
                        onChange={(e) => {
                          handleOutgoChange(e, idx);
                        }}
                      >
                        <>
                          <option value="">선택</option>
                          <option value="현금">현금</option>
                          <option value="카드">카드</option>
                          <option value="이체">이체</option>
                        </>
                      </select>
                      <SvgIcon
                        className="arrow__down"
                        component={ArrowDropDownOutlinedIcon}
                        sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
              {isOpen.income.map((el, idx) => {
                return (
                  <div className="list" key={el.fixedIncomeId}>
                    <p>{el.incomeName}</p>
                    <div className="select">
                      <select
                        className="category__select"
                        name="tag"
                        value={incomeValues[idx]?.tag ?? "선택"}
                        onChange={(e) => {
                          handleIncomeChange(e, idx);
                        }}
                      >
                        <>
                          <option value="">선택</option>
                          <option value="입금">입금</option>
                          <option value="급여">급여</option>
                          <option value="이자">이자</option>
                          <option value="투자">투자</option>
                        </>
                      </select>
                      <SvgIcon
                        className="arrow__down"
                        component={ArrowDropDownOutlinedIcon}
                        sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                      />
                    </div>
                    <div className="select">
                      <select
                        className="category__select"
                        name="payment"
                        value={incomeValues[idx]?.payment ?? "x"}
                      >
                        <option value="">x</option>
                      </select>
                      <SvgIcon
                        className="arrow__down"
                        component={ArrowDropDownOutlinedIcon}
                        sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="schedule">
              {isOpen.outgo.map((el) => {
                return (
                  <List key={uuidv4()} $date={el.date}>
                    <div className="list__day__outgo">
                      {new Date(el.date).getDate()}일
                    </div>
                    <div className="list__write__outgo">
                      <p>{el.outgoName}</p>
                      <p>
                        {el.money.toLocaleString()}원 / <span>지출</span>
                      </p>
                    </div>
                  </List>
                );
              })}
              {isOpen.income.map((el) => {
                return (
                  <List key={uuidv4()} $date={el.date}>
                    <div className="list__day__income">
                      {new Date(el.date).getDate()}일
                    </div>
                    <div className="list__write__income">
                      <p>{el.incomeName}</p>
                      <p>
                        {el.money.toLocaleString()}원 / <span>수입</span>
                      </p>
                    </div>
                  </List>
                );
              })}
            </div>
          </div>
          <div className="buttons">
            <button onClick={onClickCloseBtn}>취소</button>
            <button onClick={onClickPlusBtn} disabled={isDisabled}>
              확인
            </button>
          </div>
        </Container>
      )}
    </Background>
  );
};

export default ScheduleModal;

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
`;

const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 65rem;
  height: 35rem;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 4px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  padding: 4rem 5rem;

  .main {
    display: flex;
    width: 100%;

    .inputs {
      white-space: nowrap;
      margin-right: 8.5rem;

      > h4 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
      }

      .category__header {
        width: 100%;
        padding: 0.8rem 0;
        display: flex;
        align-items: center;
        gap: 1rem;

        p {
          font-size: 1.2rem;
          font-weight: 500;
          color: #474747;

          &:first-child {
            width: 9rem;
          }

          &:nth-child(2) {
            width: 8rem;
          }

          &:nth-child(3) {
            width: 4rem;
          }
        }
      }
    }

    > header {
      width: 50%;
      margin-right: 5rem;

      > h3 {
        font-size: 2rem;
        /* text-align: center; */
        margin-bottom: 3rem;
      }

      > p {
        font-size: 1.5rem;
        margin-bottom: 9rem;
        /* text-align: center; */
        line-height: 2rem;
        font-weight: 500;
        color: #4a4949;
      }

      > span {
        font-size: 1.1rem;
        text-align: center;
        color: ${(props) => props.theme.COLORS.LIGHT_RED};
      }
    }

    .schedule {
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      padding: 0 1rem;
      padding-bottom: 1rem;
      width: 45%;
      height: 20rem;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        width: 3px; /* 스크롤바의 너비 */
        background-color: transparent; /* 스크롤바 배경색을 투명으로 설정 */
      }

      &::-webkit-scrollbar-thumb {
        height: 30%; /* 스크롤바의 길이 */
        background: ${(props) =>
          props.theme.COLORS.LIGHT_BLUE}; /* 스크롤바의 색상 */
      }

      &::-webkit-scrollbar-track {
        background: rgba(33, 122, 244, 0.1); /*스크롤바 뒷 배경 색상*/
      }
    }
  }

  .buttons {
    margin-top: 4rem;
    display: flex;
    gap: 7rem;

    > button {
      font-size: 1.2rem;
      cursor: pointer;
      width: 100%;
      border-radius: 4px;
      padding: 0.8rem 0.5rem;
      color: #6788fe;
      background: #ccd7fe;

      &:first-child {
        background-color: ${(props) => props.theme.COLORS.GRAY_300};
        color: ${(props) => props.theme.COLORS.GRAY_600};
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }
    }
  }

  .list {
    display: flex;
    gap: 1rem;
    align-items: center;

    > p {
      font-size: 1.1rem;
      font-weight: 500;
      color: #474747;

      &:first-child {
        width: 9rem;
      }

      &:nth-child(2) {
        width: 8rem;
      }

      &:nth-child(3) {
        width: 4rem;
      }
    }

    > input {
      font-family: "Pretendard-Regular";
      cursor: pointer;
      font-size: 1.1rem;
      position: relative;
      border: none;
      border-bottom: 1px solid #c9c9c9;
      width: 8rem;
      padding-bottom: 0.3rem;
      color: #616165;
      font-weight: 500;
      outline: none;
    }

    .select {
      display: flex;
      position: relative;

      .arrow__down {
        position: absolute;
        top: 0;
        right: 0;
        margin-bottom: 2rem;
      }
    }
  }

  .category__select {
    cursor: pointer;
    font-size: 1.2rem;
    font-family: "Pretendard-Regular";
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 8rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
    -webkit-appearance: none; /* 크롬 화살표 없애기 */
    -moz-appearance: none; /* 파이어폭스 화살표 없애기 */
    appearance: none; /* 화살표 없애기 */
  }
`;
