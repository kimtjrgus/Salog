import { styled } from "styled-components";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  // CartesianGrid,
  Tooltip,
} from "recharts";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";
import CustomTooltip from "./CustomTooltip";
import { api } from "src/utils/refreshToken";

import moment from "moment";
import generateWeeklyData from "src/utils/generateWeeklyData";
import calculateWeeklyStatistics from "src/utils/calculateWeeklyStatistics";
import weeklyCalculateRadio from "src/utils/calculateWeeklyPercent";
import PieChart from "./PieChart";

interface calendarType {
  date: string;
  totalOutgo: number;
  totalIncome: number;
}

interface outgoType {
  monthlyTotal: number;
  tags: tagType[];
}

interface wasteType {
  outgoId: number;
  date: string;
  money: number;
  outgoName: string;
  memo: string;
  outgoTag: ledgerTagType;
  wasteList: boolean;
  payment: string;
  receiptImg: string;
}

interface budgetType {
  budget: number;
  totalOutgo: number;
  dayRemain: number;
}

export interface tagType {
  tagName: string;
  tagSum: number;
}

interface ledgerTagType {
  ledgerTagId: number;
  tagName: string;
}

// interface incomeType {
// 	monthlyTotal: number;
// 	tags: tagType[];
// }

const MonthRadio = () => {
  const [calendar, setCalendar] = useState<calendarType[]>([]);
  const [monthlyOutgo, setMonthlyOutgo] = useState<outgoType>({
    monthlyTotal: 0,
    tags: [],
  });
  const [monthlyBudget, setMonthlyBudget] = useState<budgetType>({
    budget: 0,
    totalOutgo: 0,
    dayRemain: 0,
  });

  const [wasteList, setWasteList] = useState<wasteType[]>([]);

  const [lastMonthlyOutgo, setLastMonthlyOutgo] = useState<outgoType>({
    monthlyTotal: 0,
    tags: [],
  });
  const [lastTwoMonthlyOutgo, setLastTwoMonthlyOutgo] = useState<outgoType>({
    monthlyTotal: 0,
    tags: [],
  });

  const [percentages, setPercentages] = useState({
    lastTwoRadio: 0,
    lastRadio: 0,
    currentRadio: 0,
  });

  const weeks = generateWeeklyData(calendar);
  const weeklyStatistics = calculateWeeklyStatistics(weeks);

  const calculateRadio = (
    lastTwoTotal: number,
    lastTotal: number,
    currentTotal: number
  ) => {
    const totalSum = lastTwoTotal + lastTotal + currentTotal;
    if (totalSum === 0) {
      // 총합이 0인 경우, 적절한 대체값이나 예외 처리를 수행
      return {
        lastTwoRadio: 0,
        lastRadio: 0,
        currentRadio: 0,
      };
    } else {
      const lastTwoRadio = lastTwoTotal / totalSum;
      const lastRadio = lastTotal / totalSum;
      const currentRadio = currentTotal / totalSum;

      return {
        lastTwoRadio,
        lastRadio,
        currentRadio,
      };
    }
  };

  console.log(percentages.lastRadio, percentages.currentRadio);

  // const { lastTwoRadio, lastRadio, currentRadio } = calculateRadio(
  //   lastTwoMonthlyOutgo?.monthlyTotal,
  //   lastMonthlyOutgo?.monthlyTotal,
  //   monthlyOutgo?.monthlyTotal
  // );

  const radios = weeklyCalculateRadio(weeklyStatistics);

  // pieChart에 필요한 가공된 데이터
  const statLists = [
    {
      title: "이번 달 지출",
      data: monthlyOutgo,
      sum: monthlyOutgo.monthlyTotal,
    },
    // {
    // 	title: "이번 달 수입",
    // 	data: monthlyIncome,
    // 	sum: monthlyIncome.monthlyTotal,
    // },
    // {
    // 	title: "낭비 리스트",
    // 	data: monthlyWasteList,
    // 	sum: monthlyWasteList.monthlyTotal,
    // },
  ];

  const renderCustomAxisTick = () => {
    return (
      <div className="bottom__tick">
        <p>1일</p>
        <p>말일</p>
      </div>
    );
  };

  // useEffect(() => {
  //   api
  //     .get(`/calendar?date=${moment().format("YYYY-MM-DD")}`)
  //     .then((res) => {
  //       setCalendar(res.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   api
  //     .get(`/outgo/monthly?date=${moment().format("YYYY-MM-DD")}`)
  //     .then((res) => {
  //       setMonthlyOutgo(res.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   api
  //     .get(
  //       `/outgo/monthly?date=${moment()
  //         .subtract(1, "months")
  //         .format("YYYY-MM-DD")}`
  //     )
  //     .then((res) => {
  //       setLastMonthlyOutgo(res.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   api
  //     .get(
  //       `/outgo/monthly?date=${moment()
  //         .subtract(2, "months")
  //         .format("YYYY-MM-DD")}`
  //     )
  //     .then((res) => {
  //       setLastTwoMonthlyOutgo(res.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   api
  //     .get(`/monthlyBudget?date=${moment().format("YYYY-MM")}`)
  //     .then((res) => {
  //       res.data === ""
  //         ? setMonthlyBudget({
  //             budget: 0,
  //             totalOutgo: 0,
  //             dayRemain: 0,
  //           })
  //         : setMonthlyBudget(res.data);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  //   const date = moment().format("YYYY-MM");
  //   const customDate = `${date}-00`;
  //   api
  //     .get(`/outgo/wasteList?page=1&size=30&date=${customDate}`)
  //     .then((res) => {
  //       setWasteList(res.data.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  //   // 여기서 마운트 시에 필요한 값을 계산하고 상태에 저장
  //   const lastTwoMonthlyOutgoTotal = lastTwoMonthlyOutgo?.monthlyTotal || 0;
  //   const lastMonthlyOutgoTotal = lastMonthlyOutgo?.monthlyTotal || 0;
  //   const monthlyOutgoTotal = monthlyOutgo?.monthlyTotal || 0;

  //   const result = calculateRadio(
  //     lastTwoMonthlyOutgoTotal,
  //     lastMonthlyOutgoTotal,
  //     monthlyOutgoTotal
  //   );

  //   setPercentages(result);
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDate = moment().format("YYYY-MM-DD");
        const lastMonthDate = moment()
          .subtract(1, "months")
          .format("YYYY-MM-DD");
        const lastTwoMonthDate = moment()
          .subtract(2, "months")
          .format("YYYY-MM-DD");
        const currentMonth = moment().format("YYYY-MM");
        const customDate = `${currentMonth}-00`;

        const [
          calendarResponse,
          monthlyOutgoResponse,
          lastMonthlyOutgoResponse,
          lastTwoMonthlyOutgoResponse,
          monthlyBudgetResponse,
          wasteListResponse,
        ] = await Promise.all([
          api.get(`/calendar?date=${currentDate}`),
          api.get(`/outgo/monthly?date=${currentDate}`),
          api.get(`/outgo/monthly?date=${lastMonthDate}`),
          api.get(`/outgo/monthly?date=${lastTwoMonthDate}`),
          api.get(`/monthlyBudget?date=${currentMonth}`),
          api.get(`/outgo/wasteList?page=1&size=30&date=${customDate}`),
        ]);

        setCalendar(calendarResponse.data);
        setMonthlyOutgo(monthlyOutgoResponse.data);
        setLastMonthlyOutgo(lastMonthlyOutgoResponse.data);
        setLastTwoMonthlyOutgo(lastTwoMonthlyOutgoResponse.data);

        const monthlyBudgetData =
          monthlyBudgetResponse.data === ""
            ? { budget: 0, totalOutgo: 0, dayRemain: 0 }
            : monthlyBudgetResponse.data;
        setMonthlyBudget(monthlyBudgetData);

        setWasteList(wasteListResponse.data.data);

        const lastTwoMonthlyOutgoTotal =
          lastTwoMonthlyOutgoResponse.data?.monthlyTotal || 0;
        const lastMonthlyOutgoTotal =
          lastMonthlyOutgoResponse.data?.monthlyTotal || 0;
        const monthlyOutgoTotal = monthlyOutgoResponse.data?.monthlyTotal || 0;

        const result = calculateRadio(
          lastTwoMonthlyOutgoTotal,
          lastMonthlyOutgoTotal,
          monthlyOutgoTotal
        );

        setPercentages(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <Container>
      <h3>{`${new Date().getMonth() + 1}월 지출 분석`}</h3>
      <TopContainer>
        <LineGraph>
          <div className="left__line">
            <div className="left">
              <h5>이번 달 총 지출</h5>
              <p className="left__money">
                {monthlyOutgo.monthlyTotal.toLocaleString()}원
              </p>
              <p className="left__compare">
                지난 달 보다{" "}
                <span>{`${
                  monthlyOutgo.monthlyTotal - lastMonthlyOutgo.monthlyTotal > 0
                    ? "+"
                    : ""
                } ${(
                  monthlyOutgo.monthlyTotal - lastMonthlyOutgo.monthlyTotal
                ).toLocaleString()}원`}</span>
              </p>
              <ResponsiveContainer width="100%" height="70%">
                <LineChart
                  /* 차트로 그릴 데이터 주입 */
                  data={calendar}
                  width={250}
                  height={150}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  {/* <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" /> */}
                  <XAxis
                    fontSize="12px"
                    fontWeight="500"
                    tick={renderCustomAxisTick}
                    padding={{ left: 10, right: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="linear"
                    isAnimationActive={true}
                    animationDuration={1500}
                    dataKey="totalOutgo"
                    stroke="#FB866C"
                    strokeWidth={2}
                    // activeDot={{ r: 0.1 }}
                    dot={{
                      stroke: "red",
                      strokeWidth: 1,
                      r: 1.5,
                      strokeDasharray: "",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="bottom__tick">
                <p>1일</p>
                <p>말일</p>
              </div>
            </div>
            <div className="right">
              <h5>최근 3개월 지출 합계</h5>
              <ul className="bar">
                <LastTwoBarList height={`${percentages.lastTwoRadio * 100}`}>
                  <div></div>
                  <p>{lastTwoMonthlyOutgo.monthlyTotal.toLocaleString()}원</p>
                  {/* -1을 해서 2달 전을 나타내는데 0이나 -1이 될 때에만 예외처리 */}
                  <p>{`${
                    new Date().getMonth() - 1 === -1
                      ? 11
                      : new Date().getMonth() - 1 === 0
                        ? 12
                        : new Date().getMonth() - 1
                  }월 지출`}</p>
                </LastTwoBarList>
                <LastBarList height={`${percentages.lastRadio * 100}`}>
                  <div></div>
                  <p>{lastMonthlyOutgo.monthlyTotal.toLocaleString()}원</p>
                  {/* getMonth()는 0~11 이기 때문에 0만 예외처리 */}
                  <p>{`${
                    new Date().getMonth() === 0 ? 12 : new Date().getMonth()
                  }월 지출`}</p>
                </LastBarList>
                <BarList height={`${percentages.currentRadio * 100}`}>
                  <div></div>
                  <p>{monthlyOutgo.monthlyTotal.toLocaleString()}원</p>
                  {/* 원래 +1을 하여 사용하는 것이므로 예외처리 X */}
                  <p>{`${new Date().getMonth() + 1}월 지출`}</p>
                </BarList>
              </ul>
            </div>
          </div>
          <div className="right__line">
            <h5>주간 별 분석</h5>
            {radios.length >= 4 && weeklyStatistics.length >= 4 && (
              <ul className="bar">
                <FirstWeekBarList height={`${radios[0].outgoRadio}`}>
                  <div></div>
                  <p>{weeklyStatistics[0].totalOutgo.toLocaleString()}원</p>
                  {/* 원래 +1을 하여 사용하는 것이므로 예외처리 X */}
                  <p>{`${new Date().getMonth() + 1}월 ${
                    weeklyStatistics[0].week
                  }주차`}</p>
                </FirstWeekBarList>
                <SecondWeekBarList height={`${radios[1].outgoRadio}`}>
                  <div></div>
                  <p>{weeklyStatistics[1].totalOutgo.toLocaleString()}원</p>
                  {/* 원래 +1을 하여 사용하는 것이므로 예외처리 X */}
                  <p>{`${new Date().getMonth() + 1}월 ${
                    weeklyStatistics[1].week
                  }주차`}</p>
                </SecondWeekBarList>
                <ThirdWeekBarList height={`${radios[2].outgoRadio}`}>
                  <div></div>
                  <p>{weeklyStatistics[2].totalOutgo.toLocaleString()}원</p>
                  {/* 원래 +1을 하여 사용하는 것이므로 예외처리 X */}
                  <p>{`${new Date().getMonth() + 1}월 ${
                    weeklyStatistics[2].week
                  }주차`}</p>
                </ThirdWeekBarList>
                <FourthWeekBarList height={`${radios[3].outgoRadio}`}>
                  <div></div>
                  <p>{weeklyStatistics[3].totalOutgo.toLocaleString()}원</p>
                  {/* 원래 +1을 하여 사용하는 것이므로 예외처리 X */}
                  <p>{`${new Date().getMonth() + 1}월 ${
                    weeklyStatistics[3].week
                  }주차`}</p>
                </FourthWeekBarList>
                <FifthWeekBarList height={`${radios[4].outgoRadio}`}>
                  <div></div>
                  <p>{weeklyStatistics[4].totalOutgo.toLocaleString()}원</p>
                  {/* 원래 +1을 하여 사용하는 것이므로 예외처리 X */}
                  <p>{`${new Date().getMonth() + 1}월 ${
                    weeklyStatistics[4].week
                  }주차`}</p>
                </FifthWeekBarList>
              </ul>
            )}
          </div>
        </LineGraph>
      </TopContainer>
      <BottomContainer>
        <Doughnut>
          <h5>분류 별 지출</h5>
          <PieChart stat={statLists[0]} />
        </Doughnut>
        <Budget>
          <h5>예산 소진율</h5>
          <div style={{ width: "18rem", height: "18rem", marginLeft: 26 }}>
            <CircularProgressbarWithChildren
              value={
                monthlyBudget.budget === 0
                  ? 0
                  : Math.floor(
                      (monthlyOutgo.monthlyTotal / monthlyBudget.budget) * 100
                    )
              }
              strokeWidth={4}
              styles={{
                root: {
                  // width: "80%",
                  // height: "80%",
                },
                path: {
                  stroke: "#1BBF83",
                },
              }}
            >
              <div
                style={{
                  fontSize: "1.2rem",
                  marginTop: -5,
                  textAlign: "center",
                }}
              >
                <p className="bar__percentage">
                  {monthlyBudget.budget === 0
                    ? 0
                    : Math.floor(
                        (monthlyOutgo.monthlyTotal / monthlyBudget.budget) * 100
                      )}
                  %
                </p>
                <p className="bar__budget">예산 : {monthlyBudget.budget}원</p>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </Budget>
        <Waste>
          <h5>낭비 리스트</h5>
          {wasteList.length === 0 ? (
            <div className="null__container">
              이번 달 추가된 낭비 리스트가 없습니다.
            </div>
          ) : (
            <div className="waste__container">
              <div className="waste__header">
                <div>사용 내역</div>
                <div>금액</div>
              </div>
              <ul className="waste__ul">
                {wasteList.map((waste, idx) => (
                  <li className="waste__lists" key={idx}>
                    <div>{waste.outgoName}</div>
                    <div>{waste.money}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Waste>
      </BottomContainer>
    </Container>
  );
};

export default MonthRadio;

const Container = styled.div`
  width: 92%;
  padding: 3rem 8rem;
  /* margin: 2rem 3rem; */

  h3 {
    font-size: 2rem;
    color: #464656;
  }

  .bottom__tick {
    position: absolute;
    bottom: 0rem;
    width: 100%;
    height: 1rem;
    display: flex;
    justify-content: space-between;
    padding-right: 10px;
    p {
      font-size: 1rem !important;
      font-weight: 400 !important;
      color: #a2a2a4;
    }
  }
`;

const TopContainer = styled.div`
  width: 100%;
  height: 20rem;
  display: flex;
  margin-top: 3rem;
`;

const LineGraph = styled.div`
  display: flex;
  gap: 0.7rem;

  .left__line {
    display: flex;
    width: 55rem;
    height: 23rem;
    padding: 1.5rem;
    border: 1px solid #c2c2c2;
    border-radius: 4px;

    h5 {
      font-size: 1.3rem;
      font-weight: 400;
      margin-bottom: 1rem;
    }

    .left__money {
      font-size: 1.8rem;
      font-weight: 600;
    }

    .left__compare {
      margin-top: 1.5rem;
      font-size: 1rem;
      color: #464656;
    }

    span {
      font-size: 1rem;
      font-weight: 600;
      color: ${(props) => props.theme.COLORS.LIGHT_RED};
    }

    .label {
      font-size: 1rem;
    }

    .left {
      position: relative;
      width: 50%;
      height: 100%;
      border-right: 1px solid #c2c2c2;
    }

    .right {
      width: 50%;
      height: 100%;
      padding-left: 1.5rem;

      .bar {
        /* 기타 스타일 속성들 */
        display: flex;
        justify-content: center;
        gap: 2.5rem;
        height: 17rem;
        margin-top: 1.5rem;
        padding: 0 2rem;
        white-space: nowrap;
      }
    }
  }

  .right__line {
    width: 42rem;
    height: 23rem;
    padding: 1.5rem;
    border: 1px solid #c2c2c2;
    border-radius: 4px;

    h5 {
      font-size: 1.3rem;
      font-weight: 400;
      margin-bottom: 1rem;
    }

    .bar {
      /* 기타 스타일 속성들 */
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      height: 17rem;
      margin-top: 1.5rem;
      padding: 0 2rem;
      white-space: nowrap;
    }
  }
`;

const LastTwoBarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;

  @keyframes fade-in1 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    animation: fade-in1 1s ease-in-out forwards;
    border-radius: 4px;
    width: 2.8rem;
    height: ${(props) => props.height}%;
    background: #bfbbbb;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const LastBarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;

  @keyframes fade-in2 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    animation: fade-in2 1s ease-in-out forwards;
    border-radius: 4px;
    width: 2.8rem;
    height: ${(props) => props.height}%;
    background: #bfbbbb;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const BarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in3 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    border-radius: 4px;
    width: 2.8rem;
    animation: fade-in3 1s ease-in-out forwards;
    background: ${(props) => props.theme.COLORS.LIGHT_RED};
    height: ${(props) => props.height}%;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const FirstWeekBarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in4 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    border-radius: 4px;
    width: 2.8rem;
    height: ${(props) => props.height}%;
    animation: fade-in4 1s ease-in-out forwards;
    background: ${(props) => props.theme.COLORS.LIGHT_GREEN};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const SecondWeekBarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in5 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    border-radius: 4px;
    width: 2.8rem;
    animation: fade-in5 1s ease-in-out forwards;
    background: ${(props) => props.theme.COLORS.LIGHT_GREEN};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const ThirdWeekBarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in6 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    border-radius: 4px;
    width: 2.8rem;
    animation: fade-in6 1s ease-in-out forwards;
    background: ${(props) => props.theme.COLORS.LIGHT_GREEN};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const FourthWeekBarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in7 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    border-radius: 4px;
    width: 2.8rem;
    animation: fade-in7 1s ease-in-out forwards;
    background: ${(props) => props.theme.COLORS.LIGHT_GREEN};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const FifthWeekBarList = styled.li<{ height: string }>`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;

  @keyframes fade-in8 {
    0% {
      height: 0px;
    }
    100% {
      height: ${(props) => props.height}%;
    }
  }

  div {
    border-radius: 4px;
    width: 2.8rem;
    animation: fade-in8 1s ease-in-out forwards;
    background: ${(props) =>
      isNaN(Number(props.height)) ? "#bfbbbb" : props.theme.COLORS.LIGHT_GREEN};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 600;

    color: #444444;

    &:nth-child(3) {
      font-size: 1rem;
      font-weight: 400;
      margin-top: 0.7rem;
    }
  }
`;

const BottomContainer = styled.div`
  width: 100%;
  height: 25rem;
  display: flex;
  gap: 0.7rem;
  margin-top: 3rem;
`;

const Doughnut = styled.div`
  position: relative;
  margin-top: 1.5rem;
  border: 1px solid #c2c2c2;
  border-radius: 4px;
  padding: 1.5rem;
  width: 42%;
  height: 100%;

  h5 {
    font-size: 1.3rem;
    font-weight: 400;
    margin-bottom: 1rem;
  }

  .pieChart__info {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const Budget = styled.div`
  margin-top: 1.5rem;
  border: 1px solid #c2c2c2;
  border-radius: 4px;
  padding: 1.5rem;
  width: 27%;
  height: 100%;

  h5 {
    font-size: 1.3rem;
    font-weight: 400;
    margin-bottom: 1rem;
  }

  .bar__percentage {
    font-size: 2.2rem;
    font-weight: 600;
    color: ${(props) => props.theme.COLORS.LIGHT_GREEN};
    margin-bottom: 1rem;
  }

  .bar__budget {
    font-size: 1.4rem;
    color: #6f6f76;
  }
`;

const Waste = styled.div`
  margin-top: 1.5rem;
  border: 1px solid #c2c2c2;
  border-radius: 4px;
  padding: 1.5rem;
  width: 30%;
  height: 100%;

  .null__container {
    width: 100%;
    height: 16rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.05rem;
    color: rgb(98, 98, 115);
  }

  h5 {
    font-size: 1.3rem;
    font-weight: 400;
    margin-bottom: 1rem;
  }

  .waste__container {
    margin-top: 1.5rem;
    width: 100%;
  }

  .waste__header {
    width: 100%;
    border: 1px solid #c9c5c5;
    display: flex;

    > div {
      padding: 0.3rem;
      font-size: 1.3rem;
      font-weight: 600;
      color: #464656;
      width: 50%;

      &:first-child {
        border-right: 1px solid #c9c5c5;
      }
    }
  }

  .waste__ul {
    height: 17rem;
    overflow-y: scroll;
  }

  .waste__lists {
    width: 100%;
    display: flex;
    margin: 0.5rem 0;

    > div {
      padding: 0.3rem;
      font-size: 1.3rem;
      font-weight: 600;
      color: #464656;
      width: 50%;
    }
  }
`;
