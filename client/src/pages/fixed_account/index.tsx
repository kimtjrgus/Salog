import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import Toast, { ToastType } from "src/components/Layout/Toast";
import { hideToast, showToast } from "src/store/slices/toastSlice";
import { debounce } from "src/utils/timeFunc";
import { styled } from "styled-components";
import { type RootState } from "src/store";
import { api } from "src/utils/refreshToken";

interface valuesType {
  [key: string]: any;
  division: string;
  date: string;
  name: string;
  money: string;
}

interface incomeType {
  fixedIncomeId: number;
  date: string;
  money: number;
  incomeName: string;
}

interface outgoType {
  fixedOutgoId: number;
  date: string;
  money: number;
  outgoName: string;
}

const Fixed = () => {
  const [values, setValues] = useState<valuesType>({
    division: "",
    date: "",
    name: "",
    money: "0",
  });

  const [updateValues, setUpdateValues] = useState<valuesType>({
    id: 0,
    division: "",
    date: "",
    name: "",
    money: "0",
  });

  const [fixedIncome, setFixedIncome] = useState<incomeType[]>([]);
  const [fixedOutgo, setFixedOutgo] = useState<outgoType[]>([]);

  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [outgoActiveItemId, setOutgoActiveItemId] = useState<number | null>(
    null
  );
  const [incomeActiveItemId, setIncomeActiveItemId] = useState<number | null>(
    null
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [deleteValue, setDeleteValue] = useState<{ id: number; type: string }>({
    id: 0,
    type: "",
  });

  const dispatch = useDispatch();
  const modal = useSelector((state: RootState) => state.persistedReducer.toast);

  const onClickUpdateList = (id: number, type: string) => {
    const active =
      type === "outgo"
        ? fixedOutgo.filter((el) => el.fixedOutgoId === id)[0]
        : fixedIncome.filter((el) => el.fixedIncomeId === id)[0];

    // active 상태 저장
    if (type === "outgo") {
      setOutgoActiveItemId(id);
      setIncomeActiveItemId(null);
      setUpdateValues({
        id,
        division: type,
        date: active.date,
        name: (active as outgoType).outgoName, // 타입 단언을 사용하여 outgoType으로 형변환
        money: active.money.toString(),
      });
    } else if (type === "income") {
      setIncomeActiveItemId(id);
      setOutgoActiveItemId(null);
      setUpdateValues({
        id,
        division: type,
        date: active.date,
        name: (active as incomeType).incomeName, // 타입 단언을 사용하여 incomeType으로 형변환
        money: active.money.toString(),
      });
    }
  };

  const onChangeDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const day = e.target.value;
    // 현재 날짜를 가져옵니다.
    const currentDate = new Date();
    // "day" 값을 이용하여 이번 달의 날짜를 가진 "date" 변수를 생성합니다.
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      parseInt(day) + 1
    );

    // 빈 값이 아닌지 검사

    if (location.pathname === "/fixed__account") {
      if (isNaN(date.getTime())) {
        setValues({ ...values, date: "" });
      } else {
        // "date" 변수를 원하는 형식인 "YYYY-MM-DD"로 변환합니다.
        const formattedDate = date.toISOString().split("T")[0];
        setValues({ ...values, date: formattedDate });
      }
    } else {
      if (isNaN(date.getTime())) {
        setUpdateValues({ ...updateValues, date: "" });
      } else {
        // "date" 변수를 원하는 형식인 "YYYY-MM-DD"로 변환합니다.
        const formattedDate = date.toISOString().split("T")[0];
        setUpdateValues({ ...updateValues, date: formattedDate });
      }
    }
  };

  const onChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    location.pathname === "/fixed__account"
      ? setValues({ ...values, division: e.target.value })
      : setUpdateValues({ ...updateValues, division: e.target.value });
  };

  const onChangeMoney = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (location.pathname === "/fixed__account") {
      if (inputValue.startsWith("0")) {
        setValues({ ...values, money: inputValue.substring(1) });
      } else {
        setValues({ ...values, money: inputValue });
      }
    } else {
      if (inputValue.startsWith("0")) {
        setUpdateValues({ ...updateValues, money: inputValue.substring(1) });
      } else {
        setUpdateValues({ ...updateValues, money: inputValue });
      }
    }
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    location.pathname === "/fixed__account"
      ? setValues({ ...values, name: e.target.value })
      : setUpdateValues({ ...updateValues, name: e.target.value });
  };

  const handleClickSubmitBtn = () => {
    if (values.division === "outgo") {
      api
        .post("/fixedOutgo/post", {
          date: values.date,
          money: Number(values.money),
          outgoName: values.name,
        })
        .then((res) => {
          setFixedOutgo([...fixedOutgo, res.data]);
          setValues({
            division: "",
            date: "",
            name: "",
            money: "0",
          });

          dispatch(
            showToast({
              message: "작성이 완료되었습니다",
              type: "success",
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      api
        .post("/fixedIncome/post", {
          date: values.date,
          money: Number(values.money),
          incomeName: values.name,
        })
        .then((res) => {
          setFixedIncome([...fixedIncome, res.data]);
          setValues({
            division: "",
            date: "",
            name: "",
            money: "0",
          });
          dispatch(
            showToast({
              message: "작성이 완료되었습니다",
              type: "success",
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleClickUpdateBtn = () => {
    if (updateValues.division === "outgo") {
      api
        .patch(`/fixedOutgo/update/${updateValues.id}`, {
          date: updateValues.date,
          money: Number(updateValues.money),
          outgoName: updateValues.name,
        })
        .then((res) => {
          setFixedOutgo((prevData) => {
            const newData = prevData.map((item) => {
              if (item.fixedOutgoId === updateValues.id) {
                return res.data;
              }
              return item;
            });
            return newData;
          });
          dispatch(
            showToast({ message: "수정이 완료되었습니다", type: "success" })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      api
        .patch(`/fixedIncome/update/${updateValues.id}`, {
          date: updateValues.date,
          money: Number(updateValues.money),
          incomeName: updateValues.name,
        })
        .then((res) => {
          setFixedIncome((prevData) => {
            const newData = prevData.map((item) => {
              if (item.fixedIncomeId === updateValues.id) {
                return res.data;
              }
              return item;
            });
            return newData;
          });
          dispatch(
            showToast({
              message: "수정이 완료되었습니다",
              type: "success",
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleDeleteList = () => {
    if (deleteValue.type === "outgo") {
      api
        .delete(`/fixedOutgo/delete/${deleteValue.id}`)
        .then(() => {
          setFixedOutgo((prevData) => {
            const data = prevData.filter((el) => {
              return el.fixedOutgoId !== deleteValue.id;
            });
            return data;
          });
          setUpdateValues({
            id: 0,
            division: "",
            date: "",
            name: "",
            money: "0",
          });
          setIsOpen(false);
          dispatch(
            showToast({
              message: "삭제가 완료되었습니다",
              type: "success",
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      axios
        .delete(`/fixedIncome/delete/${deleteValue.id}`)
        .then(() => {
          setFixedIncome((prevData) => {
            const data = prevData.filter((el) => {
              return el.fixedIncomeId !== deleteValue.id;
            });
            return data;
          });
          setUpdateValues({
            id: 0,
            division: "",
            date: "",
            name: "",
            money: "0",
          });
          setIsOpen(false);
          dispatch(
            showToast({
              message: "삭제가 완료되었습니다",
              type: "success",
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const checkValues = useCallback(
    debounce((values: valuesType) => {
      const keys = Object.keys(values);
      let isBlank = false;
      let isNotValid = true;

      // 빈 값 체크
      for (const key of keys) {
        if (values[key] === "" || values[key] === "0") {
          isBlank = true;
          // return null; // 값을 반환합니다.
        }
      }

      if (!isBlank) {
        isNotValid = false;
      }

      setIsDisabled(isNotValid);
    }, 700),
    []
  );

  useEffect(() => {
    api
      .get("/fixedOutgo/get?page=1&size=10&date=2024-01-00")
      .then((res) => {
        setFixedOutgo(res.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
    api
      .get(`/fixedIncome/get?page=1&size=10&date=2024-01-00`)
      .then((res) => {
        setFixedIncome(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    location.pathname === "/fixed__account"
      ? checkValues(values)
      : checkValues(updateValues);
  }, [values, updateValues]);

  useEffect(() => {
    if (location.pathname === "/fixed__account/update") {
      setValues({
        division: "",
        date: "",
        name: "",
        money: "0",
      });
    }
    if (location.pathname === "/fixed__account") {
      setUpdateValues({
        id: 0,
        division: "",
        date: "",
        name: "",
        money: "0",
      });
      setOutgoActiveItemId(null);
      setIncomeActiveItemId(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    // 전역상태를 이용한 토스트 창 띄우기
    setTimeout(() => {
      if (modal.visible) {
        Toast(ToastType.success, modal.message);
        dispatch(hideToast());
      }
    }, 100);
  }, [modal, dispatch]);

  return (
    <>
      <Container>
        <h3>금융 일정 관리</h3>
        <p className="subtitle">
          매 달 발생하는 고정 지출 · 수입을 작성하여 효과적으로 관리해보세요!
        </p>
        <div className="tab">
          <NavStyle to={"/fixed__account"} end>
            금융 일정 추가
          </NavStyle>
          <NavStyle to={"/fixed__account/update"}>금융 일정 수정</NavStyle>
        </div>
        <hr />
        {location.pathname === "/fixed__account" ? (
          <Main>
            <InputContainer>
              <p className="day">날짜</p>
              <div className="day__input">
                <p>매 달</p>
                <input
                  type="text"
                  value={new Date(values.date).getDate() || ""}
                  onChange={onChangeDay}
                  pattern="[0-9]{1,2}"
                  maxLength={2}
                />
                <p>일</p>
              </div>
              <p className="day">분류</p>
              <div className="buttons">
                <div className="form_radio_btn">
                  <input
                    id="outgo"
                    type="radio"
                    name="division"
                    value="outgo"
                    onChange={onChangeLabel}
                    checked={values.division === "outgo"} // division이 "outgo"인 경우 defaultChecked 속성 추가
                  />
                  <label htmlFor="outgo">지출</label>
                </div>
                <div className="form_radio_btn">
                  <input
                    id="income"
                    type="radio"
                    name="division"
                    value="income"
                    onChange={onChangeLabel}
                    checked={values.division === "income"} // division이 "income"인 경우 defaultChecked 속성 추가
                  />
                  <label htmlFor="income">수입</label>
                </div>
              </div>
              <p className="day">일정 이름</p>
              <input
                type="text"
                className="name__input"
                value={values.name}
                onChange={onChangeName}
              />
              <p className="day">금액</p>
              <input
                type="number"
                className="name__input"
                value={values.money || "0"}
                size={16}
                onChange={onChangeMoney}
              />
              <button disabled={isDisabled} onClick={handleClickSubmitBtn}>
                금융 일정 추가하기
              </button>
            </InputContainer>
            <ListContainer>
              <h4>금융 일정 목록</h4>
              <div className="lists">
                {fixedOutgo.length === 0 && fixedIncome.length === 0 ? (
                  <ListNullContainer>
                    <p>현재 등록된 금융 일정이 없습니다.</p>
                    <p>
                      금융 일정을 등록하여 정기적인 지출 ∙ 수입을 관리해보세요!
                    </p>
                  </ListNullContainer>
                ) : (
                  <>
                    <ul className="outgo__lists">
                      <h5>지출</h5>
                      <div className="list__div">
                        {fixedOutgo.map((el) => (
                          <List key={el.fixedOutgoId} $date={el.date}>
                            <div className="list__day__outgo">
                              {new Date(el.date).getDate()}일
                            </div>
                            <div className="list__write__outgo">
                              <p>{el.outgoName}</p>
                              <p>
                                {el.money.toLocaleString()}원 /{" "}
                                <span>지출</span>
                              </p>
                            </div>
                          </List>
                        ))}
                      </div>
                      <div className="explanation">
                        <div className="explanation__list">
                          <div className="red"></div>
                          <p>지출 일정이 3일 미만 남음</p>
                        </div>
                        <div className="explanation__list">
                          <div className="yellow"></div>
                          <p>지출 일정이 일주일 미만 남음</p>
                        </div>
                        <div className="explanation__list">
                          <div className="green"></div>
                          <p>지출 일정이 일주일 이상 남음</p>
                        </div>
                      </div>
                    </ul>
                    <ul className="outgo__lists">
                      <h5>수입</h5>
                      <div className="list__div">
                        {fixedIncome.map((el) => (
                          <List key={el.fixedIncomeId} $date={el.date}>
                            <div className="list__day__income">
                              {new Date(el.date).getDate()}일
                            </div>
                            <div className="list__write__income">
                              <p>{el.incomeName}</p>
                              <p>
                                {el.money.toLocaleString()}원 /{" "}
                                <span>수입</span>
                              </p>
                            </div>
                          </List>
                        ))}
                      </div>
                    </ul>
                  </>
                )}
              </div>
            </ListContainer>
          </Main>
        ) : (
          <Main>
            {updateValues.date !== "" ||
            updateValues.division !== "" ||
            updateValues.money !== "0" ||
            updateValues.name !== "" ? (
              <InputContainer>
                <p className="day">날짜</p>
                <div className="day__input">
                  <p>매 달</p>
                  <input
                    type="text"
                    value={new Date(updateValues.date).getDate() || ""}
                    onChange={onChangeDay}
                    pattern="[0-9]{1,2}"
                    maxLength={2}
                  />
                  <p>일</p>
                </div>
                <p className="day">분류</p>
                <div className="buttons">
                  <div className="form_radio_btn">
                    <input
                      id="outgo"
                      type="radio"
                      name="division"
                      value="outgo"
                      onChange={onChangeLabel}
                      checked={updateValues.division === "outgo"} // division이 "outgo"인 경우 defaultChecked 속성 추가
                    />
                    <label htmlFor="outgo">지출</label>
                  </div>
                  <div className="form_radio_btn">
                    <input
                      id="income"
                      type="radio"
                      name="division"
                      value="income"
                      onChange={onChangeLabel}
                      checked={updateValues.division === "income"} // division이 "income"인 경우 defaultChecked 속성 추가
                    />
                    <label htmlFor="income">수입</label>
                  </div>
                </div>
                <p className="day">일정 이름</p>
                <input
                  type="text"
                  className="name__input"
                  value={updateValues.name}
                  onChange={onChangeName}
                />
                <p className="day">금액</p>
                <input
                  type="number"
                  className="name__input"
                  value={updateValues.money || "0"}
                  size={16}
                  onChange={onChangeMoney}
                />
                <button disabled={isDisabled} onClick={handleClickUpdateBtn}>
                  금융 일정 수정하기
                </button>
              </InputContainer>
            ) : (
              <NullContainer>
                <p>수정하고싶은 일정을 선택하세요!</p>
              </NullContainer>
            )}
            <ListContainer>
              <h4>금융 일정 목록</h4>
              <div className="lists">
                {fixedOutgo.length === 0 && fixedIncome.length === 0 ? (
                  <ListNullContainer>
                    <p>현재 등록된 금융 일정이 없습니다.</p>
                    <p>
                      금융 일정을 등록하여 정기적인 지출 ∙ 수입을 관리해보세요!
                    </p>
                  </ListNullContainer>
                ) : (
                  <>
                    <ul className="outgo__lists__update">
                      {fixedOutgo.map((el) => (
                        <UpdateList
                          key={el.fixedOutgoId}
                          className={
                            outgoActiveItemId === el.fixedOutgoId
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            onClickUpdateList(el.fixedOutgoId, "outgo");
                          }}
                        >
                          <div className="list__day__income">
                            {new Date(el.date).getDate()}일
                          </div>
                          <div className="list__write__outgo">
                            <p>{el.outgoName}</p>
                            <p>
                              {el.money.toLocaleString()}원 / <span>지출</span>
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteValue({
                                id: el.fixedOutgoId,
                                type: "outgo",
                              });
                              setIsOpen(true);
                            }}
                          >
                            삭제하기
                          </button>
                        </UpdateList>
                      ))}
                    </ul>
                    <ul className="outgo__lists__update">
                      {fixedIncome.map((el) => (
                        <UpdateList
                          key={el.fixedIncomeId}
                          className={
                            incomeActiveItemId === el.fixedIncomeId
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            onClickUpdateList(el.fixedIncomeId, "income");
                          }}
                        >
                          <div className="list__day__income">
                            {new Date(el.date).getDate()}일
                          </div>
                          <div className="list__write__income">
                            <p>{el.incomeName}</p>
                            <p>
                              {el.money.toLocaleString()}원 / <span>수입</span>
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteValue({
                                id: el.fixedIncomeId,
                                type: "income",
                              });
                              setIsOpen(true);
                            }}
                          >
                            삭제하기
                          </button>
                        </UpdateList>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </ListContainer>
          </Main>
        )}
      </Container>
      {isOpen && (
        <DeleteModal>
          <div className="msg__box">
            <h4>금융 일정 삭제</h4>
            <p>정말 삭제하시겠습니까?</p>
            <div className="buttons">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setDeleteValue({
                    id: 0,
                    type: "",
                  });
                }}
              >
                취소
              </button>
              <button onClick={handleDeleteList}>확인</button>
            </div>
          </div>
        </DeleteModal>
      )}
    </>
  );
};

export default Fixed;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 3rem 8rem;

  h3 {
    font-size: 2.2rem;
    color: #464656;
    margin-bottom: 1rem;
  }

  .subtitle {
    font-size: 1.4rem;
    color: #7c7c7c;
    margin-bottom: 5rem;
  }

  .tab {
    display: flex;
    gap: 2rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: #c0bebe;
  }

  hr {
    border: none;
    margin-top: 0;
    margin-bottom: 0;
    width: 100%;
    height: 1px;
    background: #dbd8d8;
  }
`;

const NavStyle = styled(NavLink)<{ $isActive: boolean }>`
  cursor: pointer;
  padding: 0.7rem 0.3rem;

  &.active {
    color: #0d0d0d;
    border-bottom: 3px solid black;
  }
`;

const Main = styled.div`
  display: flex;
  margin-top: 2rem;
`;

const InputContainer = styled.div`
  position: relative;
  width: 25rem;
  height: 40rem;
  padding: 2rem 3rem;
  margin-right: 5rem;
  background: #efefef;
  border-radius: 8px;

  p {
    font-size: 1.3rem;
  }

  .day {
    color: #5f5b5b;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .day__input {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    p {
      color: #5f5b5b;
      font-size: 1.2rem;
    }

    input {
      border: 1px solid #b3b3b3;
      border-radius: 4px;
      width: 5rem;
      height: 2.5rem;
      padding: 0.5rem;
      color: #5f5b5b;
      font-size: 1.2rem;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    margin-bottom: 3rem;

    input {
      display: none;
    }

    label {
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 500;
      border-radius: 6px;
      background: white;
      padding: 0.5rem 1.7rem;
      border: 0.15rem solid #c9c9c9;
      color: rgb(144, 144, 160);
    }

    .form_radio_btn input[type="radio"]:checked + label {
      border: 0.2rem solid rgb(119, 152, 252);
      color: rgb(119, 152, 252);
    }
  }

  .name__input {
    width: 100%;
    border: 1px solid #b3b3b3;
    border-radius: 4px;
    padding: 0.5rem;
    color: #5f5b5b;
    font-size: 1.2rem;
  }

  button {
    margin-top: 4rem;
    font-size: 1.2rem;
    cursor: pointer;
    width: 100%;
    border-radius: 4px;
    padding: 0.8rem 0.5rem;
    color: #6788fe;
    background: #ccd7fe;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
`;

const NullContainer = styled.div`
  position: relative;
  width: 25rem;
  height: 40rem;
  padding: 2rem 3rem;
  margin-right: 5rem;
  background: #efefef;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    font-size: 1.2rem;
    color: rgb(144, 144, 160);
  }
`;

const ListContainer = styled.div`
  width: 55rem;
  border-left: 1px solid #dbd8d8;
  padding: 0 4rem;

  h4 {
    font-size: 1.3rem;
    color: #5f5b5b;
  }

  .lists {
    display: flex;
  }

  .outgo__lists {
    position: relative;
    height: 27rem;
    display: flex;
    flex-direction: column;
    margin-top: 3rem;
    margin-right: 4rem;

    h5 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .list__div {
      height: 23rem;
      overflow-y: scroll;
      -ms-overflow-style: none; /* 인터넷 익스플로러 */
      scrollbar-width: none; /* 파이어폭스 */

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .explanation {
      position: absolute;
      bottom: -8.7rem;
      width: 18rem;
      background: #efefef;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      padding-top: 1.4rem;

      .explanation__list {
        margin-bottom: 0.7rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .red {
        margin-left: 1.2rem;
        border-radius: 50%;
        width: 9px;
        height: 9px;
        background: ${(props) => props.theme.COLORS.LIGHT_RED};
      }

      .yellow {
        margin-left: 1.2rem;
        border-radius: 50%;
        width: 9px;
        height: 9px;
        background: ${(props) => props.theme.COLORS.LIGHT_YELLOW};
      }

      .green {
        margin-left: 1.2rem;
        border-radius: 50%;
        width: 9px;
        height: 9px;
        background: ${(props) => props.theme.COLORS.LIGHT_GREEN};
      }

      p {
        font-size: 1.1rem;
        color: #545151;
      }
    }
  }

  .outgo__lists__update {
    position: relative;
    height: 35rem;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    margin-right: 4rem;

     -ms-overflow-style: none; /* 인터넷 익스플로러 */
      scrollbar-width: none; /* 파이어폭스 */

      &::-webkit-scrollbar {
        display: none;
      }

    h5 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .list__div {
      height: 23rem;
      overflow-y: scroll;
      -ms-overflow-style: none; /* 인터넷 익스플로러 */
      scrollbar-width: none; /* 파이어폭스 */

      &::-webkit-scrollbar {
        display: none;
      }
    }

      p {
        font-size: 1.1rem;
        color: #545151;
      }
    }
  }
`;

const List = styled.div<{ $date: string }>`
  display: flex;
  margin-top: 1.2rem;
  align-items: center;

  .list__day__outgo {
    width: 50px;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem 2.5rem;
    background: ${(props) =>
      new Date(props.$date).getDate() - new Date().getDate() < 0 ||
      new Date(props.$date).getDate() - new Date().getDate() >= 7
        ? props.theme.COLORS.LIGHT_GREEN
        : new Date(props.$date).getDate() - new Date().getDate() < 3
          ? props.theme.COLORS.LIGHT_RED
          : props.theme.COLORS.LIGHT_YELLOW};
    border-radius: 8px;
    color: #fff;
    font-size: 1.2rem;
    white-space: nowrap;
    margin-right: 1.2rem;
  }

  .list__day__income {
    width: 50px;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem 2.5rem;
    background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    border-radius: 8px;
    color: #fff;
    font-size: 1.2rem;
    white-space: nowrap;
    margin-right: 1.2rem;
  }

  .list__write__outgo {
    display: flex;
    flex-direction: column;
    line-height: 20px;

    p {
      font-size: 1.4rem;
      &:last-child {
        color: gray;
        font-size: 1.1rem;
      }
    }

    span {
      color: ${(props) => props.theme.COLORS.LIGHT_RED};
    }
  }

  .list__write__income {
    display: flex;
    flex-direction: column;
    line-height: 20px;

    p {
      font-size: 1.4rem;
      &:last-child {
        color: gray;
        font-size: 1.1rem;
      }
    }

    span {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }
`;

const UpdateList = styled.div`
  cursor: pointer;
  position: relative;
  display: flex;
  margin-top: 1.2rem;
  align-items: center;
  background: #e8e8ea;
  padding: 1rem 1.2rem;
  padding-right: 5rem;
  border-radius: 8px;

  .list__day__income {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2.2rem;
    background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    border-radius: 6px;
    color: #fff;
    font-size: 1.2rem;
    white-space: nowrap;
    margin-right: 1.2rem;
  }

  .list__write__outgo {
    display: flex;
    flex-direction: column;
    height: 38px;

    p {
      font-size: 1.2rem;
      white-space: nowrap;

      &:last-child {
        color: gray;
        font-size: 1rem;
        margin-top: 0.5rem;
      }
    }

    span {
      color: ${(props) => props.theme.COLORS.LIGHT_RED};
    }
  }

  .list__write__income {
    display: flex;
    flex-direction: column;
    height: 38px;

    p {
      font-size: 1.2rem;
      white-space: nowrap;

      &:last-child {
        color: gray;
        font-size: 1rem;
        margin-top: 0.5rem;
      }
    }

    span {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }

  button {
    position: absolute;
    bottom: 0.9rem;
    right: 1rem;
    font-size: 1rem;
    color: #7c7878;
    text-decoration: underline;
  }

  &:hover {
    background: #d0daff;
  }

  &.active {
    background: #d0daff;
  }
`;

const DeleteModal = styled.div`
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;

  .msg__box {
    width: 36rem;
    height: 20rem;
    background-color: ${(props) => props.theme.COLORS.WHITE};
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    padding: 2.5rem;

    h4 {
      font-size: 2.2rem;
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      margin-bottom: 1.5rem;
    }

    p {
      font-size: 1.4rem;
      color: #7e7e7e;
    }

    .buttons {
      margin-top: 6rem;
      display: flex;
      justify-content: space-between;
      gap: 2rem;

      button {
        border-radius: 4px;
        color: #7e7e7e;
        padding: 1rem 6rem;
        background: #d9d9d9;

        &:last-child {
          background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
          color: white;
        }
      }
    }
  }
`;

const ListNullContainer = styled.div`
  height: 20rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  font-size: 1.05rem;
  text-align: center;
  color: rgb(98, 98, 115);
  white-space: pre-wrap;
  line-height: 1.7rem;
  margin-top: 3rem;
`;
