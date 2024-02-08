import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { useEffect, useState } from "react";
import { api } from "src/utils/refreshToken";
import moment from "moment";
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "src/store/slices/toastSlice";
import Toast, { ToastType } from "src/components/Layout/Toast";
import { type RootState } from "src/store";

export interface budgetType {
  budget: number;
  totalOutgo: number;
  dayRemain: number;
}

interface tagType {
  tagName: string;
  tagSum: number;
}

interface monthlyType {
  monthlyTotal: number;
  tags: tagType[];
}

const Budget = () => {
  const [monthlyBudget, setMonthlyBudget] = useState<budgetType>({
    budget: 0,
    totalOutgo: 0,
    dayRemain: 0,
  });
  const [lastMonthlyBudget, setLastMonthlyBudget] = useState<budgetType>({
    budget: 0,
    totalOutgo: 0,
    dayRemain: 0,
  });

  const [monthlyOutgo, setMonthlyOutgo] = useState<monthlyType>({
    monthlyTotal: 0,
    tags: [],
  });

  const [monthlyIncome, setMonthlyIncome] = useState<monthlyType>({
    monthlyTotal: 0,
    tags: [],
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const modal = useSelector((state: RootState) => state.persistedReducer.toast);

  const dispatch = useDispatch();

  const remainingDay = () => {
    // 현재 날짜를 가져옵니다.
    const currentDate = new Date();

    // 이번 달의 마지막 날짜를 가져옵니다.
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // 이번 달의 남은 일수를 계산합니다.
    const remainingDays = lastDayOfMonth.getDate() - currentDate.getDate() + 1;

    return remainingDays;
  };

  useEffect(() => {
    api
      .get(`/monthlyBudget?date=${moment().format("YYYY-MM")}`)
      .then((res) => {
        res.data === ""
          ? setMonthlyBudget({
              budget: 0,
              totalOutgo: 0,
              dayRemain: 0,
            })
          : setMonthlyBudget(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
    api
      .get(
        `/monthlyBudget?date=${moment()
          .subtract(1, "months")
          .format("YYYY-MM")}`
      )
      .then((res) => {
        res.data === ""
          ? setLastMonthlyBudget({
              budget: 0,
              totalOutgo: 0,
              dayRemain: 0,
            })
          : setLastMonthlyBudget(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
    api
      .get(`/income/monthly?date=${moment().format("YYYY-MM-DD")}`)
      .then((res) => {
        setMonthlyIncome(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
    api
      .get(`/outgo/monthly?date=${moment().format("YYYY-MM-DD")}`)
      .then((res) => {
        setMonthlyOutgo(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    // 전역상태를 이용한 토스트 창 띄우기
    setTimeout(() => {
      if (modal.visible) {
        modal.type === "success"
          ? Toast(ToastType.success, modal.message)
          : Toast(ToastType.error, modal.message);
        dispatch(hideToast());
      }
    }, 100);
  }, [modal, dispatch]);

  return (
    <>
      <Container>
        <div className="header">
          <h3>예산</h3>
          <button
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <SvgIcon
              component={CreateOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 1 }}
            />
            <p>예산 작성하기</p>
          </button>
        </div>
        <p className="subtitle">
          예산을 설정하여 지출을 효과적으로 관리해보세요!
        </p>
        <ul className="money__info">
          <li className="info__list">
            <h6>이번 달 지출</h6>
            <p>{monthlyOutgo.monthlyTotal.toLocaleString()}원</p>
          </li>
          <li className="info__list">
            <h6>이번 달 수입</h6>
            <p>{monthlyIncome.monthlyTotal.toLocaleString()}원</p>
          </li>
          <li className="info__list">
            <h6>예산</h6>
            <p>{monthlyBudget.budget.toLocaleString()}원</p>
          </li>
        </ul>
        <GraphContainer>
          <StatList>
            <h3>{`${
              new Date(moment().format("YYYY-MM-DD")).getMonth() + 1
            }월 예산`}</h3>
            <h4>{monthlyBudget.budget.toLocaleString()}원</h4>
            <hr />
            <BarChartContainer>
              <div className="legends">
                <div className="legend__square"></div>
                <p>예산</p>
                <div className="legend__square"></div>
                <p>지출</p>
              </div>
              <Bar
                width={`${
                  isNaN(
                    Math.floor(
                      (monthlyBudget.totalOutgo / monthlyBudget.budget) * 100
                    )
                  )
                    ? 0
                    : Math.floor(
                        (monthlyBudget.totalOutgo / monthlyBudget.budget) * 100
                      )
                }`}
                className="bar"
              >
                <div className="bar__item">
                  {Math.floor(
                    (monthlyBudget?.totalOutgo / monthlyBudget?.budget) * 100
                  ) > 10 ? (
                    <span className="bar__percent">
                      {`${Math.floor(
                        (monthlyBudget?.totalOutgo / monthlyBudget?.budget) *
                          100
                      )}`}
                      %
                    </span>
                  ) : null}
                </div>
                <span className="bar__outgo">
                  {monthlyBudget?.totalOutgo.toLocaleString()}원
                </span>
              </Bar>
            </BarChartContainer>
            <hr className="bottom__hr" />
            <div className="list__bottom">
              <div className="color__info">
                <div className="circle"></div>
                <p>남은 예산</p>
                <p>
                  {(
                    monthlyBudget.budget - monthlyBudget.totalOutgo
                  ).toLocaleString()}
                  원
                </p>
              </div>
              <div className="color__info">
                <div className="circle"></div>
                <p>하루 예산</p>
                <p>
                  {monthlyBudget.budget === 0
                    ? 0
                    : Math.floor(
                        (monthlyBudget.budget - monthlyOutgo.monthlyTotal) /
                          remainingDay()
                      ).toLocaleString()}
                  원
                </p>
              </div>
            </div>
          </StatList>
          <BarContainer>
            <h4>지난달 예산 및 결과</h4>
            <ul className="bar">
              <LastMonthBar
                height={`${
                  (lastMonthlyBudget.budget /
                    (lastMonthlyBudget.budget + monthlyOutgo.monthlyTotal)) *
                  100
                }`}
              >
                <div></div>
                <p>{lastMonthlyBudget.budget.toLocaleString()}원</p>
                <p>{`${
                  new Date().getMonth() === 0 ? 12 : new Date().getMonth()
                }월 예산`}</p>
              </LastMonthBar>
              <MonthBar
                height={`${
                  (monthlyOutgo.monthlyTotal /
                    (lastMonthlyBudget.budget + monthlyOutgo.monthlyTotal)) *
                  100
                }`}
              >
                <div></div>
                <p>{`${monthlyOutgo.monthlyTotal.toLocaleString()}원`}</p>
                <p>{`${new Date().getMonth() + 1}월 지출`}</p>
              </MonthBar>
            </ul>
          </BarContainer>
        </GraphContainer>
      </Container>
      {isOpen && (
        <Modal
          setIsOpen={setIsOpen}
          monthlyBudget={monthlyBudget}
          setMonthlyBudget={setMonthlyBudget}
        />
      )}
    </>
  );
};

export default Budget;

const Container = styled.div`
  width: 92%;
  padding: 3rem 8rem;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      font-size: 2rem;
    }

    button {
      display: flex;
      gap: 0.5rem;
      padding: 0.8rem 1.2rem;
      border-radius: 4px;
      background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      color: white;
    }
  }

  .subtitle {
    color: #7c7c7c;
    font-size: 1.4rem;
  }

  .money__info {
    max-width: 75rem;
    display: flex;
    margin-top: 4rem;
    border: 1px solid #e4e4e4;
    border-radius: 4px;

    .info__list {
      min-width: 25rem;
      white-space: nowrap;
      padding: 2.5rem;
      padding-right: 15rem;
      border-right: 1px solid #e4e4e4;

      &:nth-child(3) {
        border-right: none;
      }

      h6 {
        font-size: 1.2rem;
        font-weight: 400;
        color: #1e1e1e;
        margin-bottom: 1.5rem;
      }

      p {
        font-size: 1.8rem;
        font-weight: 600;
        color: #464656;
      }
    }
  }
`;

const GraphContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 2rem;
  margin-top: 3.5rem;

  .budget {
    border: 1px solid #e4e4e4;
    border-radius: 4px;
    padding: 1.5rem;

    h5 {
      font-size: 1.4rem;
      font-weight: 300;
      color: #1e1e1e;
      margin-bottom: 1.5rem;
    }

    .budget__money {
      font-size: 2rem;
      font-weight: 600;
      color: #464656;
    }
  }
`;

const StatList = styled.li`
  border: 1px solid #e4e4e4;
  box-shadow: 0px 2px 10px rgb(0, 0, 0, 10%);
  border-radius: 6px;
  width: 45rem;
  height: 22.5rem;

  h3 {
    font-size: 1.3rem;
    margin-left: 1.8rem;
    margin-top: 1.3rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
  }

  h4 {
    font-size: 1.8rem;
    margin-left: 1.8rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  hr {
    border: 1px solid #f2f2f2;
  }

  .bottom__hr {
    margin: 1rem 2rem;
    margin-top: 4rem;
  }

  .PieChartContainer {
    width: 250px;
    height: 100px; /* 파이차트 컨테이너의 높이 설정 */
  }

  .list__bottom {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    padding: 0 2rem;
    white-space: nowrap;

    .color__info {
      display: flex;
      align-items: center;

      p {
        font-size: 1.1rem;
        margin-right: 4rem;
        color: #444444;

        &:nth-child(3) {
          font-size: 1.2rem;
          font-weight: 600;
          margin-right: 5.5rem;
        }
      }
    }

    .circle {
      margin-right: 0.8rem;
      width: 9px;
      height: 9px;
      background: #c1c1c1;
      border-radius: 50%;
    }
  }
`;

const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.3rem 2rem;

  .legends {
    display: flex;
    margin-top: 0.5rem;
    align-items: center;
  }

  .legend__square {
    width: 20px;
    height: 5px;
    margin-right: 0.5rem;

    &:first-child {
      background: #d9d9d9;
    }

    &:nth-child(3) {
      background: #1bbf83;
    }
  }

  p {
    font-size: 1.2rem;
    margin-right: 1rem;
  }

  .bar {
  }
`;

const BarContainer = styled.div`
  width: 34rem;
  box-shadow: 0px 2px 10px rgb(0, 0, 0, 10%);
  border: 1px solid #e4e4e4;
  padding: 2rem;
  border-radius: 4px;

  h4 {
    color: #69696a;
    font-size: 1.4rem;
  }

  .bar {
    /* 기타 스타일 속성들 */
    display: flex;
    justify-content: center;
    gap: 7rem;
    height: 14rem;
    margin-top: 2rem;
    padding: 0 2rem;
  }
`;

const Bar = styled.div<{ width: string }>`
  margin-top: 1.5rem;
  border-radius: 4px;
  width: 100%;
  height: 26px;
  background: #d9d9d9;

  @keyframes fade-in1 {
    0% {
      width: 0px;
    }
    100% {
      width: ${(props) => (Number(props.width) > 100 ? 100 : props.width)}%;
    }
  }

  .bar__item {
    display: flex;
    align-items: center;
    justify-content: center; /* 수정된 부분 */
    /* animation: fade-in1 1s ease-in-out forwards; */
    background: #1bbf83;
    border-radius: ${(props) =>
      Number(props.width) < 100 ? "4px 0 0 4px" : "4px"};
    width: ${(props) => (Number(props.width) > 100 ? 100 : props.width)}%;
    height: 26px;
    margin-bottom: 0.4rem;
  }

  .bar__percent {
    color: white;
    font-size: 1.2rem;
    font-weight: 500;
  }

  .bar__outgo {
    color: #7c7878;
    white-space: nowrap;
    font-size: 1rem;
    margin-left: ${(props) =>
      Number(props.width) < 8
        ? 0
        : Number(props.width) > 85
          ? 0
          : Number(props.width) - 8}%;

    float: ${(props) =>
      Number(props.width) < 8
        ? "left"
        : Number(props.width) > 85
          ? "right"
          : "none"};

    margin-top: ${(props) =>
      Number(props.width) < 8
        ? "0.5rem"
        : Number(props.width) > 85
          ? "0.5rem"
          : "0"};
  }
`;

const LastMonthBar = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    animation: fade-in 1s ease-in-out forwards;
    border-radius: 4px;
    width: 25px;
    height: ${(props) => props.height}%;
    background: #bfbbbb;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.4rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1.2rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const MonthBar = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in0 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    border-radius: 4px;
    width: 25px;
    height: ${(props) => props.height}%;
    animation: fade-in0 1s ease-in-out forwards;
    background: ${(props) => props.theme.COLORS.LIGHT_GREEN};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.4rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1.2rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;
