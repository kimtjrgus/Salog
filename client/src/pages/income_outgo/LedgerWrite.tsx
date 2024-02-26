import { SvgIcon } from "@mui/material";
import { styled } from "styled-components";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "src/utils/timeFunc";
import { type outgoType, type incomeType, type modalType } from ".";
import { useDispatch } from "react-redux";
import { showToast } from "src/store/slices/toastSlice";
import { api } from "src/utils/refreshToken";
import type moment from "moment";

interface Props {
  setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
  setIncome: React.Dispatch<React.SetStateAction<incomeType[]>>;
  setOutgo: React.Dispatch<React.SetStateAction<outgoType[]>>;
  getMoment: moment.Moment;
}

// type valuesType = Record<string, Record<string, string>>;

interface valueType {
  [key: string]: any;
  division: string;
  date: string;
  tag: string;
  name: string;
  payment: string;
  money: string;
  memo: string;
}

interface valuesType {
  [key: string]: any;
  id: number;
  division: string;
  date: string;
  tag: string;
  name: string;
  payment: string;
  money: string;
  memo: string;
}

const LedgerWrite = ({ setIsOpen, setIncome, setOutgo, getMoment }: Props) => {
  const [values, setValues] = useState<valuesType[]>([
    {
      id: 1,
      division: "",
      date: "",
      tag: "",
      name: "",
      payment: "",
      money: "",
      memo: "",
    },
  ]);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const dispatch = useDispatch();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    id: number
  ) => {
    const { name, value } = e.target;
    const updatedValues = values.map((item) => {
      if (item.id === id) {
        // value.division이 변경되었을 때 value.tag를 ""로 설정
        if (name === "division") {
          return {
            ...item,
            [name]: value,
            tag: "", // value.tag를 빈 문자열("")로 설정
            payment: "",
          };
        } else {
          return {
            ...item,
            [name]: value,
          };
        }
      }
      return item;
    });

    setValues(updatedValues);
  };
  const onClickPlusBtn = () => {
    const initialValues: valueType = {
      division: "",
      date: "",
      tag: "",
      name: "",
      payment: "",
      money: "",
      memo: "",
    };

    const newRow = {
      id: values.length !== 0 ? values[values.length - 1].id + 1 : 1,
      ...initialValues,
    };
    setValues((prevValues) => [...prevValues, newRow]);
  };

  const handleDeleteList = (id: number) => {
    const filter = values.filter((row) => row.id !== id);
    setValues([...filter]);
    // setValues((prevValues) => {
    // 	const { [id]: deletedValue, ...updatedValues } = prevValues;
    // 	return updatedValues;
    // });
  };

  const checkValues = useCallback(
    debounce((values: valuesType) => {
      let isBlank = false;
      let isNotValid = true;

      // 빈 값 체크
      values.forEach((value: valueType) => {
        for (const key in value) {
          if (value[key] === "") {
            if (key === "payment" && value.division === "income") {
              continue;
            }
            // 메모는 null 가능
            if (key === "memo" && value.memo === "") {
              continue;
            }
            isBlank = true;
          }
          if (key === "money" && value[key] === "0") isBlank = true;
        }
      });

      if (!isBlank) {
        isNotValid = false;
      }

      if (values.length === 0) {
        isNotValid = true;
      }

      setIsDisabled(isNotValid);
    }, 700),
    []
  );

  const onClickSubmit = async () => {
    try {
      await Promise.all(
        values.map(async (value) => {
          if (value.division === "outgo") {
            const res = await api.post("/outgo/post", {
              date: value.date,
              outgoName: value.name,
              money: Number(value.money),
              memo: value.memo,
              outgoTag: value.tag,
              wasteList: false,
              payment: value.payment,
              receiptImg: "",
            });

            console.log(res.data);
            if (
              new Date(res.data.date).getFullYear() ===
                new Date(getMoment.format("YYYY-MM-DD")).getFullYear() &&
              new Date(res.data.date).getMonth() + 1 ===
                new Date(getMoment.format("YYYY-MM-DD")).getMonth() + 1
            ) {
              setOutgo((prev: outgoType[]) => {
                return [...prev, res.data];
              });
            }
          } else {
            const res = await api.post("/income/post", {
              date: value.date,
              incomeName: value.name,
              money: Number(value.money),
              memo: value.memo,
              incomeTag: value.tag,
              receiptImg: "",
            });

            console.log(res.data);
            if (
              new Date(res.data.date).getFullYear() ===
                new Date(getMoment.format("YYYY-MM-DD")).getFullYear() &&
              new Date(res.data.date).getMonth() + 1 ===
                new Date(getMoment.format("YYYY-MM-DD")).getMonth() + 1
            ) {
              setIncome((prev: incomeType[]) => {
                return [...prev, res.data];
              });
            }
          }
        })
      );

      setIsOpen((prev) => {
        const updated = { ...prev };
        return { ...updated, writeModal: false };
      });
      dispatch(
        showToast({ message: "작성이 완료되었습니다", type: "success" })
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkValues(values);
  }, [values]);

  return (
    <Background>
      <Container>
        <SvgIcon
          className="deleteIcon"
          component={ClearOutlinedIcon}
          onClick={() => {
            setIsOpen((prev) => {
              const updated = { ...prev };
              return { ...updated, writeModal: false };
            });
          }}
          sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
        />
        <div className="header">
          <h3>가계부 작성하기</h3>
          <button>영수증 업로드</button>
        </div>
        <div className="category__header">
          <p>분류</p>
          <p>날짜</p>
          <p>카테고리</p>
          <p>거래처</p>
          <p>결제수단</p>
          <p>금액</p>
          <p>메모</p>
        </div>
        <Lists>
          {values.map((value, idx) => {
            return (
              <li className="list" key={value.id}>
                <div className="select">
                  <select
                    className="category__select"
                    name="division"
                    onChange={(e) => {
                      handleInputChange(e, value.id);
                    }}
                  >
                    <option value="">선택</option>
                    <option value="outgo">지출</option>
                    <option value="income">수입</option>
                  </select>
                  <SvgIcon
                    className="arrow__down"
                    component={ArrowDropDownOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                </div>
                <input
                  type="date"
                  className="date__select"
                  name="date"
                  value={value.date}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                />
                <div className="select">
                  <select
                    className="category__select"
                    // name={
                    // 	values[value.id]?.division === "outgo"
                    // 		? "outgoTag"
                    // 		: "incomeTag"
                    // }
                    name="tag"
                    value={value.tag}
                    onChange={(e) => {
                      handleInputChange(e, value.id);
                    }}
                  >
                    {value.division === "outgo" ? (
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
                    ) : value.division === "income" ? (
                      <>
                        <option value="">선택</option>
                        <option value="입금">입금</option>
                        <option value="급여">급여</option>
                        <option value="이자">이자</option>
                        <option value="투자">투자</option>
                      </>
                    ) : (
                      <option value="">-</option>
                    )}
                    {/* {value.division === "outgo" ? (
                      <>
                        <option value="">선택</option>
                        <option value="출금">💰 출금</option>
                        <option value="식품">🍚 식비</option>
                        <option value="쇼핑">🛒 쇼핑</option>
                        <option value="취미">🕹️ 취미</option>
                        <option value="교통">🚗 교통</option>
                        <option value="통신">🛜 통신</option>
                        <option value="의류">👕 의류</option>
                        <option value="뷰티">💄 뷰티</option>
                        <option value="교육">📚 교육</option>
                        <option value="여행">✈️ 여행</option>
                      </>
                    ) : value.division === "income" ? (
                      <>
                        <option value="">선택</option>
                        <option value="입금">💰 입금</option>
                        <option value="급여">💸 급여</option>
                        <option value="이자">🏦 이자</option>
                        <option value="투자">📈 투자</option>
                      </>
                    ) : (
                      <option value="">-</option>
                    )} */}
                  </select>
                  <SvgIcon
                    className="arrow__down"
                    component={ArrowDropDownOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                </div>
                <input
                  type="text"
                  className="account__name"
                  name="name"
                  value={value.name}
                  maxLength={15}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                />
                <div className="select">
                  <select
                    className="category__select"
                    name="payment"
                    value={value.payment}
                    onChange={(e) => {
                      handleInputChange(e, value.id);
                    }}
                  >
                    {value.division === "outgo" ? (
                      <>
                        <option value="">선택</option>
                        <option value="현금">현금</option>
                        <option value="카드">카드</option>
                        <option value="이체">이체</option>
                      </>
                    ) : value.division === "income" ? (
                      <option value="">x</option>
                    ) : (
                      <option value="">-</option>
                    )}
                  </select>
                  <SvgIcon
                    className="arrow__down"
                    component={ArrowDropDownOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                </div>
                <input
                  className="account__name"
                  value={values[idx].money}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                  name="money"
                  type="number"
                />
                <input
                  type="text"
                  className="memo"
                  name="memo"
                  value={value.memo}
                  maxLength={20}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                />
                <SvgIcon
                  className="list__delete"
                  component={ClearOutlinedIcon}
                  sx={{ stroke: "#ffffff", strokeWidth: 0.8 }}
                  onClick={() => {
                    handleDeleteList(value.id);
                  }}
                />
              </li>
            );
          })}
        </Lists>
        <div className="row__plus" onClick={onClickPlusBtn}>
          <SvgIcon
            className="list__delete"
            component={AddCircleOutlineOutlinedIcon}
            sx={{ stroke: "#ffffff", strokeWidth: 0.8 }}
          />
          <p>행 추가</p>
        </div>
        <button disabled={isDisabled} onClick={onClickSubmit}>
          작성 완료
        </button>
      </Container>
    </Background>
  );
};

export default LedgerWrite;

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 150;
  position: fixed;
  top: 0;
  left: 0;
`;

const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 4rem 6rem;
  z-index: 100;
  width: 95rem;
  height: 55rem;
  background: white;
  border-radius: 4px;
  border: 1px solid gray;

  .deleteIcon {
    cursor: pointer;
    font-size: 2.6rem;
    color: gray;
    position: absolute;
    right: 2rem;
    top: 2rem;
  }

  .header {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;

    h3 {
      font-size: 2.2rem;
      color: #464656;
    }

    button {
      font-size: 1.2rem;
      padding: 0.8rem 2rem;
      border-radius: 4px;
      color: white;
      background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }

  .category__header {
    width: 100%;
    margin-top: 2rem;
    padding: 0.8rem 0;
    display: flex;
    align-items: center;
    gap: 2rem;

    p {
      font-size: 1.4rem;
      color: #474747;

      &:first-child {
        width: 7rem;
      }

      &:nth-child(2) {
        width: 11rem;
      }

      &:nth-child(3) {
        width: 7rem;
      }

      &:nth-child(4) {
        width: 10rem;
      }

      &:nth-child(5) {
        width: 7rem;
      }

      &:nth-child(6) {
        width: 10rem;
      }
    }
  }

  .row__plus {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #464656;
    gap: 0.7rem;
    position: fixed;
    bottom: 10rem;
    left: 6rem;

    p {
      font-size: 1.4rem;
    }

    > svg {
      font-size: 2.2rem;
    }
  }

  > button {
    position: absolute;
    bottom: 4rem;
    width: 87%;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    color: white;
    border-radius: 4px;
    padding: 1rem;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  /* input[type="date"]::before {
		content: attr(data-placeholder);
		width: 100%;
	} */
`;

const Lists = styled.ul`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  max-height: 24rem;

  .list {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;

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
    width: 7rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
    -webkit-appearance: none; /* 크롬 화살표 없애기 */
    -moz-appearance: none; /* 파이어폭스 화살표 없애기 */
    appearance: none; /* 화살표 없애기 */
  }

  .date__select {
    font-family: "Pretendard-Regular";
    cursor: pointer;
    font-size: 1.1rem;
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 11rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
  }

  .account__name {
    font-size: 1.2rem;
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 10rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
  }

  .memo {
    font-size: 1.2rem;
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 12rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
  }

  .list__delete {
    cursor: pointer;
    font-size: 2.4rem;
    color: #c9c9c9;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
