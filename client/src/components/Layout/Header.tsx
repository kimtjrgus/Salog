import styled from "styled-components";
import SvgIcon from "@mui/material/SvgIcon";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";
import DoNotDisturbRoundedIcon from "@mui/icons-material/DoNotDisturbRounded";
import logo from "../../assets/Slogo.png";
import { getCookie } from "src/utils/cookie";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "src/store";
import { api } from "src/utils/refreshToken";
import { login } from "src/store/slices/userSlice";
import Toast, { ToastType } from "src/components/Layout/Toast";
import { hideToast } from "src/store/slices/toastSlice";
import useDidMountEffect from "src/hooks/useDidMountEffect";
import moment from "moment";
import circulateScheduleNow from "src/utils/circulateScheduleNow";
import ScheduleModal from "./ScheduleModal";
// import {
//   setIncomeSchedule,
//   setOutgoSchedule,
// } from "src/store/slices/scheduleSlice";

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

interface toggleType {
  homeAlarm: boolean;
  emailAlarm: boolean;
}

interface modalType {
  alarm: boolean;
  schedule: boolean;
  outgo: outgoType[];
  income: incomeType[];
}

export const Header = () => {
  const member = useSelector((state: RootState) => state.persistedReducer.user);
  const modal = useSelector((state: RootState) => state.persistedReducer.toast);
  const schedule = useSelector(
    (state: RootState) => state.persistedReducer.schedule
  );

  const [isOpen, setIsOpen] = useState<modalType>({
    alarm: false,
    schedule: false,
    outgo: [],
    income: [],
  });

  const [isOn, setIsOn] = useState<toggleType>({
    homeAlarm: member.homeAlarm,
    emailAlarm: member.emailAlarm,
  });

  const [outgoIdArray, setOutgoIdArray] = useState<number[]>([]);
  const [incomeIdArray, setIncomeIdArray] = useState<number[]>([]);
  const [filteredOutgoIdArray, setFilteredOutgoIdArray] = useState<outgoType[]>(
    []
  );
  const [filteredIncomeIdArray, setFilteredIncomeIdArray] = useState<
    incomeType[]
  >([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onClickLogo = () => {
    const cookie = getCookie("accessToken");
    typeof cookie === "undefined" ? navigate("/") : navigate("/dashboard");
  };

  const onClickAlarm = () => {
    setIsOpen((prev) => {
      return { ...prev, alarm: !prev.alarm };
    });
  };

  const onClickDeleteBtn = () => {
    let arr: number[] = [];
    if (filteredOutgoIdArray.length !== 0) {
      schedule.outgoSchedule.forEach((el: outgoType) => {
        arr.push(el.fixedOutgoId);
      });
      localStorage.setItem("outgoSchedule", JSON.stringify(arr));
      setOutgoIdArray(
        JSON.parse(localStorage.getItem("outgoSchedule") ?? "[]")
      );
      setFilteredOutgoIdArray(
        schedule.outgoSchedule.filter(
          (el: outgoType) => !outgoIdArray.includes(el.fixedOutgoId)
        )
      );
    }
    // dispatch(setOutgoSchedule([]));

    arr = [];
    if (filteredIncomeIdArray.length !== 0) {
      schedule.incomeSchedule.forEach((el: incomeType) => {
        arr.push(el.fixedIncomeId);
      });
      localStorage.setItem("incomeSchedule", JSON.stringify(arr));
      setIncomeIdArray(
        JSON.parse(localStorage.getItem("incomeSchedule") ?? "[]")
      );
      setFilteredIncomeIdArray(
        schedule.incomeSchedule.filter(
          (el: incomeType) => !incomeIdArray.includes(el.fixedIncomeId)
        )
      );
    }
    // dispatch(setIncomeSchedule([]));
  };

  useEffect(() => {
    setOutgoIdArray(JSON.parse(localStorage.getItem("outgoSchedule") ?? "[]"));
    setIncomeIdArray(
      JSON.parse(localStorage.getItem("incomeSchedule") ?? "[]")
    );
  }, []);

  // dashboard 페이지 진입 && 웹 알림이 켜져 있으면 실행 (당일 금융 일정 추가를 위한)
  useEffect(() => {
    if (location.pathname === "/dashboard" && member.homeAlarm) {
      const date = moment().format("YYYY-MM");
      const customDate = `${date}-00`;

      Promise.all([
        api.get(`/fixedOutgo/get?page=1&size=10&date=${customDate}`),
        api.get(`/fixedIncome/get?page=1&size=10&date=${customDate}`),
      ])
        .then(([fixedOutgoRes, fixedIncomeRes]) => {
          const outgoArr: outgoType[] = [];
          const incomeArr: incomeType[] = [];
          const fixedOutgo = fixedOutgoRes.data.data;
          const fixedIncome = fixedIncomeRes.data.data;
          fixedOutgo.forEach((el: outgoType) => {
            if (circulateScheduleNow(el.date)) {
              outgoArr.push(el);
            }
          });
          fixedIncome.forEach((el: incomeType) => {
            if (circulateScheduleNow(el.date)) {
              incomeArr.push(el);
            }
          });
          if (outgoArr.length !== 0 || incomeArr.length !== 0) {
            setIsOpen((prev) => {
              return {
                ...prev,
                schedule: true,
                outgo: outgoArr,
                income: incomeArr,
              };
            });
          }
        })

        .catch((error) => {
          console.error(error);
          // 적절한 에러 처리 방식 선택
        });
    }
  }, [location.pathname]);

  // 이미 확인 한 알람을 필터링하는 문
  useEffect(() => {
    setFilteredOutgoIdArray(
      schedule.outgoSchedule.filter(
        (el: outgoType) => !outgoIdArray.includes(el.fixedOutgoId)
      )
    );
    setFilteredIncomeIdArray(
      schedule.incomeSchedule.filter(
        (el: incomeType) => !incomeIdArray.includes(el.fixedIncomeId)
      )
    );
  }, [outgoIdArray, incomeIdArray, schedule]);

  // 토글을 통한 상태 변경을 반영하는 문
  useDidMountEffect(() => {
    const updateMember = async () => {
      try {
        // 회원정보 업데이트
        await api.patch("/members/update", { ...isOn });

        // 업데이트된 회원정보 가져오기
        const res = await api.get("/members/get");

        // 전역상태 변경
        dispatch(login(res.data.data));
      } catch (error) {
        console.log(error);
      }
    };
    if (location.pathname !== "/") {
      updateMember().catch((error) => {
        console.log(error);
      });
    }
  }, [isOn]);

  // 전역상태를 이용한 토스트 창 띄우기
  useEffect(() => {
    setTimeout(() => {
      // 타입 단언입니다. 이를 통해 modal.type이 ToastType의 키 중 하나임을 명시적으로 알려주는 것
      if (modal.visible && Object.keys(ToastType).includes(modal.type)) {
        Toast(ToastType[modal.type as keyof typeof ToastType], modal.message);
        dispatch(hideToast());
      }
    }, 100);
  }, [modal, dispatch]);

  return (
    <>
      <Container>
        <Logo onClick={onClickLogo}>
          <img src={logo} alt="로고" />
          <LogoTitle>샐로그</LogoTitle>
        </Logo>
        <Alarm>
          <SvgIcon
            component={
              !isOpen.alarm
                ? !member.homeAlarm
                  ? NotificationsOffOutlinedIcon
                  : filteredOutgoIdArray.length === 0 &&
                      filteredIncomeIdArray.length === 0
                    ? NotificationsNoneIcon
                    : NotificationsActiveRoundedIcon
                : NotificationsRoundedIcon
            }
            onClick={onClickAlarm}
          />
          {isOpen.alarm && (
            <AlarmModal>
              <div className="rotate__square"></div>
              <div className="alarm__header">
                <p>금융 일정 알림</p>
                <span>{`${
                  member.homeAlarm
                    ? filteredOutgoIdArray.length + filteredIncomeIdArray.length
                    : 0
                }개`}</span>
                <button onClick={onClickDeleteBtn}>모든 알림 삭제</button>
              </div>
              {!member.homeAlarm ? (
                <NullContainer>
                  <SvgIcon
                    component={NotificationsOffRoundedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                  <p>알람이 켜져있지 않습니다.</p>
                </NullContainer>
              ) : filteredOutgoIdArray.length === 0 &&
                filteredIncomeIdArray.length === 0 ? (
                <NullContainer>
                  <SvgIcon
                    component={DoNotDisturbRoundedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                  <p>작성된 목록이 없습니다.</p>
                </NullContainer>
              ) : (
                <div className="alarm__lists">
                  <ul className="lists__ul">
                    {filteredOutgoIdArray.map((el: outgoType) => (
                      <li key={el.fixedOutgoId} className="list">
                        <div>
                          금융 일정 분류 :{" "}
                          <span className="span__outgo">지출</span>
                        </div>
                        <p>{el.outgoName}</p>
                        <p>
                          {`매 달 ${new Date(el.date).getDate()}일 `}
                          <span className="span__outgo">{`${el.money.toLocaleString()}원`}</span>
                        </p>
                      </li>
                    ))}
                    {filteredIncomeIdArray.map((el: incomeType) => (
                      <li key={el.fixedIncomeId} className="list">
                        <div>
                          금융 일정 분류 :{" "}
                          <span className="span__income">수입</span>
                        </div>
                        <p>{el.incomeName}</p>
                        <p>
                          {`매 달 ${new Date(el.date).getDate()}일 `}
                          <span className="span__income">{`${el.money.toLocaleString()}원`}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="alarm__bottom">
                <div className="alarm__container">
                  <p>웹 알림 설정</p>
                  <ToggleContainer
                    $isOn={isOn.homeAlarm}
                    // 클릭하면 토글이 켜진 상태(isOn)를 boolean 타입으로 변경하는 메소드가 실행
                    onClick={() => {
                      setIsOn((prev) => {
                        return { ...prev, homeAlarm: !prev.homeAlarm };
                      });
                    }}
                  >
                    <div
                      className={`toggle__circle ${
                        isOn.homeAlarm ? "toggle__checked" : null
                      }`}
                    />
                  </ToggleContainer>
                </div>
                <div className="alarm__container">
                  <p>이메일 알림 설정</p>
                  <ToggleContainer
                    $isOn={isOn.emailAlarm}
                    // 클릭하면 토글이 켜진 상태(isOn)를 boolean 타입으로 변경하는 메소드가 실행
                    onClick={() => {
                      setIsOn((prev) => {
                        return { ...prev, emailAlarm: !prev.emailAlarm };
                      });
                    }}
                  >
                    <div
                      className={`toggle__circle ${
                        isOn.emailAlarm ? "toggle__checked" : null
                      }`}
                    />
                  </ToggleContainer>
                </div>
              </div>
            </AlarmModal>
          )}
        </Alarm>
      </Container>
      {isOpen.schedule && (
        <ScheduleModal isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </>
  );
};

export const Container = styled.div`
  width: 100%;
  height: 6rem;
  border-bottom: 0.1rem solid #e2e2e2;
  position: fixed;
  top: 0;
  z-index: 10;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 60px;
  > img {
    width: 50px;
  }
`;

export const LogoTitle = styled.p`
  color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  font-size: 2rem;
  font-weight: 600;
`;

export const Alarm = styled.div`
  position: relative;
  margin-right: 60px;
  right: 3rem;
  color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  cursor: pointer;

  > svg {
    font-size: 3rem;
  }
`;

const AlarmModal = styled.div`
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  position: absolute;
  display: flex;
  flex-direction: column;
  right: -2.8rem;
  top: 4.6rem;
  width: 35rem;
  height: 36rem;
  z-index: 150;
  background: white;
  border: 0.1rem solid rgb(233, 233, 238);
  border-radius: 0.5rem;
  box-shadow: rgba(7, 42, 68, 0.2) 0px 4px 10px 0px;
  animation: 0.25s ease-out 0s 1 normal forwards running fadeIn;

  .rotate__square {
    transform: rotate(135deg);
    content: "";
    width: 2rem;
    height: 2rem;
    background: white;
    border-radius: 1px;
    border: 1px solid rgb(223, 233, 238);
    box-shadow: rgba(7, 42, 68, 0) 0px 4px 10px 0px;
    position: absolute;
    left: 29.5rem;
    top: -0.9rem;
    z-index: -99;
  }

  .alarm__header {
    display: flex;
    width: 100%;
    height: 4rem;
    background: rgb(249, 250, 251);
    border-bottom: 0.1rem solid rgb(233, 233, 238);
    padding: 1.2rem 2rem;

    > p {
      font-size: 1.3rem;
      font-weight: 500;
      color: rgb(98, 98, 115);
      margin-right: 0.4rem;
    }

    > span {
      font-size: 1.3rem;
      font-weight: 600;
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }

    > button {
      cursor: pointer;
      border-radius: 8px;
      font-size: 1.3rem;
      position: absolute;
      right: 2rem;
      top: 0.6rem;
      background: white;
      padding: 0.5rem 1.2rem;

      &:hover {
        background: rgb(233, 238, 255);
      }
    }
  }

  .alarm__lists {
    width: 100%;
    height: 26rem;
    overflow-y: scroll;
    color: rgb(70, 70, 86);

    .lists__ul {
      padding: 1rem 1.5rem;
    }

    .list {
      padding: 1rem;
      margin-bottom: 0.5rem;
      height: 8rem;
      border-bottom: 1px solid rgb(233, 233, 238);

      > div {
        font-size: 1.25rem;
        padding-bottom: 1rem;

        > span {
          font-weight: 600;
          margin-left: 0.3rem;
        }
      }

      > p {
        margin-bottom: 0.8rem;
        font-size: 1.3rem;
        font-weight: 600;

        &:last-child {
          font-size: 1.25rem;
          font-weight: 400;
        }
      }
    }

    .span__outgo {
      color: ${(props) => props.theme.COLORS.LIGHT_RED};
      font-weight: 600;
    }

    .span__income {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      font-weight: 600;
    }
  }

  .alarm__bottom {
    border-top: 0.1rem solid rgb(233, 233, 238);
    display: flex;
    align-items: center;
    height: 6rem;
    padding: 0 2.5rem;

    .alarm__container {
      display: flex;
      align-items: center;
      margin-right: 2.5rem;

      > p {
        font-size: 1.2rem;
        white-space: nowrap;
        color: rgb(98, 98, 115);
        margin-right: 1.5rem;
      }
    }
  }
`;

const NullContainer = styled.div`
  width: 100%;
  height: 32rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > svg {
    font-size: 6.6rem;
    color: #c7c7c7;
  }

  p {
    font-size: 1.5rem;
    color: gray;
  }
`;

const ToggleContainer = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 4.6rem;
  height: 2rem;
  border-radius: 30px;
  background-color: ${(props) =>
    props.$isOn ? "rgb(0, 200, 102)" : "rgb(233, 233, 234)"};

  > .toggle__circle {
    position: absolute;
    top: 0.1rem;
    left: 0.1rem;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background-color: rgb(255, 254, 255);
    transition: 0.5s;
  }

  //.toggle--checked 클래스가 활성화 되었을 경우의 CSS를 구현
  > .toggle__checked {
    left: 2.7rem;
    transition: 0.5s;
  }
`;
