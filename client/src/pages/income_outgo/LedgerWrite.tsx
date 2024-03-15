import { SvgIcon } from "@mui/material";
import { styled } from "styled-components";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
// import SimCardDownloadOutlinedIcon from "@mui/icons-material/SimCardDownloadOutlined";
import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "src/utils/timeFunc";
import {
  type ledgerType,
  type outgoType,
  type incomeType,
  type modalType,
  type PageInfoObj,
} from ".";
import { useDispatch } from "react-redux";
import { showToast } from "src/store/slices/toastSlice";
import { api } from "src/utils/refreshToken";
import type moment from "moment";
import { storage } from "src/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ReceiptModal, {
  type receiptType,
} from "src/components/Layout/ReceiptModal";
import Spinner from "../../assets/Rolling2-1s-21px.gif";

interface Props {
  isOpen: modalType;
  setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
  setLedger: React.Dispatch<React.SetStateAction<ledgerType[]>>;
  setIncome: React.Dispatch<React.SetStateAction<incomeType[]>>;
  setOutgo: React.Dispatch<React.SetStateAction<outgoType[]>>;
  setPageInfoObj: React.Dispatch<React.SetStateAction<PageInfoObj>>;
  getMoment: moment.Moment;
}

// type valuesType = Record<string, Record<string, string>>;

interface valueType {
  [key: string]: any;
  division: string;
  date: string;
  tag: string;
  name: string;
  payment: string;
  money: string;
  memo: string;
}

interface valuesType {
  [key: string]: any;
  id: number;
  division: string;
  date: string;
  tag: string;
  name: string;
  payment: string;
  money: string;
  memo: string;
}

interface UploadedInfo {
  name: string;
  size: string;
  type: string;
  imageUrl?: string;
}

const LedgerWrite = ({
  isOpen,
  setIsOpen,
  setLedger,
  setIncome,
  setOutgo,
  setPageInfoObj,
  getMoment,
}: Props) => {
  const [values, setValues] = useState<valuesType[]>([
    {
      id: 1,
      division: "",
      date: "",
      tag: "",
      name: "",
      payment: "",
      money: "",
      memo: "",
    },
  ]);
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo>({
    name: "",
    size: "",
    type: "",
  }); // 업로드 된 파일을 저장하는 상태

  const [receipt, setReceipt] = useState<receiptType>({
    date: "",
    money: 0,
    outgoName: "",
    receiptImg: "",
  });

  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false); // 파일 드래그 active 여부
  const [progress, setProgress] = useState(0); // 업로드 진행 상황
  const [isLoading, setIsLoading] = useState<boolean>(false); // 영수증 업로드 api 요청 시 로딩 상태
  const dispatch = useDispatch();

  const setFileInfo = (file: File) => {
    const { name, type } = file;
    const isImage = type.includes("image");
    const size = (file.size / (1024 * 1024)).toFixed(2) + "mb";

    if (!isImage) {
      setUploadedInfo({ name, size, type });
      return;
    }

    const storageRef = ref(storage, `receipt/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // 진행률 계산
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        // 에러 처리
        console.log(error);
      },
      () => {
        // 업로드 성공 시 URL 가져오기
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setUploadedInfo({ name, size, type, imageUrl: downloadURL });
            setProgress(0);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    );
  };

  const handleDropImage = (
    e: React.DragEvent<HTMLLabelElement | undefined>
  ) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    setFileInfo(file);
    setIsActive(false);
  };

  const handleUpload = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    console.log(target);

    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      target.value = "";
      setFileInfo(file); // 코드 추가
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    id: number
  ) => {
    const { name, value } = e.target;
    const updatedValues = values.map((item) => {
      if (item.id === id) {
        // value.division이 변경되었을 때 value.tag를 ""로 설정
        if (name === "division") {
          return {
            ...item,
            [name]: value,
            tag: "", // value.tag를 빈 문자열("")로 설정
            payment: "",
          };
        } else {
          return {
            ...item,
            [name]: value,
          };
        }
      }
      return item;
    });

    setValues(updatedValues);
  };

  // 영수증 업로드 모달에서 확인 버튼을 눌렀을 때 실행되는 함수
  const onClickBtn = () => {
    setIsLoading(true);
    api
      .post("/outgo/uploadImage", { receiptImageUrl: uploadedInfo.imageUrl })
      .then((res) => {
        setIsLoading(false);
        setReceipt(res.data);
        setIsOpen((prev) => {
          return { ...prev, uploadCheckModal: true };
        });
      })
      .catch(() => {
        alert("영수증 인식이 되지 않습니다. 다시 시도해주세요.");
        setUploadedInfo({ name: "", size: "", type: "" });
        setIsLoading(false);
      });
  };

  // 업로드 이후 내용 확인 모달에서 확인 버튼을 눌렀을 때 실행되는 함수
  const onClickCheckBtn = () => {
    const initialValues = {
      division: "outgo",
      date: receipt.date,
      tag: "",
      name: receipt.outgoName,
      payment: "카드",
      money: receipt.money.toString(),
      memo: "",
    };

    const newRow = {
      id: values.length !== 0 ? values[values.length - 1].id + 1 : 1,
      ...initialValues,
    };

    // 마지막 행의 속성들을 순회하여 전부 빈 값이면 덮어쓰기
    setValues((prevValues) => {
      // 마지막 요소가 모든 속성이 빈 문자열인지 확인 (id 제외)
      const isLastItemEmpty =
        prevValues.length !== 0 &&
        Object.entries(prevValues[prevValues.length - 1]).every(
          ([key, value]) => {
            return key === "id" ? true : value === "";
          }
        );

      if (isLastItemEmpty) {
        // 마지막 요소를 newRow로 대체
        return [...prevValues.slice(0, prevValues.length - 1), newRow];
      } else {
        // newRow를 배열에 추가
        return [...prevValues, newRow];
      }
    });

    setIsOpen((prev) => {
      return { ...prev, uploadModal: false, uploadCheckModal: false };
    });
  };

  const onClickPlusBtn = () => {
    const initialValues: valueType = {
      division: "",
      date: "",
      tag: "",
      name: "",
      payment: "",
      money: "",
      memo: "",
    };

    const newRow = {
      id: values.length !== 0 ? values[values.length - 1].id + 1 : 1,
      ...initialValues,
    };
    setValues((prevValues) => [...prevValues, newRow]);
  };

  const handleDeleteList = (id: number) => {
    const filter = values.filter((row) => row.id !== id);
    setValues([...filter]);
    // setValues((prevValues) => {
    // 	const { [id]: deletedValue, ...updatedValues } = prevValues;
    // 	return updatedValues;
    // });
  };

  const checkValues = useCallback(
    debounce((values: valuesType) => {
      let isBlank = false;
      let isNotValid = true;

      // 빈 값 체크
      values.forEach((value: valueType) => {
        for (const key in value) {
          if (value[key] === "") {
            if (key === "payment" && value.division === "income") {
              continue;
            }
            // 메모는 null 가능
            if (key === "memo" && value.memo === "") {
              continue;
            }
            isBlank = true;
          }
          if (key === "money" && value[key] === "0") isBlank = true;
        }
      });

      if (!isBlank) {
        isNotValid = false;
      }

      if (values.length === 0) {
        isNotValid = true;
      }

      setIsDisabled(isNotValid);
    }, 700),
    []
  );

  const onClickSubmit = async () => {
    try {
      await Promise.all(
        values.map(async (value) => {
          if (value.division === "outgo") {
            const res = await api.post("/outgo/post", {
              date: value.date,
              outgoName: value.name,
              money: Number(value.money),
              memo: value.memo,
              outgoTag: value.tag,
              wasteList: false,
              payment: value.payment,
              receiptImg: "",
            });

            if (
              new Date(res.data.date).getFullYear() ===
                new Date(getMoment.format("YYYY-MM-DD")).getFullYear() &&
              new Date(res.data.date).getMonth() + 1 ===
                new Date(getMoment.format("YYYY-MM-DD")).getMonth() + 1
            ) {
              setOutgo((prev: outgoType[]) => {
                return [...prev, res.data];
              });
              setPageInfoObj((prevPageInfoObj) => ({
                ...prevPageInfoObj,
                outgo: {
                  ...prevPageInfoObj.outgo,
                  totalElements: prevPageInfoObj.outgo.totalElements + 1,
                },
              }));
            }
          } else {
            const res = await api.post("/income/post", {
              date: value.date,
              incomeName: value.name,
              money: Number(value.money),
              memo: value.memo,
              incomeTag: value.tag,
              receiptImg: "",
            });

            if (
              new Date(res.data.date).getFullYear() ===
                new Date(getMoment.format("YYYY-MM-DD")).getFullYear() &&
              new Date(res.data.date).getMonth() + 1 ===
                new Date(getMoment.format("YYYY-MM-DD")).getMonth() + 1
            ) {
              setIncome((prev: incomeType[]) => {
                return [...prev, res.data];
              });
              setPageInfoObj((prevPageInfoObj) => ({
                ...prevPageInfoObj,
                income: {
                  ...prevPageInfoObj.income,
                  totalElements: prevPageInfoObj.income.totalElements + 1,
                },
              }));
            }
          }
        })
      );

      const date = getMoment.format("YYYY-MM");
      const customDate = `${date}-00`;

      const res = await api.get(
        `/calendar/ledger?page=1&size=10&date=${customDate}`
      );

      setLedger(res.data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        combined: res.data.pageInfo,
      }));

      setIsOpen((prev) => {
        const updated = { ...prev };
        return { ...updated, writeModal: false };
      });
      dispatch(
        showToast({ message: "작성이 완료되었습니다", type: "success" })
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkValues(values);
  }, [values]);

  return (
    <Background>
      <Container open={isOpen.uploadModal}>
        <SvgIcon
          className="deleteIcon"
          component={ClearOutlinedIcon}
          onClick={() => {
            setIsOpen((prev) => {
              const updated = { ...prev };
              return { ...updated, writeModal: false };
            });
          }}
          sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
        />
        <div className="header">
          <h3>가계부 작성하기</h3>
          <button
            onClick={() => {
              setIsOpen((prev) => {
                const updated = { ...prev };
                return { ...updated, uploadModal: true };
              });
            }}
          >
            영수증 업로드
          </button>
        </div>
        <div className="category__header">
          <p>분류</p>
          <p>날짜</p>
          <p>카테고리</p>
          <p>거래처</p>
          <p>결제수단</p>
          <p>금액</p>
          <p>메모</p>
        </div>
        <Lists>
          {values.map((value, idx) => {
            return (
              <li className="list" key={value.id}>
                <div className="select">
                  <select
                    className="category__select"
                    name="division"
                    value={value.division}
                    onChange={(e) => {
                      handleInputChange(e, value.id);
                    }}
                  >
                    <option value="">선택</option>
                    <option value="outgo">지출</option>
                    <option value="income">수입</option>
                  </select>
                  <SvgIcon
                    className="arrow__down"
                    component={ArrowDropDownOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                </div>
                <input
                  type="date"
                  className="date__select"
                  name="date"
                  value={value.date}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                />
                <div className="select">
                  <select
                    className="category__select"
                    // name={
                    // 	values[value.id]?.division === "outgo"
                    // 		? "outgoTag"
                    // 		: "incomeTag"
                    // }
                    name="tag"
                    value={value.tag}
                    onChange={(e) => {
                      handleInputChange(e, value.id);
                    }}
                  >
                    {value.division === "outgo" ? (
                      <>
                        <option value="">선택</option>
                        <option value="출금">출금</option>
                        <option value="식품">식비</option>
                        <option value="쇼핑">쇼핑</option>
                        <option value="취미">취미</option>
                        <option value="교통">교통</option>
                        <option value="통신">통신</option>
                        <option value="의류">의류</option>
                        <option value="뷰티">뷰티</option>
                        <option value="교육">교육</option>
                        <option value="여행">여행</option>
                      </>
                    ) : value.division === "income" ? (
                      <>
                        <option value="">선택</option>
                        <option value="입금">입금</option>
                        <option value="급여">급여</option>
                        <option value="이자">이자</option>
                        <option value="투자">투자</option>
                      </>
                    ) : (
                      <option value="">-</option>
                    )}
                    {/* {value.division === "outgo" ? (
                      <>
                        <option value="">선택</option>
                        <option value="출금">💰 출금</option>
                        <option value="식품">🍚 식비</option>
                        <option value="쇼핑">🛒 쇼핑</option>
                        <option value="취미">🕹️ 취미</option>
                        <option value="교통">🚗 교통</option>
                        <option value="통신">🛜 통신</option>
                        <option value="의류">👕 의류</option>
                        <option value="뷰티">💄 뷰티</option>
                        <option value="교육">📚 교육</option>
                        <option value="여행">✈️ 여행</option>
                      </>
                    ) : value.division === "income" ? (
                      <>
                        <option value="">선택</option>
                        <option value="입금">💰 입금</option>
                        <option value="급여">💸 급여</option>
                        <option value="이자">🏦 이자</option>
                        <option value="투자">📈 투자</option>
                      </>
                    ) : (
                      <option value="">-</option>
                    )} */}
                  </select>
                  <SvgIcon
                    className="arrow__down"
                    component={ArrowDropDownOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                </div>
                <input
                  type="text"
                  className="account__name"
                  name="name"
                  value={value.name}
                  maxLength={15}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                />
                <div className="select">
                  <select
                    className="category__select"
                    name="payment"
                    value={value.payment}
                    onChange={(e) => {
                      handleInputChange(e, value.id);
                    }}
                  >
                    {value.division === "outgo" ? (
                      <>
                        <option value="">선택</option>
                        <option value="현금">현금</option>
                        <option value="카드">카드</option>
                        <option value="이체">이체</option>
                      </>
                    ) : value.division === "income" ? (
                      <option value="">x</option>
                    ) : (
                      <option value="">-</option>
                    )}
                  </select>
                  <SvgIcon
                    className="arrow__down"
                    component={ArrowDropDownOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                </div>
                <input
                  className="account__name"
                  value={values[idx].money}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                  name="money"
                  type="number"
                />
                <input
                  type="text"
                  className="memo"
                  name="memo"
                  value={value.memo}
                  maxLength={20}
                  onChange={(e) => {
                    handleInputChange(e, value.id);
                  }}
                />
                <SvgIcon
                  className="list__delete"
                  component={ClearOutlinedIcon}
                  sx={{ stroke: "#ffffff", strokeWidth: 0.8 }}
                  onClick={() => {
                    handleDeleteList(value.id);
                  }}
                />
              </li>
            );
          })}
        </Lists>
        <div className="row__plus" onClick={onClickPlusBtn}>
          <SvgIcon
            className="list__delete"
            component={AddCircleOutlineOutlinedIcon}
            sx={{ stroke: "#ffffff", strokeWidth: 0.8 }}
          />
          <p>행 추가</p>
        </div>
        <button disabled={isDisabled} onClick={onClickSubmit}>
          작성 완료
        </button>
      </Container>
      {isOpen.uploadModal && (
        <UploadContainer
          $upload={typeof uploadedInfo.imageUrl === "string" ? "true" : "false"}
          open={isOpen.uploadCheckModal}
        >
          <SvgIcon
            className="deleteIcon"
            component={ClearOutlinedIcon}
            onClick={() => {
              setIsOpen((prev) => {
                const updated = { ...prev };
                return { ...updated, uploadModal: false };
              });
              setUploadedInfo({
                name: "",
                size: "",
                type: "",
              });
            }}
            sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
          />
          <h3>이미지 업로드</h3>
          <p>버튼을 누르거나 파일을 드래그하여 영수증을 업로드해주세요.</p>
          <label
            className={`upload__label ${isActive ? "active" : ""}`}
            onDragEnter={() => {
              setIsActive(true);
            }}
            onDragOver={(e: React.DragEvent<HTMLLabelElement>) => {
              e.preventDefault();
            }}
            onDragLeave={() => {
              setIsActive(false);
            }}
            onDrag={handleDropImage}
          >
            <input
              type="file"
              className="file"
              accept="image/*"
              onChange={handleUpload}
            />
            {progress > 0 ? (
              <progress value={progress} max="100" />
            ) : uploadedInfo.imageUrl ? (
              <>
                <img
                  src={uploadedInfo.imageUrl}
                  alt="업로드 이미지"
                  className="upload__image"
                />
                <ul className="preview_info">
                  {Object.entries(uploadedInfo)
                    .filter(([key, _]) => key !== "imageUrl") // 'imageUrl' 항목 제외 ("_"를 사용한 위치의 값은 사용하지 않겠다는 의미)
                    .map(([key, value]) => (
                      <li key={key}>
                        <span className="info_key">{key} : </span>
                        <span className="info_value">{value}</span>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <>
                <svg className="icon" x="0px" y="0px" viewBox="0 0 24 24">
                  <path fill="transparent" d="M0,0h24v24H0V0z" />
                  <path
                    fill="#839DFA"
                    d="M20.5,5.2l-1.4-1.7C18.9,3.2,18.5,3,18,3H6C5.5,3,5.1,3.2,4.8,3.5L3.5,5.2C3.2,5.6,3,6,3,6.5V19  c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V6.5C21,6,20.8,5.6,20.5,5.2z M12,17.5L6.5,12H10v-2h4v2h3.5L12,17.5z M5.1,5l0.8-1h12l0.9,1  H5.1z"
                  />
                </svg>
                <p className="label__msg">
                  클릭 혹은 파일을 이곳에 드롭하세요.
                </p>
                <p className="label__desc">파일당 최대 5MB</p>
              </>
            )}
          </label>
          <button
            disabled={typeof uploadedInfo.imageUrl !== "string"}
            className="label__button"
            onClick={onClickBtn}
          >
            {isLoading ? <img src={Spinner} alt={"로딩"} /> : "확인"}
          </button>
        </UploadContainer>
      )}
      {isOpen.uploadCheckModal && (
        <ReceiptModal receipt={receipt} setReceipt={setReceipt}>
          <button
            onClick={() => {
              setIsOpen((prev) => {
                return { ...prev, uploadModal: false, uploadCheckModal: false };
              });
              setUploadedInfo({
                name: "",
                size: "",
                type: "",
              });
            }}
          >
            취소
          </button>
          <button onClick={onClickCheckBtn}>확인</button>
        </ReceiptModal>
      )}
    </Background>
  );
};

export default LedgerWrite;

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 150;
  position: fixed;
  top: 0;
  left: 0;
`;

const Container = styled.div<{ open: boolean }>`
  display: ${(props) => (props.open ? "none" : "block")};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 4rem 6rem;
  z-index: 100;
  width: 95rem;
  height: 55rem;
  background: white;
  border-radius: 4px;
  border: 1px solid gray;

  .deleteIcon {
    cursor: pointer;
    font-size: 2.6rem;
    color: gray;
    position: absolute;
    right: 2rem;
    top: 2rem;
  }

  .header {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;

    h3 {
      font-size: 2.2rem;
      color: #464656;
    }

    button {
      font-size: 1.2rem;
      padding: 0.8rem 2rem;
      border-radius: 4px;
      color: white;
      background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }

  .category__header {
    width: 100%;
    margin-top: 2rem;
    padding: 0.8rem 0;
    display: flex;
    align-items: center;
    gap: 2rem;

    p {
      font-size: 1.4rem;
      color: #474747;

      &:first-child {
        width: 7rem;
      }

      &:nth-child(2) {
        width: 11rem;
      }

      &:nth-child(3) {
        width: 7rem;
      }

      &:nth-child(4) {
        width: 10rem;
      }

      &:nth-child(5) {
        width: 7rem;
      }

      &:nth-child(6) {
        width: 10rem;
      }
    }
  }

  .row__plus {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #464656;
    gap: 0.7rem;
    position: fixed;
    bottom: 10rem;
    left: 6rem;

    p {
      font-size: 1.4rem;
    }

    > svg {
      font-size: 2.2rem;
    }
  }

  > button {
    position: absolute;
    bottom: 4rem;
    width: 87%;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    color: white;
    border-radius: 4px;
    padding: 1rem;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  /* input[type="date"]::before {
		content: attr(data-placeholder);
		width: 100%;
	} */
`;

const UploadContainer = styled.div<{ $upload: string; open: boolean }>`
  display: ${(props) => (props.open ? "none" : "flex")};
  /* display: flex; */
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding-top: 4rem;
  z-index: 100;
  width: 70rem;
  background: white;
  border-radius: 4px;
  border: 1px solid gray;

  > h3 {
    margin-top: 2.5rem;
    font-size: 2.4rem;
    color: #212321;
  }

  > p {
    font-size: 1.3rem;
    margin-top: 1.5rem;
    color: hsla(0, 0%, 61.6%, 0.8);
  }

  .deleteIcon {
    cursor: pointer;
    font-size: 2.6rem;
    color: gray;
    position: absolute;
    right: 2rem;
    top: 2rem;
  }

  .upload__label {
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50rem;
    height: 20rem;
    margin: 0 auto;
    margin-top: 3rem;
    background-color: #fff;
    border-radius: 5px;
    border: 2px dashed #eee;

    &:hover {
      border-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }

  .active {
    background-color: #efeef3;
    border-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }

  .label__msg {
    font-weight: 500;
    font-size: 1.6rem;
    margin: 2rem 0 1rem;
  }

  .label__desc {
    font-size: 1.2rem;
  }

  .label__button {
    width: 100%;
    height: 8rem;
    margin-top: 6.1rem;
    background-color: ${(props) =>
      props.$upload === "true" ? "#8a9eff" : "silver"};
    color: white;
    font-size: 1.5rem;
    font-weight: 500;

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover {
      background-color: #9aaaf8;
    }

    &[disabled]:hover {
      background-color: #8e8e8e;
    }
  }

  .preview_info {
    display: flex;
    gap: 2rem;
    position: absolute;
    bottom: -3.7rem;
  }

  .info_key {
    font-size: 1.6rem;
    font-weight: 600;
  }

  .info_value {
    font-size: 1.4rem;
  }

  .upload__image {
    width: 50rem;
    height: 20rem;
    object-fit: contain;
  }

  .file {
    display: none;
  }

  .downloadIcon {
    font-size: 7.5rem;
    opacity: 0.6;
    color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }

  .icon {
    width: 9rem;
    height: 9rem;
    pointer-events: none;
  }
`;

const Lists = styled.ul`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  max-height: 24rem;

  .list {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;

    .select {
      display: flex;
      position: relative;

      .arrow__down {
        position: absolute;
        top: 0;
        right: 0;
        margin-bottom: 2rem;
      }
    }
  }

  .category__select {
    cursor: pointer;
    font-size: 1.2rem;
    font-family: "Pretendard-Regular";
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 7rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
    -webkit-appearance: none; /* 크롬 화살표 없애기 */
    -moz-appearance: none; /* 파이어폭스 화살표 없애기 */
    appearance: none; /* 화살표 없애기 */
  }

  .date__select {
    font-family: "Pretendard-Regular";
    cursor: pointer;
    font-size: 1.1rem;
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 11rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
  }

  .account__name {
    font-size: 1.2rem;
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 10rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
  }

  .memo {
    font-size: 1.2rem;
    position: relative;
    border: none;
    border-bottom: 1px solid #c9c9c9;
    width: 12rem;
    padding-bottom: 0.3rem;
    color: #616165;
    font-weight: 500;
    outline: none;
  }

  .list__delete {
    cursor: pointer;
    font-size: 2.4rem;
    color: #c9c9c9;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
