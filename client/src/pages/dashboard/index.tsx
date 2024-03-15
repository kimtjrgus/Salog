import { styled } from "styled-components";
import "chart.js/auto";
import PieChart from "./PieChart";
import { useEffect, useState } from "react";
import DashboardCalendar from "./Calendar";
import Schedule from "./Schedule";
import WriteModal from "./WriteModal";
import ReadModal from "./ReadModal";
import { api } from "src/utils/refreshToken";
import moment from "moment";

export interface outgoType {
  monthlyTotal: number;
  tags: tagType[];
}

export interface incomeType {
  monthlyTotal: number;
  tags: tagType[];
}

export interface wasteType {
  date: string;
  monthlyTotal: number;
  tags: tagType[];
}

export interface budgetType {
  budget: number;
  totalOutgo: number;
  dayRemain: number;
}

export interface tagType {
  tagName: string;
  tagSum: number;
}

export interface modalType {
  dayTile: boolean;
  writeIcon: boolean;
  receiptCheck: boolean;
  day: string;
}

const Dashboard = () => {
  // const member = useSelector((state: RootState) => state.persistedReducer.user);

  // member에 태그가 추가되면 화면 제작
  const [monthlyOutgo, setMonthlyOutgo] = useState<outgoType>({
    monthlyTotal: 0,
    tags: [],
  });
  const [monthlyIncome, setMonthlyIncome] = useState<incomeType>({
    monthlyTotal: 0,
    tags: [],
  });
  const [monthlyWasteList, setMonthlyWasteList] = useState<wasteType>({
    date: "",
    monthlyTotal: 0,
    tags: [],
  });
  const [monthlyBudget, setMonthlyBudget] = useState<budgetType>({
    budget: 0,
    totalOutgo: 0,
    dayRemain: 0,
  });

  const [isOpen, setIsOpen] = useState<modalType>({
    dayTile: false,
    writeIcon: false,
    receiptCheck: false,
    day: "",
  });

  const statLists = [
    {
      title: "이번 달 지출",
      data: monthlyOutgo,
      sum: monthlyOutgo.monthlyTotal,
    },
    {
      title: "이번 달 수입",
      data: monthlyIncome,
      sum: monthlyIncome.monthlyTotal,
    },
    {
      title: "낭비 리스트",
      data: monthlyWasteList,
      sum: monthlyWasteList.monthlyTotal,
    },
  ];
  useEffect(() => {
    api
      .get(`/outgo/monthly?date=${moment().format("YYYY-MM-DD")}`)
      .then((res) => {
        setMonthlyOutgo(res.data);
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
        console.log(error);
      });
    api
      .get(`/outgo/wasteList/monthly?date=${moment().format("YYYY-MM-DD")}`)
      .then((res) => {
        setMonthlyWasteList(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
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
  }, []);

  return (
    <>
      <Container>
        <StatContainer>
          {statLists.map((stat, index) => (
            <StatList key={index}>
              <h3>{stat.title}</h3>
              <h4>{stat.sum?.toLocaleString()}원</h4>
              <hr />
              <div className="PieChartContainer">
                {stat.sum === 0 ? (
                  <div className="null__chart"></div>
                ) : (
                  <PieChart stat={stat} />
                )}
              </div>
            </StatList>
          ))}
          <StatList>
            <h3>예산</h3>
            <h4>{monthlyBudget.budget.toLocaleString()}원</h4>
            <hr />
            <BarChartContainer
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
            >
              <div className="legends">
                <div className="legend__square"></div>
                <p>예산</p>
                <div className="legend__square"></div>
                <p>지출</p>
              </div>
              <div className="bar">
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
                  {monthlyBudget.totalOutgo.toLocaleString()}원
                </span>
              </div>
            </BarChartContainer>
          </StatList>
        </StatContainer>
        <MainContainer>
          <DashboardCalendar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            monthlyOutgo={monthlyOutgo}
            monthlyIncome={monthlyIncome}
          />
          <Schedule />
        </MainContainer>
        <WriteModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setMonthlyOutgo={setMonthlyOutgo}
          setMonthlyIncome={setMonthlyIncome}
        />
      </Container>
      {isOpen.dayTile && <ReadModal isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
};

const Container = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
`;

const StatContainer = styled.ul`
  padding: 1.5rem;
  display: flex;
  height: 22rem;
`;

const MainContainer = styled.div`
  display: flex;
`;

const StatList = styled.li`
  border: 1px solid ${(props) => props.theme.COLORS.GRAY_300};
  box-shadow: 0px 2px 10px rgb(0, 0, 0, 10%);
  border-radius: 6px;
  margin: 0 0.5rem;
  width: 25rem;

  h3 {
    font-size: 1.2rem;
    margin-left: 1.8rem;
    margin-top: 1.3rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
  }

  h4 {
    font-size: 1.8rem;
    margin-left: 1.8rem;
    margin-top: 0.6rem;
    margin-bottom: 1rem;
  }

  hr {
    border: 1px solid #f2f2f2;
  }

  .PieChartContainer {
    width: 25rem;
    height: 10rem; /* 파이차트 컨테이너의 높이 설정 */

    .null__chart {
      margin-top: 1.8rem;
      margin-left: 2rem;
      width: 9rem;
      height: 9rem;
      border-radius: 50px;
      border: 12px solid #bababa;
    }

    @media (min-width: 960px) and (max-width: 1172px) {
      margin-left: 1rem;
    }
  }
`;

const BarChartContainer = styled.div<{ width: string }>`
  display: flex;
  flex-direction: column;
  padding: 0.3rem 2rem;

  .legends {
    display: flex;
    align-items: center;
  }

  .legend__square {
    width: 2rem;
    height: 0.5rem;
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
    margin-top: 1.5rem;
    border-radius: 4px;
    width: 100%;
    height: 2.2rem;
    background: #d9d9d9;

    .bar__item {
      display: flex;
      align-items: center;
      justify-content: center; /* 수정된 부분 */
      background: #1bbf83;
      border-radius: ${(props) =>
        Number(props.width) < 100 ? "4px 0 0 4px" : "4px"};
      width: ${(props) => (Number(props.width) > 100 ? 100 : props.width)}%;
      height: 2.2rem;
      margin-bottom: 0.4rem;
    }

    .bar__percent {
      color: white;
      font-size: 1.1rem;
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
  }
`;

export default Dashboard;
