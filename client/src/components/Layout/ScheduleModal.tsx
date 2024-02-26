import { List } from "src/pages/dashboard/Schedule";
import { api } from "src/utils/refreshToken";
import { styled } from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { showToast } from "src/store/slices/toastSlice";
import { useDispatch } from "react-redux";

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

interface modalType {
  alarm: boolean;
  schedule: boolean;
  outgo: outgoType[];
  income: incomeType[];
}

interface Props {
  isOpen: modalType;
  setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
}

const ScheduleModal = ({ isOpen, setIsOpen }: Props) => {
  const dispatch = useDispatch();

  // 모달의 취소 버튼을 누르면
  const onClickCloseBtn = async () => {
    if (isOpen.outgo.length !== 0) {
      try {
        await Promise.all(
          isOpen.outgo.map(async (el) => {
            // 날짜 문자열을 Date 객체로 변환
            const date = new Date(el.date);
            // 월을 하나 추가
            date.setMonth(date.getMonth() + 1);
            // Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
            const dateString = date.toISOString().split("T")[0];

            return await api.patch(`/fixedOutgo/update/${el.fixedOutgoId}`, {
              date: dateString,
              money: Number(el.money),
              outgoName: el.outgoName,
            });
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
    if (isOpen.income.length !== 0) {
      try {
        await Promise.all(
          isOpen.income.map(async (el) => {
            // 날짜 문자열을 Date 객체로 변환
            const date = new Date(el.date);
            // 월을 하나 추가
            date.setMonth(date.getMonth() + 1);
            // Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
            const dateString = date.toISOString().split("T")[0];

            return await api.patch(`/fixedIncome/update/${el.fixedIncomeId}`, {
              date: dateString,
              money: Number(el.money),
              outgoName: el.incomeName,
            });
          })
        );
      } catch (error) {
        console.error(error);
      }
    }

    // 일정을 현재 달 + 1 해야함
    setIsOpen((prev) => {
      return { ...prev, schedule: false };
    });
  };

  // 모달의 확인 버튼을 누르면
  const onClickPlusBtn = async () => {
    // 가계부에 추가해야함
    if (isOpen.outgo.length !== 0) {
      try {
        await Promise.all(
          // 400 에러 해결해야함
          isOpen.outgo.map(async (el) => {
            return await api.post("/outgo/post", {
              date: el.date,
              outgoName: el.outgoName,
              money: Number(el.money),
              memo: "",
              outgoTag: "고정지출",
              wasteList: false,
              payment: "카드",
              receiptImg: "",
            });
          })
        );
        onClickCloseBtn().catch((error) => {
          console.log(error);
        });
        dispatch(
          showToast({
            message: "작성이 완료되었습니다",
            type: "success",
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
    if (isOpen.income.length !== 0) {
      try {
        await Promise.all(
          isOpen.income.map(async (el) => {
            return await api.post("/income/post", {
              date: el.date,
              incomeName: el.incomeName,
              money: Number(el.money),
              memo: "",
              incomeTag: "고정수입",
              receiptImg: "",
            });
          })
        );
        onClickCloseBtn().catch((error) => {
          console.log(error);
        });
        dispatch(
          showToast({
            message: "작성이 완료되었습니다",
            type: "success",
          })
        );
      } catch (error) {
        console.error(error);
      }
    }

    // setIsOpen((prev) => {
    //   return { ...prev, schedule: false };
    // });
  };

  return (
    <Background>
      <Container>
        <div className="main">
          <header>
            <h3>오늘의 금융 일정이 있습니다.</h3>
            <p>
              고정 지출 및 수입 항목을 가계부에
              <br /> 추가하시겠습니까?
            </p>
            <span>* 취소를 누르더라도 해당 일정들은 다음 달로 이월됩니다.</span>
          </header>
          <div className="schedule">
            {isOpen.outgo.map((el) => {
              return (
                <List key={uuidv4()} $date={el.date}>
                  <div className="list__day__outgo">
                    {new Date(el.date).getDate()}일
                  </div>
                  <div className="list__write__outgo">
                    <p>{el.outgoName}</p>
                    <p>
                      {el.money.toLocaleString()}원 / <span>지출</span>
                    </p>
                  </div>
                </List>
              );
            })}
            {isOpen.income.map((el) => {
              return (
                <List key={uuidv4()} $date={el.date}>
                  <div className="list__day__income">
                    {new Date(el.date).getDate()}일
                  </div>
                  <div className="list__write__income">
                    <p>{el.incomeName}</p>
                    <p>
                      {el.money.toLocaleString()}원 / <span>수입</span>
                    </p>
                  </div>
                </List>
              );
            })}
          </div>
        </div>
        <div className="buttons">
          <button onClick={onClickCloseBtn}>취소</button>
          <button onClick={onClickPlusBtn}>확인</button>
        </div>
      </Container>
    </Background>
  );
};

export default ScheduleModal;

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
`;

const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 65rem;
  height: 35rem;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 4px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  padding: 4rem 5rem;

  .main {
    display: flex;
    width: 100%;

    > header {
      width: 50%;
      margin-right: 5rem;

      > h3 {
        font-size: 2rem;
        /* text-align: center; */
        margin-bottom: 3rem;
      }
      > p {
        font-size: 1.5rem;
        margin-bottom: 9rem;
        /* text-align: center; */
        line-height: 2rem;
        font-weight: 500;
        color: #4a4949;
      }

      > span {
        font-size: 1.1rem;
        text-align: center;
        color: ${(props) => props.theme.COLORS.LIGHT_RED};
      }
    }

    .schedule {
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      padding: 0 1rem;
      padding-bottom: 1rem;
      width: 45%;
      height: 20rem;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        width: 3px; /* 스크롤바의 너비 */
        background-color: transparent; /* 스크롤바 배경색을 투명으로 설정 */
      }

      &::-webkit-scrollbar-thumb {
        height: 30%; /* 스크롤바의 길이 */
        background: ${(props) =>
          props.theme.COLORS.LIGHT_BLUE}; /* 스크롤바의 색상 */
      }

      &::-webkit-scrollbar-track {
        background: rgba(33, 122, 244, 0.1); /*스크롤바 뒷 배경 색상*/
      }
    }
  }

  .buttons {
    margin-top: 4rem;
    display: flex;
    gap: 7rem;

    > button {
      font-size: 1.2rem;
      cursor: pointer;
      width: 100%;
      border-radius: 4px;
      padding: 0.8rem 0.5rem;
      color: #6788fe;
      background: #ccd7fe;

      &:first-child {
        background-color: ${(props) => props.theme.COLORS.GRAY_300};
        color: ${(props) => props.theme.COLORS.GRAY_600};
      }
    }
  }
`;
