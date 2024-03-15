import moment from "moment";
import dateAsKor from "src/utils/dateAsKor";
import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import { type incomeType, type outgoType, type modalType } from ".";
import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "src/utils/timeFunc";
import { api } from "src/utils/refreshToken";
import { useDispatch } from "react-redux";
import { showToast } from "src/store/slices/toastSlice";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "src/firebase";
import ReceiptModal, {
  type receiptType,
} from "src/components/Layout/ReceiptModal";
import Spinner from "../../assets/Ellipsis-1.4s-200px.gif";

interface Props {
  isOpen: modalType;
  setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
  setMonthlyOutgo: React.Dispatch<React.SetStateAction<outgoType>>;
  setMonthlyIncome: React.Dispatch<React.SetStateAction<incomeType>>;
}

interface hoverType {
  hover: boolean;
  click: boolean;
}

interface valuesType {
  [key: string]: string;
  division: string;
  money: string;
  category: string;
  method: string;
  account: string;
  memo: string;
}

const WriteModal = ({
  isOpen,
  setIsOpen,
  setMonthlyOutgo,
  setMonthlyIncome,
}: Props) => {
  const [isHovered, setIsHovered] = useState<hoverType>({
    hover: false,
    click: false,
  });
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [progress, setProgress] = useState(0); // 업로드 진행 상황
  const [isLoading, setIsLoading] = useState<boolean>(false); // 영수증 업로드 api 요청 시 로딩 상태
  const [inputKey, setInputKey] = useState(Date.now()); // file 타입의 input의 onChange 이벤트 감지를 위한 상태
  const [fileName, setFileName] = useState<string>(""); // 선택된 파일 이름을 저장할 상태 변수 추가

  const [receipt, setReceipt] = useState<receiptType>({
    date: "",
    money: 0,
    outgoName: "",
    receiptImg: "",
  });

  const [values, setValues] = useState<valuesType>({
    division: "outgo",
    money: "0",
    category: "",
    method: "",
    account: "",
    memo: "",
  });

  const dispatch = useDispatch();

  // input hover, click, blur 감지 후 실행 함수
  const handleMouseEnter = () => {
    setIsHovered({ ...isHovered, hover: true });
  };
  const handleMouseLeave = () => {
    setIsHovered({ ...isHovered, hover: false });
  };
  const handleMouseClick = () => {
    setIsHovered({ ...isHovered, click: true });
  };
  const handleMouseBlur = () => {
    setIsHovered({ ...isHovered, click: false });
  };

  const onChangeMoney = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 입력값에 e가 입력되는 것은 추후에 막아볼 예정
    if (inputValue.startsWith("0")) {
      setValues({ ...values, money: inputValue.substring(1) });
    } else {
      setValues({ ...values, money: inputValue });
    }
  };

  const onClickCloseBtn = () => {
    setIsOpen({ ...isOpen, writeIcon: false });
    setValues({
      division: "outgo",
      money: "0",
      category: "",
      method: "",
      account: "",
      memo: "",
    });
  };

  const onChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, division: e.target.value });
  };

  const onChangeMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValues({ ...values, method: e.target.value });
  };

  const onChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValues({ ...values, category: e.target.value });
  };

  const onChangeAccount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, account: e.target.value });
  };

  const onChangeMemo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, memo: e.target.value });
  };

  // 이미지를 url로 변환 후 처리하는 함수
  const setFileInfo = (file: File) => {
    const { type } = file;
    const isImage = type.includes("image");
    const size = (file.size / (1024 * 1024)).toFixed(2) + "mb";

    if (!isImage) {
      console.log("이미지 말고 다른거 올리지마세요 / 예외처리 해야함", size);
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
            setProgress(0);
            onClickBtn(downloadURL);
          })
          .catch((error) => {
            console.log(error);
            setProgress(0);
          });
      }
    );
  };

  // 영수증 업로드 모달에서 확인 버튼을 눌렀을 때 실행되는 함수
  const onClickBtn = (downloadURL: string) => {
    setIsLoading(true);
    api
      .post("/outgo/uploadImage", { receiptImageUrl: downloadURL })
      .then((res) => {
        setIsLoading(false);
        setReceipt(res.data);
        setIsOpen((prev) => {
          return { ...prev, receiptCheck: true };
        });
      })
      .catch(() => {
        alert("영수증 인식이 되지 않습니다. 다시 시도해주세요.");
        setIsLoading(false);
      });
  };

  const onClickCheckBtn = () => {
    setValues((prev) => {
      return {
        ...prev,
        division: "outgo",
        money: receipt.money.toString(),
        category: "",
        method: "카드",
        account: receipt.outgoName,
        memo: "",
      };
    });
    setIsOpen((prev) => {
      return { ...prev, day: receipt.date, receiptCheck: false };
    });
  };

  // 파일 업로드 감지 함수
  const handleUpload = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      setFileInfo(file); // 코드 추가
      setFileName(file.name);
      setInputKey(Date.now()); // key 값을 현재 시간으로 업데이트하여 input을 재설정
    }
  };

  const checkValues = useCallback(
    debounce((values: valuesType) => {
      let isBlank = false;
      let isNotValid = true;

      // 빈 값 체크
      for (const key in values) {
        if (values[key] === "") {
          if (key === "method" && values.division === "income") {
            continue;
          }
          if (key === "memo" && values.memo === "") {
            continue;
          }
          isBlank = true;
        }
        if (key === "money" && values[key] === "0") isBlank = true;
      }

      if (!isBlank) {
        isNotValid = false;
      }

      setIsDisabled(isNotValid);
    }, 700),
    []
  );
  const onClickSubmit = () => {
    values.division === "outgo"
      ? api
          .post("/outgo/post", {
            date: isOpen.day,
            outgoName: values.account,
            money: Number(values.money),
            memo: values.memo,
            outgoTag: values.category,
            wasteList: false,
            payment: values.method,
            receiptImg: receipt.receiptImg,
          })
          .then(() => {
            if (
              new Date(isOpen.day).getMonth() ===
              new Date(moment().format("YYYY-MM-DD")).getMonth()
            ) {
              api
                .get(`/outgo/monthly?date=${moment().format("YYYY-MM-DD")}`)
                .then((res) => {
                  setMonthlyOutgo(res.data);
                })
                .catch((error) => {
                  console.log(error);
                });
            }
            dispatch(
              showToast({ message: "작성이 완료되었습니다", type: "success" })
            );
            setValues({
              division: "outgo",
              money: "0",
              category: "",
              method: "",
              account: "",
              memo: "",
            });
          })
          .catch((error) => {
            console.log(error);
          })
      : api
          .post("/income/post", {
            date: isOpen.day,
            incomeName: values.account,
            money: Number(values.money),
            memo: values.memo,
            incomeTag: values.category,
            receiptImg: "",
          })
          .then(() => {
            if (
              new Date(isOpen.day).getMonth() ===
              new Date(moment().format("YYYY-MM-DD")).getMonth()
            ) {
              api
                .get(`/income/monthly?date=${moment().format("YYYY-MM-DD")}`)
                .then((res) => {
                  setMonthlyIncome(res.data);
                })
                .catch((error) => {
                  console.log(error);
                });
            }
            dispatch(
              showToast({ message: "작성이 완료되었습니다", type: "success" })
            );
            setValues({
              division: "outgo",
              money: "0",
              category: "",
              method: "",
              account: "",
              memo: "",
            });
          })
          .catch((error) => {
            console.log(error);
          });
    setIsOpen((prev) => {
      const updated = { ...prev };
      return { ...updated, writeIcon: false };
    });
  };

  useEffect(() => {
    checkValues(values);
  }, [values]);

  return (
    <>
      <Container $isOpen={isOpen.writeIcon}>
        <SvgIcon
          className="deleteIcon"
          component={ClearOutlinedIcon}
          onClick={onClickCloseBtn}
          sx={{ stroke: "#ffffff", strokeWidth: 1 }}
        />
        <h4>
          {dateAsKor(
            moment(isOpen.day, "YYYY. M. D. a H:mm:ss").format("YYYY-MM-DD")
          ).replace(/\d+년/, "")}{" "}
          가계부
        </h4>
        <div className="money__write">
          <div className="moneyUnit">
            <h5
              className={
                isHovered.hover || isHovered.click
                  ? "fromLeft hovered"
                  : !isHovered.hover && isHovered.click
                    ? "fromLeft hovered"
                    : "fromLeft"
              }
            >
              {Number(values.money).toLocaleString()}원
            </h5>
            <SvgIcon
              className="writeIcon"
              component={EditOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 1 }}
            />
          </div>
          <input
            className="money__write__input"
            value={values.money}
            name="money"
            size={16}
            onChange={onChangeMoney}
            type="number"
            onMouseEnter={handleMouseEnter}
            onClick={handleMouseClick}
            onBlur={handleMouseBlur}
            onMouseLeave={handleMouseLeave}
          />
          {values.money === "0" ||
            (values.money === "" && (
              <p className="p__info">금액을 입력해주세요</p>
            ))}
        </div>
        <div className="division">
          <p>분류</p>
          <div className="division__btn">
            <div className="form_radio_btn">
              <input
                id="outgo"
                type="radio"
                name="division"
                value="outgo"
                onChange={onChangeLabel}
                defaultChecked
              />
              <label htmlFor="outgo">지출</label>
            </div>
            <div className="form_radio_btn">
              <input
                id="income"
                type="radio"
                name="division"
                value="income"
                onChange={onChangeLabel}
              />
              <label htmlFor="income">수입</label>
            </div>
          </div>
        </div>
        <div className="category">
          <p>카테고리</p>
          <select
            className="category__select"
            value={values.category}
            onChange={onChangeCategory}
            name="category"
          >
            {values.division === "outgo" ? (
              <>
                <option value="">선택</option>
                <option value="출금">출금</option>
                <option value="식비">식비</option>
                <option value="쇼핑">쇼핑</option>
                <option value="취미">취미</option>
                <option value="교통">교통</option>
                <option value="통신">통신</option>
                <option value="의류">의류</option>
                <option value="뷰티">뷰티</option>
                <option value="교육">교육</option>
                <option value="여행">여행</option>
              </>
            ) : (
              <>
                <option value="">선택</option>
                <option value="입금">입금</option>
                <option value="급여">급여</option>
                <option value="이자">이자</option>
                <option value="투자">투자</option>
              </>
            )}
          </select>
          <SvgIcon
            className="deleteIcon"
            component={ArrowDropDownOutlinedIcon}
            sx={{ stroke: "#ffffff", strokeWidth: 1 }}
          />
        </div>
        <div className="category">
          <p>결제 수단</p>
          <select
            className="category__select"
            value={values.method}
            onChange={onChangeMethod}
            name="method"
          >
            {values.division === "income" ? (
              <option value="x">x</option>
            ) : (
              <>
                <option value="">선택</option>
                <option value="현금">현금</option>
                <option value="카드">카드</option>
                <option value="이체">이체</option>
              </>
            )}
          </select>
          <SvgIcon
            className="deleteIcon"
            component={ArrowDropDownOutlinedIcon}
            sx={{ stroke: "#ffffff", strokeWidth: 1 }}
          />
        </div>
        <div className="account">
          <p>거래처</p>
          <input
            className="account__input"
            type="text"
            value={values.account}
            name="account"
            onChange={onChangeAccount}
          />
        </div>
        <div className="account">
          <p>메모</p>
          <input
            className="account__input"
            type="text"
            value={values.memo}
            name="memo"
            onChange={onChangeMemo}
          />
        </div>
        <div className="receipt">
          <p>영수증 업로드</p>
          <div className="file__inputs">
            <input
              key={inputKey}
              className="file__input"
              type="file"
              accept="image/*"
              onChange={handleUpload}
            />
            <div className="file__input__displace">
              <button className="file__input__btn">파일 선택</button>
              <span>
                {fileName !== "" ? fileName : "선택 된 파일이 없습니다."}
              </span>{" "}
            </div>
            {/* 선택된 파일 이름 표시 */}
          </div>
        </div>
        <div className="explanation">
          <p>🖊️ 영수증 업로드시 자동으로 항목이 작성됩니다</p>
        </div>
        <button disabled={isDisabled} onClick={onClickSubmit}>
          작성하기
        </button>
      </Container>
      {isOpen.receiptCheck && (
        <Background>
          <ReceiptModal receipt={receipt} setReceipt={setReceipt}>
            <button
              onClick={() => {
                setIsOpen((prev) => {
                  return { ...prev, receiptCheck: false };
                });
                setFileName("");
              }}
            >
              취소
            </button>
            <button onClick={onClickCheckBtn}>확인</button>
          </ReceiptModal>
        </Background>
      )}
      {(progress > 0 || isLoading) && (
        <Background>
          <LoadingModal>
            <p>영수증 인식 중입니다...</p>
            <img src={Spinner} alt={"로딩"} />
          </LoadingModal>
        </Background>
      )}
    </>
  );
};

export default WriteModal;

const Container = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  width: 24.863rem;
  height: ${(props) => (props.$isOpen ? "42.8rem" : "0px")};
  overflow-y: hidden;
  border-radius: 8px;
  background: white;
  right: -0.23rem;
  bottom: 5rem;
  margin-right: 12.5rem;
  color: rgb(70, 70, 86);
  transition: 0.3s ease-in-out;
  border: ${(props) => (props.$isOpen ? "1px solid #d9d9d9" : "")};
  padding: ${(props) => (props.$isOpen ? "2rem" : "")};
  /* z-index: 75; */

   p {
        font-size: 1.2rem;
        font-weight: 600;
        color: #6d6d75;
    }

  .deleteIcon {
    float: right;
    font-size: 2.4rem;
    cursor: pointer;
  }

  h4 {
    margin-top: 0.5rem;
    color: rgb(98, 98, 115);
    font-size: 1.4rem;
    font-weight: 300;
  }

  .moneyUnit {
    display: flex;
  }

  h5 {
    display: block;
    position: relative;
    font-size: 1.8rem;
    min-width: 12rem;
    overflow-x: hidden;
    height: 2.5rem;
    white-space: nowrap;
  }

  .p__info {
    color: #99affe;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .money__write  {
    margin-top: 1rem;
    height: 3.7rem;
    display: flex;
    flex-direction: column;
    position: relative:
  }

  .money__write__input {
    position: absolute;
    width: 12rem;
    border: none;
    font-size: 1.8rem;
    font-weight: 600;
    color: transparent;
    background-color: transparent;
    cursor: pointer;
    }

  .writeIcon {
    font-size: 2rem;
    display: none;
  }
  

    h5:after {
    content: '';
    display:block;
    margin-top: 0.2rem;
    border-bottom: 1px solid #78a1df;  
    transform: scaleX(0);  
    transition: transform 250ms ease-in-out;
    }

    h5.hovered:after { 
        transform: scaleX(1);
     }

    h5.fromLeft:after{  transform-origin:  0% 50%; }

  /* input:focus {
    padding-bottom: 0.3rem;
    border-bottom: 0.1rem solid rgb(198, 198, 208);
  } */

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .division {
    display:flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    margin-top: 1rem;
  }

  .division__btn {
    display:flex;
    gap: 4px;
  }

  .form_radio_btn {
    input {
        display:none;
    }

    label {
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: 500;
        border-radius: 6px;
        padding: 0.5rem 1.2rem;
        border : 0.2rem solid #C9C9C9;
        color: rgb(144, 144, 160);
    }
  }

  .form_radio_btn input[type="radio"]:checked + label {
    border: 0.2rem solid rgb(119, 152, 252);
    color: rgb(119, 152, 252);
  }

  .category {
    display: flex;
    justify-content: space-between;
    align-items:center;
    margin-top: 1.5rem;

    select {
        cursor: pointer;
        font-size: 1.2rem;
        position: relative;
        border: none;
        border-bottom: 1px solid #C9C9C9;
        width: 11rem;
        padding-bottom: 0.3rem;
        padding-left: 0.3rem;
        color: #616165;
        font-weight: 500;
        outline:none;
        -webkit-appearance:none; /* 크롬 화살표 없애기 */
        -moz-appearance:none; /* 파이어폭스 화살표 없애기 */
        appearance:none /* 화살표 없애기 */
    }

    svg {
        position:absolute;
        right:1.5rem;
        margin-bottom: 1rem;
    }
  }

  .account {
    display: flex;
    justify-content: space-between;
    align-items:center;
    margin-top: 1.5rem;

     .account__input {
        border:none;
        border-bottom: 0.5px solid #C9C9C9;
        width: 11rem;
        padding-bottom: 0.3rem;
        padding-left: 0.3rem;
        font-weight: 500;
        font-size:1.2rem;
        color: #616165;
    }
  }

  .file__inputs {
    position: relative;
  }

  .file__input {
      opacity: 0;
      z-index: 1;
      position: relative;
      width: 100%;
    }

    .file__input__displace {
      display: flex;
      gap: 0.2rem;
      align-items: center;
      pointer-events: none;
      position: absolute;
      top: 1rem;
      z-index: 2;
      border: 0.5px solid #C9C9C9;
      border-radius: 4px;

      .file__input__btn {
        margin: 0;
        padding: 0.5rem 1rem;
        font-size: 1.2rem;
        background: #839dfa;
        width: 7rem;
        height: 3rem;
      }

      > span {
        z-index: 2;
        display:flex;
        align-items: center;
        font-size: 1.1rem;
        min-width: 13rem;
        height: 2.8rem;
        padding: 0 0.5rem;
        background: white;
      }
    }

  .receipt {
    display:flex; 
    flex-direction: column;
    margin-top: 1.5rem;

    input {
        border: 1px solid #C9C9C9;
        border-radius: 4px;
        margin-top: 1rem;
        font-size: 1.2rem;
    }

    input[type=file]::file-selector-button {
        cursor: pointer;
        width: 60px;
        height: 27px;
        font-size: 1.1rem;
        border: none;
        border-right: 1px solid #C9C9C9;
        border-radius:4px;
    }
  }

  .explanation {
    display: flex;
    margin-top: 0.8rem;
    
    p{
        font-size: 1rem;
        white-space: nowrap;
    }
  }

  button {
    width: 100%;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    border-radius: 4px;
    height: 35px;
    margin-top: 3.5rem;
    color: white;
    font-weight: 500;

    &:disabled {
      opacity: 0.4;
      pointer-events: none;
    }
  }

`;

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 150;
  position: fixed;
  top: 0;
  left: 0;
`;

const LoadingModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  width: 100vw;
  height: 100vh;
  display: flex;
  gap: 2rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6rem 2rem;

  > p {
    color: #5ce2b1;
    font-size: 2.8rem;
    font-weight: 700;
  }

  > img {
    width: 8rem;
    height: 8rem;
  }
`;
