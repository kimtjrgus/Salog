import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import dateAsKor from "src/utils/dateAsKor";
import ReactQuill from "react-quill";
import { QuillContainer } from "../diary_write/TextEditor";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "src/utils/refreshToken";
import Modal from "src/components/Layout/Modal";
import { type incomeType, type outgoType } from "../income_outgo";

interface detailType {
  diaryId: number;
  date: string;
  title: string;
  body: string;
  img: string;
  tagList: TagList[];
  // 가계부 관련 타입도 추가 예정
}

interface TagList {
  diaryTagId: number;
  tagName: string;
}

const DiaryDetail = () => {
  const [diary, setDiary] = useState<detailType>({
    diaryId: 0,
    date: "",
    title: "",
    body: "",
    img: "",
    tagList: [],
  });

  const [outgo, setOutgo] = useState<outgoType[]>([]);
  const [income, setIncome] = useState<incomeType[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const id = useParams().id;
  const navigate = useNavigate();

  const sumOfOutgo = () => {
    let sum = 0;
    outgo.forEach((el) => {
      sum += el.money;
    });
    return sum;
  };

  const sumOfIncome = () => {
    let sum = 0;
    income.forEach((el) => {
      sum += el.money;
    });
    return sum;
  };

  const onClickBackBtn = () => {
    navigate("/diary");
  };

  const onClickUpdateBtn = () => {
    navigate(`/diary/${id}/update`);
  };

  const onClickDeleteBtn = () => {
    setIsOpen(true);
  };

  const onClickCloseBtn = () => {
    api
      .delete(`/diary/delete/${id}`)
      .then(() => {
        navigate("/diary");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    api
      .get(`/diary/${id}`)
      .then((res) => {
        setDiary(res.data);
        api
          .get(`/outgo?page=1&size=15&date=${res.data.date}`)
          .then((res) => {
            setOutgo(res.data.data);
          })
          .catch((error) => {
            console.log(error);
          });
        api
          .get(`/income?page=1&size=15&date=${res.data.date}`)
          .then((res) => {
            setIncome(res.data.data);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <Container>
        <DetailContainer>
          <div className="go_back" onClick={onClickBackBtn}>
            <SvgIcon
              component={ChevronLeftOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 1 }}
            />
            <p>일기 조회로 돌아가기</p>
          </div>
          <h2>{diary?.title}</h2>
          <div className="diary_header">
            <div className="diary_subtitle">
              <SvgIcon
                component={CategoryOutlinedIcon}
                sx={{ stroke: "#ffffff", strokeWidth: 1 }}
              />
              {diary?.tagList.map((tag, idx) => (
                <span key={tag.diaryTagId}>
                  {diary?.tagList.length - 1 !== idx
                    ? `${tag.tagName},`
                    : `${tag.tagName} `}
                </span>
              ))}
            </div>
            <div className="diary_subtitle">
              <SvgIcon
                component={ScheduleOutlinedIcon}
                sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
              />
              <span>
                {diary?.date !== undefined ? dateAsKor(diary?.date) : null}
              </span>
            </div>
            <div className="update_delete">
              <span onClick={onClickUpdateBtn}>수정</span>
              <span onClick={onClickDeleteBtn}>삭제</span>
            </div>
          </div>
          <hr />
          <Quill>
            <ReactQuill theme="snow" value={diary?.body} readOnly={true} />
          </Quill>
        </DetailContainer>
        <BookContainer>
          <h3>작성한 가계부</h3>
          <div className="outgo__lists">
            <h5>{`지출 : ${outgo.length}건`}</h5>
            <div className="lists__header">
              <p>카테고리</p>
              <p>거래처</p>
              <p>금액</p>
            </div>
            <ul className="lists">
              {outgo.length === 0 ? (
                <p className="null__p">지출 내역이 존재하지 않습니다.</p>
              ) : (
                outgo.map((el) => {
                  return (
                    <li className="list" key={el.outgoId}>
                      <p>{el.outgoTag.tagName}</p>
                      <div
                        className={`${
                          el.outgoName.length > 10 ? "over__div" : "under__div"
                        }`}
                      >
                        <p>{el.outgoName}</p>
                      </div>
                      <p>{el.money.toLocaleString()}원</p>
                    </li>
                  );
                })
              )}
            </ul>
            <p className="bottom__p">{`총 ${sumOfOutgo().toLocaleString()}원`}</p>
          </div>
          <div className="outgo__lists income">
            <h5>{`수입 : ${income.length}건`}</h5>
            <div className="lists__header">
              <p>카테고리</p>
              <p>거래처</p>
              <p>금액</p>
            </div>
            <ul className="lists">
              {income.length === 0 ? (
                <p className="null__p">수입 내역이 존재하지 않습니다.</p>
              ) : (
                income.map((el) => {
                  return (
                    <li className="list" key={el.incomeId}>
                      <p>{el.incomeTag.tagName}</p>
                      <div
                        className={`${
                          el.incomeName.length > 10 ? "over__div" : "under__div"
                        }`}
                      >
                        <p>{el.incomeName}</p>
                      </div>
                      <p>{el.money.toLocaleString()}원</p>
                    </li>
                  );
                })
              )}
            </ul>
            <p className="bottom__p">{`총 ${sumOfIncome().toLocaleString()}원`}</p>
          </div>
        </BookContainer>
      </Container>
      <Modal
        state={isOpen}
        setState={setIsOpen}
        msgTitle="작성한 글을 삭제하시겠습니까?"
        msgBody="삭제한 글은 복구할 수 없습니다."
      >
        <button
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
        >
          취소
        </button>
        <button onClick={onClickCloseBtn}>확인</button>
      </Modal>
    </>
  );
};

const Container = styled.div`
  width: 92%;
  display: flex;
  height: 90vh;
  overflow: scroll;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    height: 50%; /* 스크롤바의 길이 */
  }
`;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 75rem;

  .go_back {
    width: 20%;
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    cursor: pointer;

    svg {
      font-size: 2.4rem;
      transition: all 0.5s;
    }

    p {
      font-size: 1.4rem;
      align-self: center;
      transition: all 0.5s;
      white-space: nowrap;
    }

    &:hover {
      svg,
      p {
        transform: scale(1.03);
      }
    }
  }

  h2 {
    text-align: center;
    margin-top: 2.5rem;
    font-size: 2rem;
  }

  .diary_header {
    display: flex;
    position: relative;
    gap: 5rem;
    justify-content: center;
    margin-top: 3rem;
  }

  .diary_subtitle {
    display: flex;

    svg {
      font-size: 1.8rem;
      margin-right: 0.5rem;
    }

    span {
      align-self: center;
      font-size: 1.4rem;
      margin-right: 0.3rem;
    }
  }

  .update_delete {
    position: absolute;
    right: 0;
    span {
      margin-right: 1rem;
      color: ${(props) => props.theme.COLORS.GRAY_500};
      font-size: 1.4rem;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  hr {
    margin-top: 3rem;
    margin-bottom: 3rem;
    border: none;
    width: 100%;
    height: 1px;
    background-color: ${(props) => props.theme.COLORS.GRAY_300};
  }
`;

const Quill = styled(QuillContainer)`
  .ql-toolbar {
    display: none;
  }

  .ql-editor {
    padding: 12px 2rem;
  }
`;

export const BookContainer = styled.div`
  width: 34.5rem;
  height: 75vh;
  margin: 0 auto;
  margin-top: 5rem;
  padding: 2rem;

  > h3 {
    font-size: 1.4rem;
    color: #464656;
    text-align: center;
  }

  .outgo__lists {
    width: 100%;
    height: 20rem;
    border-radius: 8px;
    margin-top: 1rem;
    border: 1px solid #c5c5c5;
    border-top: none;
    > h5 {
      padding: 0.5rem 0;
      border-radius: 8px 8px 0px 0px;
      font-size: 1.2rem;
      text-align: center;
      color: white;
      background: ${(props) => props.theme.COLORS.LIGHT_RED};
    }

    .lists__header {
      display: flex;
      gap: 2.5rem;
      padding: 0.5rem 1.5rem;

      > p {
        font-size: 1.2rem;
        font-weight: 600;
        text-decoration: underline;

        &:nth-child(2) {
          width: 10rem;
        }
      }
    }

    .lists {
      border-bottom: 1px solid #c5c5c5;
      height: 13rem;
      overflow-y: scroll;
      .null__p {
        display: flex;
        margin-top: 5rem;
        justify-content: center;
        align-items: center;
        font-size: 1.2rem;
        color: gray;
      }

      .list {
        display: flex;
        gap: 2.5rem;
        padding: 0.7rem 1.5rem;

        > p {
          font-size: 1.2rem;
          &:first-child {
            width: 4rem;
          }
        }

        @keyframes scroll {
          0% {
            transform: translateX(25%);
          }
          100% {
            transform: translateX(-70%);
          }
        }

        .over__div {
          width: 10rem;
          overflow: hidden;

          > p {
            font-size: 1.2rem;
            animation: 5s linear 1s infinite normal none running scroll;
            animation-delay: 2s;
            white-space: nowrap;
          }
        }

        .under__div {
          width: 10rem;

          > p {
            font-size: 1.2rem;
            white-space: nowrap;
          }
        }
      }
    }

    .bottom__p {
      font-size: 1.2rem;
      display: flex;
      justify-content: flex-end;
      margin-right: 2rem;
      margin-top: 0.5rem;
    }
  }

  .income {
    > h5 {
      background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }
`;

export default DiaryDetail;
