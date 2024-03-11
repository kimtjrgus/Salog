import { styled } from "styled-components";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { SvgIcon } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "src/store";
import { useCallback, useEffect, useState } from "react";
import Modal from "src/components/Layout/Modal";
import { api } from "src/utils/refreshToken";
import { useNavigate } from "react-router-dom";
import { showToast } from "src/store/slices/toastSlice";
import { checkPassword, userLogout } from "src/utils/validCheck";
import { debounce } from "src/utils/timeFunc";

interface inputType {
  [key: string]: string;
  currentPassword: string;
  newPassword: string;
  ckPassword: string;
}

const Setting = () => {
  const member = useSelector((state: RootState) => state.persistedReducer.user);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<inputType>({
    currentPassword: "",
    newPassword: "",
    ckPassword: "",
  });
  const [errorMsg, setErrorMsg] = useState<inputType>({
    currentPassword: "",
    newPassword: "",
    ckPassword: "",
  });

  const { currentPassword, newPassword, ckPassword } = values;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prevValue) => {
      return { ...prevValue, [name]: value };
    });
  };

  const onClickCloseBtn = () => {
    api
      .delete("/members/leaveid")
      .then((res) => {
        console.log(res);

        dispatch(
          showToast({ message: "회원탈퇴가 완료되었습니다", type: "success" })
        );
        userLogout();
        navigate("/login", { replace: true });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 입력값이 모두 유효하면 비밀번호를 변경 아니면 오류 메세지 출력
  const changePassword = () => {
    const msg: inputType = {
      currentPassword: "",
      newPassword: "",
      ckPassword: "",
    };
    let isValid = true;

    if (currentPassword.trim() === "") {
      msg.currentPassword = "현재 비밀번호를 입력해주세요.";
      isValid = false;
    }

    if (newPassword.trim() === "") {
      msg.newPassword = "새 비밀번호를 입력해주세요.";
      isValid = false;
    } else if (!checkPassword(newPassword)) {
      msg.newPassword =
        "최소 8자, 영문+숫자+특수문자(!@#$%&*?) 조합으로 구성되어야 합니다.";
      isValid = false;
    }

    if (ckPassword.trim() === "") {
      msg.ckPassword = "비밀번호를 입력해주세요.";
      isValid = false;
    } else if (newPassword !== ckPassword) {
      msg.ckPassword = "새 비밀번호와 일치하지 않습니다.";
      isValid = false;
    }

    if (currentPassword === newPassword) {
      msg.newPassword = "이미 사용 중인 비밀번호로 변경할 수 없습니다.";
      isValid = false;
    }

    if (!isValid) {
      setErrorMsg(msg);
    } else {
      // 비밀번호 변경 api 호출
      api
        .patch(`/members/changePassword`, {
          curPassword: currentPassword,
          newPassword,
        })
        .then(() => {
          setErrorMsg(msg);
          setValues({ ...values, ...msg });
          dispatch(
            showToast({
              message: "비밀번호 변경이 완료되었습니다",
              type: "success",
            })
          );
          navigate("/setting");
        })
        .catch((error) => {
          // 400 에러 (현재 비밀번호를 잘못 입력했을 때)
          if (error.response?.status === 400) {
            msg.currentPassword = "현재 비밀번호가 유효하지 않습니다.";
            setErrorMsg(msg);
          }
        });
    }
  };

  const checkValues = useCallback(
    debounce((values: inputType) => {
      let isBlank = false;
      let isNotValid = true;

      const msg: inputType = {
        currentPassword: "",
        newPassword: "",
        ckPassword: "",
      };

      // 빈 값 체크
      for (const key in values) {
        if (values[key] === "") {
          isBlank = true;
        }
      }

      if (!isBlank && values.ckPassword === values.newPassword) {
        isNotValid = false;
      } else if (values.ckPassword !== values.newPassword) {
        setErrorMsg({
          ...msg,
          ckPassword: "새 비밀번호와 일치하지 않습니다.",
        });
      }

      if (isNotValid) setErrorMsg(msg);
    }, 700),
    []
  );

  useEffect(() => {
    checkValues(values);
  }, [values]);

  useEffect(() => {
    setValues({
      currentPassword: "",
      newPassword: "",
      ckPassword: "",
    });
  }, [location.hash]);

  return (
    <>
      <Container>
        <div className="profile">
          <SvgIcon
            component={AccountCircleOutlinedIcon}
            sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
          />
          <div className="user_info">
            <h4>
              <span>{member?.email}</span> 님
            </h4>
            <p>환영합니다. 즐거운 하루 되세요.</p>
          </div>
        </div>
        <h3>설정</h3>
        {location.hash === "" ? (
          <div className="settings">
            <div className="account">
              <div className="account__div">
                <p>이메일</p>
                <input type="email" value={member?.email} readOnly />
              </div>
              <div className="account__div">
                <p>비밀번호</p>
                <input type="password" value="**********" readOnly />
                <button
                  onClick={() => {
                    navigate("/setting#password");
                  }}
                >
                  변경
                </button>
              </div>
              <p
                className="secession"
                onClick={() => {
                  setIsOpen(true);
                }}
              >
                회원 탈퇴
              </p>
            </div>
            <div className="category">
              <p>현재 카테고리</p>
              <p>추후 추가 예정입니다.</p>
            </div>
          </div>
        ) : location.hash === "#password" ? (
          <div className="password_change">
            <h4>비밀번호 변경</h4>
            <div className="password_area">
              <p>기존 비밀번호</p>
              <div className="input_area">
                <input
                  type="password"
                  name="currentPassword"
                  value={values.currentPassword}
                  onChange={onChangeValues}
                />
                <p className="error">{errorMsg.currentPassword}</p>
              </div>
            </div>
            <div className="password_area">
              <p>새 비밀번호</p>
              <div className="input_area">
                <input
                  type="password"
                  name="newPassword"
                  value={values.newPassword}
                  onChange={onChangeValues}
                />
                <p className="error">{errorMsg.newPassword}</p>
              </div>
            </div>
            <div className="password_area">
              <p>새 비밀번호 확인</p>
              <div className="input_area">
                <input
                  type="password"
                  name="ckPassword"
                  value={values.ckPassword}
                  onChange={onChangeValues}
                />
                <p className="error">{errorMsg.ckPassword}</p>
              </div>
            </div>
            <div className="buttons">
              <button
                onClick={() => {
                  navigate("/setting");
                }}
              >
                취소
              </button>
              <button onClick={changePassword}>변경</button>
            </div>
          </div>
        ) : (
          <div>null</div>
        )}
      </Container>
      {isOpen && (
        <Modal
          state={isOpen}
          setState={setIsOpen}
          msgTitle={"회원탈퇴를 진행하시겠습니까?"}
          msgBody={"회원탈퇴시 저장된 모든 데이터가 삭제됩니다."}
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
      )}
    </>
  );
};

export default Setting;

const Container = styled.div`
  width: 92%;
  padding: 3rem 8rem;
  margin-top: 3rem;

  > h3 {
    font-size: 2rem;
    color: #4f4f4f;
    margin-bottom: 1rem;
    border-bottom: 0.3px solid rgba(0, 0, 0, 0.25);
    padding: 2rem 0;
  }

  .profile {
    width: 100%;
    height: 11rem;
    display: flex;
    align-items: center;
    padding: 0 3rem;
    margin-bottom: 3rem;
    border: 1px solid #959393;
    border-radius: 8px;
    box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.3);

    > svg {
      font-size: 6rem;
      color: #6788fe;
    }

    .user_info {
      display: flex;
      flex-direction: column;
      margin-left: 2rem;
      line-height: 2.5rem;

      > h4 {
        font-size: 1.8rem;

        > span {
          color: #839dfa;
        }
      }

      > p {
        font-size: 1.2rem;
        color: #676767;
      }
    }
  }

  .settings {
    height: 100%;
    display: flex;
  }

  .account {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 50%;

    .account__div {
      display: flex;
      align-items: center;
      margin-top: 2rem;

      > p {
        font-size: 1.3rem;
        color: #3d3d3d;
      }

      > input {
        width: 16rem;
        margin-left: 3rem;
        border: none;
        font-size: 1.2rem;
        color: #696969;

        &[type="email"] {
          margin-left: 4rem;
        }
      }

      > button {
        border: 1px solid #bababa;
        border-radius: 20px;
        padding: 0.4rem 1.2rem;
        font-size: 1.1rem;
        color: #696969;

        &:hover {
          color: white;
          background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
          border: 1px solid ${(props) => props.theme.COLORS.LIGHT_BLUE};
        }
      }
    }

    .secession {
      font-size: 1.3rem;
      cursor: pointer;
      text-decoration: underline;
      position: absolute;
      bottom: 0;
    }
  }

  .password_change {
    width: 28rem;

    > h4 {
      font-size: 1.6rem;
      margin-top: 3rem;
      margin-bottom: 2.5rem;
    }

    .password_area {
      display: flex;
      align-items: center;
      margin-top: 2.5rem;

      > p {
        width: 10rem;
        font-size: 1.2rem;
        font-weight: 500;
        color: #3d3d3d;
      }

      .error {
        position: absolute;
        font-size: 1rem;
        color: ${(props) => props.theme.COLORS.LIGHT_RED};
        margin-top: 0.6rem;
        white-space: nowrap;
      }

      .input_area {
        position: relative;
        width: 18rem;
        > input {
          width: 18rem;
          padding: 0.2rem 0.3rem;
          outline: none;
          border: 1px solid #c2c2c2;
          border-radius: 4px;
          font-size: 1.4rem;
        }
      }
    }

    .buttons {
      margin-top: 2.5rem;
      display: flex;
      justify-content: space-between;
      gap: 2rem;

      > button {
        background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
        color: white;
        font-size: 1.1rem;
        padding: 0.4rem 5rem;
        border-radius: 4px;

        &:first-child {
          color: #737373;
          background-color: #c2c2c2;
        }

        &.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }
    }
  }

  .category {
    display: flex;
    flex-direction: column;

    > p {
      font-size: 1.3rem;
      font-weight: 500;
      color: #3d3d3d;
      margin-top: 2rem;
    }
  }
`;
