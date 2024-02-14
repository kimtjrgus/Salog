import styled from "styled-components";
import SvgIcon from "@mui/material/SvgIcon";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DoNotDisturbRoundedIcon from "@mui/icons-material/DoNotDisturbRounded";
import logo from "../../assets/Slogo.png";
import { getCookie } from "src/utils/cookie";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "src/store";
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

export const Header = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [outgoIdArray, setOutgoIdArray] = useState<number[]>([]);
  const [incomeIdArray, setIncomeIdArray] = useState<number[]>([]);
  const [filteredOutgoIdArray, setFilteredOutgoIdArray] = useState<outgoType[]>(
    []
  );
  const [filteredIncomeIdArray, setFilteredIncomeIdArray] = useState<
    incomeType[]
  >([]);

  const schedule = useSelector(
    (state: RootState) => state.persistedReducer.schedule
  );

  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const onClickLogo = () => {
    const cookie = getCookie("accessToken");
    typeof cookie === "undefined" ? navigate("/") : navigate("/dashboard");
  };

  const onClickAlarm = () => {
    setIsOpen((prev) => !prev);
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
  }, [outgoIdArray, incomeIdArray]);

  return (
    <Container>
      <Logo onClick={onClickLogo}>
        <img src={logo} alt="로고" />
        <LogoTitle>샐로그</LogoTitle>
      </Logo>
      <Alarm>
        <SvgIcon
          component={
            !isOpen
              ? filteredOutgoIdArray.length === 0 &&
                filteredIncomeIdArray.length === 0
                ? NotificationsNoneIcon
                : NotificationsActiveRoundedIcon
              : NotificationsRoundedIcon
          }
          onClick={onClickAlarm}
        />
        {isOpen && (
          <AlarmModal>
            <div className="rotate__square"></div>
            <div className="alarm__header">
              <p>금융 일정 알림</p>
              <span>{`${
                filteredOutgoIdArray.length + filteredIncomeIdArray.length
              }개`}</span>
              <button onClick={onClickDeleteBtn}>모든 알림 삭제</button>
            </div>
            {filteredOutgoIdArray.length === 0 &&
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
          </AlarmModal>
        )}
      </Alarm>
    </Container>
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
