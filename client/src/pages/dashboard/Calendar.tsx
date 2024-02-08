import moment from "moment";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { api } from "src/utils/refreshToken";
import { styled } from "styled-components";
import { type incomeType, type outgoType, type modalType } from ".";

interface calendarType {
  date: string;
  totalOutgo: number;
  totalIncome: number;
}

interface propsType {
  isOpen: modalType;
  setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
  monthlyOutgo: outgoType;
  monthlyIncome: incomeType;
}

const DashboardCalendar = ({
  isOpen,
  setIsOpen,
  monthlyOutgo,
  monthlyIncome,
}: propsType) => {
  const [value, onChange] = useState(new Date());

  const [calendar, setCalendar] = useState<calendarType[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date(value));

  // 캘린더의 시작일을 상태에 저장함
  const getActiveMonth = (activeStartDate: Date | null) => {
    setStartDate(activeStartDate);
  };

  const onClickTile = (value: Date) => {
    setIsOpen({
      ...isOpen,
      dayTile: true,
      day: moment(new Date(value)).format("YYYY-MM-DD"),
    });
  };

  const onClickWriteBtn = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent> | undefined,
    date: { date: Date }
  ) => {
    e?.stopPropagation();
    setIsOpen({
      ...isOpen,
      writeIcon: true,
      day: moment(new Date(date.date)).format("YYYY-MM-DD"),
    });
  };

  useEffect(() => {
    api
      .get(`/calendar?date=${moment(startDate).format("YYYY-MM-DD")}`)
      .then((res) => {
        setCalendar(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [startDate, monthlyIncome, monthlyOutgo]);

  return (
    <Container>
      <div className="color__info">
        <div className="income"></div>
        <p>지출</p>
        <div className="outgo"></div>
        <p>수입</p>
      </div>
      <Calendar
        onChange={(value) => {
          onChange(value as Date);
        }}
        onClickDay={(value) => {
          onClickTile(value);
        }}
        value={value}
        next2Label={null}
        prev2Label={null}
        minDetail="month" // 상단 네비게이션에서 '월' 단위만 보이게 설정
        maxDetail="month" // 상단 네비게이션에서 '월' 단위만 보이게 설정
        showNeighboringMonth={false} //  이전, 이후 달의 날짜는 보이지 않도록 설정
        onActiveStartDateChange={({ activeStartDate }) => {
          getActiveMonth(activeStartDate);
        }}
        formatDay={(locale, date) =>
          new Date(date).toLocaleDateString("en-us" || locale, {
            day: "numeric",
          })
        }
        tileContent={({ date }) => {
          const arr = [];
          // 기록된 가계부가 있다면 해당 일의 지출, 수입 표시
          if (
            calendar.find((x) => x.date === moment(date).format("YYYY-MM-DD"))
          ) {
            arr.push(
              calendar.find((x) => x.date === moment(date).format("YYYY-MM-DD"))
            );
            return (
              <>
                <div className="calendar__tileContent">
                  {arr[0]?.totalIncome !== 0 && (
                    <p className="tileContent__income">{arr[0]?.totalIncome}</p>
                  )}
                  {arr[0]?.totalOutgo !== 0 && (
                    <p className="tileContent__outgo">{arr[0]?.totalOutgo}</p>
                  )}
                </div>
                <Wrapper
                  $buttonDisplay={
                    new Date(date).getFullYear() === new Date().getFullYear() &&
                    new Date(date).getMonth() === new Date().getMonth() &&
                    new Date(date).getDate() === new Date().getDate()
                  }
                  data-cy={`calendar-day-${new Date(date).getDate()}`}
                >
                  <span
                    className="write__icon"
                    onClick={(e) => {
                      onClickWriteBtn(e, { date });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="-0.5 -0.5 24 24"
                    >
                      <path
                        fill="#85b6ff"
                        d="m21.289.98l.59.59c.813.814.69 2.257-.277 3.223L9.435 16.96l-3.942 1.442c-.495.182-.977-.054-1.075-.525a.928.928 0 0 1 .045-.51l1.47-3.976L18.066 1.257c.967-.966 2.41-1.09 3.223-.276zM8.904 2.19a1 1 0 1 1 0 2h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a1 1 0 0 1 2 0v4a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4z"
                      />
                    </svg>
                  </span>
                </Wrapper>
              </>
            );
          }
          // 오늘 날짜에 가계부 수정 아이콘 표시
          if (
            new Date(date).getFullYear() === new Date().getFullYear() &&
            new Date(date).getMonth() === new Date().getMonth() &&
            new Date(date).getDate() === new Date().getDate()
          ) {
            return (
              <div
                className="write__icon"
                onClick={(e) => {
                  onClickWriteBtn(e, { date });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="-0.5 -0.5 24 24"
                >
                  <path
                    fill="#85b6ff"
                    d="m21.289.98l.59.59c.813.814.69 2.257-.277 3.223L9.435 16.96l-3.942 1.442c-.495.182-.977-.054-1.075-.525a.928.928 0 0 1 .045-.51l1.47-3.976L18.066 1.257c.967-.966 2.41-1.09 3.223-.276zM8.904 2.19a1 1 0 1 1 0 2h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a1 1 0 0 1 2 0v4a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4z"
                  />
                </svg>
              </div>
            );
          }

          return (
            <Wrapper
              $buttonDisplay={
                new Date(date).getFullYear() === new Date().getFullYear() &&
                new Date(date).getMonth() === new Date().getMonth() &&
                new Date(date).getDate() === new Date().getDate()
              }
              data-cy={`calendar-day-${new Date(date).getDate()}`}
            >
              <span
                className="write__icon"
                onClick={(e) => {
                  onClickWriteBtn(e, { date });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="-0.5 -0.5 24 24"
                >
                  <path
                    fill="#85b6ff"
                    d="m21.289.98l.59.59c.813.814.69 2.257-.277 3.223L9.435 16.96l-3.942 1.442c-.495.182-.977-.054-1.075-.525a.928.928 0 0 1 .045-.51l1.47-3.976L18.066 1.257c.967-.966 2.41-1.09 3.223-.276zM8.904 2.19a1 1 0 1 1 0 2h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a1 1 0 0 1 2 0v4a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4z"
                  />
                </svg>
              </span>
            </Wrapper>
          );
        }}

        // onClickDay={onClickDayTile}
      />
    </Container>
  );
};

export default DashboardCalendar;

const Container = styled.div`
	margin-left: 2.1rem;
	margin-bottom: 5rem;

    .color__info {
		z-index: 3;
        display: flex;
        align-items:center;
        margin-top: 2.2rem;
        margin-left: 1.5rem;
        font-size: 1.2rem;
        position: absolute;

        .income {
            margin-left: 1rem;
            border-radius: 50%;
            width: 0.9rem;
            height: 0.9rem;
            background: ${(props) => props.theme.COLORS.LIGHT_RED}
        }

        .outgo {
              margin-left: 1rem;
            border-radius: 50%;
            width: 0.9rem;
            height: 0.9rem;
            background: ${(props) => props.theme.COLORS.LIGHT_GREEN}
        }

        p {
            margin-left: 0.5rem;
        }
    }

    .write__icon {
        margin-left: 6.5rem;
		z-index: 100;

        &:hover {
            transition: all 0.5s;
            transform: scale(1.1);
        }
    }

	.react-calendar {
    font-size: 1.6rem; // 반응형으로 해야함
		width: 77rem;
		height: 42.8rem;
		overflow-y: scroll;
		padding: 0 1.5rem;
		border-radius: 8px;
		border: 1px solid #d9d9d9;
		font-family: "Pretendard-Regular";

    .calendar__tileContent {
        position: absolute;
		width: 10rem;
		height: 3.8rem;
        margin-top: 1.4rem;
    }

        .tileContent__income{
            font-size: 1rem;
            line-height: 10px;
			margin-top: 0.5rem;
            color: ${(props) => props.theme.COLORS.LIGHT_GREEN}
        }

        .tileContent__outgo {
            font-size: 1rem;
            line-height: 10px;
			margin-top: 0.5rem;
            color: ${(props) => props.theme.COLORS.LIGHT_RED}
        }

		&::-webkit-scrollbar {
  			display: none;
		}
	}

	.react-calendar__navigation {
		display:flex;
		align-items: flex-end;
		height: 3.5rem;
		z-index: 2;
		position: sticky;
		top:0;
		background: white;
        justify-content: center;

		span {
			font-size: 1.6rem;
			font-weight: 600;
		}
	}

    .react-calendar__navigation button {
        max-width: 20rem;
    }

    .react-calendar__navigation button:disabled{
        background: none;
        cursor: auto;
    }

    .react-calendar__navigation button:enabled:focus{
        background: none;
    }

	.react-calendar__month-view__weekdays {
		text-align: left;
		abbr {
			// 텍스트 부분
			font-size: 1.2rem;
			font-weight: 700;
		}
	}

	.react-calendar__tile {
		height: 6.8rem;
		border-bottom: 1px solid #eeeeee;
        display: flex;
        align-self: start;
		text-align: left;
s	}

	.react-calendar__tile:enabled:hover,
	.react-calendar__tile:enabled:focus,
	 {
		background: rgb(245, 245, 249);
	}

	.react-calendar__tile--active{
		background: transparent;
	}

    .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus{
        background: rgb(245, 245, 249);
        color: ${(props) => props.theme.COLORS.LIGHT_BLUE};

    }

	.react-calendar__tile--active {
		color: black;
	}


	.react-calendar__tile--now {
		background: none;
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	}
`;

const Wrapper = styled.div<{ $buttonDisplay: boolean }>`
  ${({ $buttonDisplay }) => `
    span {
      display: ${$buttonDisplay ? "flex" : "none"};
    }

    &:hover span {
      display: flex;
    }
  `}
  width: 100%;
  height: 100%;
  z-index: 1;
`;
