import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import { type diaryType } from ".";
import PropTypes, { type InferProps } from "prop-types";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";

interface MyComponentProps {
  diaries: diaryType[];
}

const CalendarComponent: React.FC<MyComponentProps> = ({ diaries }) => {
  const [value, onChange] = useState(new Date());

  const path = useLocation().pathname;
  // const search = useLocation().search;
  const navigate = useNavigate();

  const onClickDayTile = (date: Date) => {
    const selectedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dateString = selectedDate.toISOString().split("T")[0];
    navigate(`${path}?date=${dateString}`);
  };

  return (
    <Container>
      <Calendar
        onChange={(value) => {
          onChange(value as Date);
        }}
        value={value}
        formatDay={(locale, date) =>
          new Date(date).toLocaleDateString("en-us" || locale, {
            day: "numeric",
          })
        }
        tileClassName={({ date, view }) => {
          if (view === "month") {
            if (
              diaries.find((x) => x.date === moment(date).format("YYYY-MM-DD"))
            ) {
              return "highlight";
            }
          }
        }}
        onClickDay={onClickDayTile}
      />
    </Container>
  );
};

CalendarComponent.propTypes = {
  diaries: PropTypes.arrayOf(
    PropTypes.shape({
      diaryId: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      img: PropTypes.string.isRequired,
      tagList: PropTypes.arrayOf(
        PropTypes.shape({
          diaryTagId: PropTypes.number.isRequired,
          tagName: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired as InferProps<MyComponentProps>["diaries"],
};

const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 5rem;

  .react-calendar {
    font-size: 1.6rem; // 반응형
    border: none;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #c6c6d0;
    font-family: "Pretendard-Regular";
  }

  .react-calendar__navigation {
    height: 3rem;
    border-radius: 20px 20px 0 0;

    span {
      font-size: 1.6rem;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  .react-calendar__month-view__weekdays {
    abbr {
      // 텍스트 부분
      font-size: 1.2rem;
      font-weight: 700;
    }
  }

  .react-calendar__tile {
    border: 1px solid #eeeeee;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus,
  .react-calendar__tile--active {
    background: #3c64f3;
    color: #ffffff;
  }

  .hQozOV .react-calendar__tile:enabled:hover,
  .hQozOV .react-calendar__tile:enabled:focus,
  .hQozOV .react-calendar__tile--active {
    color: black;
  }

  .react-calendar__tile--now {
    background: none;
    color: #000;
  }

  .highlight {
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    color: #eee;
  }
`;

export default CalendarComponent;
