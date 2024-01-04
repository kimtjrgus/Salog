import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { styled } from "styled-components";

interface calendarType {
	date: string;
	totalOutgo: number;
	totalIncome: number;
}

const DashboardCalendar = () => {
	const [value, onChange] = useState(new Date());
	const [calendar, setCalendar] = useState<calendarType[]>([]);

	useEffect(() => {
		axios
			.get("http://localhost:8000/getCalendar")
			.then((res) => {
				setCalendar(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

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
				value={value}
				next2Label={null}
				prev2Label={null}
				formatDay={(locale, date) =>
					new Date(date).toLocaleDateString("en-us" || locale, {
						day: "numeric",
					})
				}
				tileContent={({ date }) => {
					const arr = [];
					if (
						calendar.find((x) => x.date === moment(date).format("YYYY-MM-DD"))
					) {
						arr.push(
							calendar.find(
								(x) => x.date === moment(date).format("YYYY-MM-DD"),
							),
						);
						return (
							<>
								<div className="calendar__tileContent">
									<p className="tileContent__income">{arr[0]?.totalIncome}</p>
									<p className="tileContent__outgo">{arr[0]?.totalOutgo}</p>
								</div>
							</>
						);
					}
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
        display: flex;
        align-items:center;
        margin-top: 2rem;
        margin-left: 1.5rem;
        font-size: 1.2rem;
        position: absolute;

        .income {
            margin-left: 1rem;
            border-radius: 50%;
            width: 9px;
            height: 9px;
            background: ${(props) => props.theme.COLORS.LIGHT_RED}
        }

        .outgo {
              margin-left: 1rem;
            border-radius: 50%;
            width: 9px;
            height: 9px;
            background: ${(props) => props.theme.COLORS.LIGHT_GREEN}
        }

        p {
            margin-left: 0.5rem;
        }
    }

	.react-calendar {
		width: 770px;
		border: none;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #d9d9d9;
		font-family: "Pretendard-Regular";

    .calendar__tileContent {
        position: absolute;
        margin-top: 1.4rem;
    }

        .tileContent__income{
            font-size: 1rem;
            line-height: 24px;
            color: ${(props) => props.theme.COLORS.LIGHT_GREEN}
        }

        .tileContent__outgo {
            font-size: 1rem;
            line-height: 4px;
            color: ${(props) => props.theme.COLORS.LIGHT_RED}
        }
	}

	.react-calendar__navigation {
		height: 25px;
		border-radius: 20px 20px 0 0;
        justify-content: center;

		span {
			font-size: 1.6rem;
			font-weight: 600;
		}
	}

    .react-calendar__navigation button {
        max-width: 200px;
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
		height: 68px;
		border-bottom: 1px solid #eeeeee;
        display: flex;
        align-self: start;
		text-align: left;
s	}

	.react-calendar__tile:enabled:hover,
	.react-calendar__tile:enabled:focus,
	.react-calendar__tile--active {
		background: rgb(245, 245, 249);
	}

	.react-calendar__tile--now {
		background: none;
		color: #000;
	}
`;
