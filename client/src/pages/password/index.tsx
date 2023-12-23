import { styled } from "styled-components";
import { Input, PasswordLabel, SubmitBtn } from "../login";
import { ReactComponent as Logo } from "../../assets/Slogo.svg";
import React, { useCallback, useEffect, useState } from "react";
import {
	InputContainer,
	Title,
	WarningTitle,
	type confirmType,
	type errorType,
	type inputType,
} from "../sign_up";
import { checkEmail, checkPassword } from "src/utils/validCheck";
import axios from "axios";
import Toast, { ToastType } from "src/components/Layout/Toast";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { setCookie } from "src/utils/cookie";
import { useNavigate } from "react-router-dom";
import { debounce } from "src/utils/timeFunc";

const PasswordFind = () => {
	const [values, setValues] = useState<inputType>({
		email: "",
		password: "",
		passwordCheck: "",
		authNum: "",
	});
	const [errorMsg, setErrorMsg] = useState<errorType>({
		email: "",
		password: "",
		passwordCheck: "",
		authNum: "",
	});
	const [isDisabled, setIsDisabled] = useState<boolean>(true);
	const [isConfirm, setIsConfirm] = useState<confirmType>({
		isOpen: false,
		auth: "",
		minutes: 0,
		seconds: 0,
	}); // 인증번호 발송 시 상태 (서버 기능 구현 전까지는 클릭하면 true로)

	const [isAuth, setIsAuth] = useState<boolean>(false);
	// 인증번호 발송 후, 5분동안 인풋을 disabled 하기 위한 상태

	// 비밀번호 입력 창의 type=password or text
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [empty, setEmpty] = useState<boolean>(false);
	const navigate = useNavigate();

	// 비밀번호 표시/감추기 버튼 클릭 시 실행되는 함수
	const onClickVisibleBtn = () => {
		setIsVisible(!isVisible);
	};

	const onBlurInputs = (e: React.FocusEvent<HTMLInputElement>) => {
		console.log(e);

		const msg = { password: "", passwordCheck: "" };
		const { password, passwordCheck } = values;

		if (!checkPassword(password)) {
			msg.password =
				"8자 이상의 영문+숫자+특수문자($@!%*#?&) 조합으로 구성되어야 합니다.";
			if (passwordCheck !== "" && password !== passwordCheck) {
				msg.passwordCheck = "비밀번호가 일치하지 않습니다.";
				setErrorMsg({ ...errorMsg, ...msg });
			} else {
				setErrorMsg({ ...errorMsg, ...msg });
			}
		} else if (passwordCheck !== "" && password !== passwordCheck) {
			msg.passwordCheck = "비밀번호가 일치하지 않습니다.";
			setErrorMsg({ ...errorMsg, ...msg });
		} else {
			setErrorMsg({ ...errorMsg, ...msg });
		}
	};

	const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues({ ...values, [name]: value });

		switch (name) {
			case "email":
				checkEmail(value) ? setIsDisabled(false) : setIsDisabled(true);
				break;
			case "passwordCheck":
				if (values.password === value) {
					setErrorMsg({ ...errorMsg, [name]: "" });
				} else {
					setErrorMsg({
						...errorMsg,
						[name]: "비밀번호가 일치하지 않습니다.",
					});
				}
		}
	};

	const onClickAuthBtn = () => {
		// 인증번호 발송 로직 구현해야함.
		axios
			.post(
				`${process.env.REACT_APP_SERVER_URL}/members/findPassword/sendmail`,
				{
					email: values.email,
				},
			)
			.then((res) => {
				if (res.data.active) {
					// 발송 되면 모달 띄우기
					setErrorMsg({
						...errorMsg,
						email: "",
					});
					Toast(ToastType.success, "인증번호가 발송되었습니다.");
					setIsConfirm({
						isOpen: true,
						auth: res.data.message,
						minutes: 5,
						seconds: 0,
					});
				} else {
					setErrorMsg({
						...errorMsg,
						email: "존재하지 않는 이메일입니다.",
					});
				}
			})
			.catch((error) => {
				console.log(error);
				// setErrorMsg({
				// 	...errorMsg,
				// 	email: "존재하지 않는 이메일입니다.",
				// });
			});
	};

	const onClickCerBtn = () => {
		// 인증번호가 일치하다면
		// 인증완료 토스트 창 띄우고
		if (isConfirm.auth === values.authNum) {
			Toast(ToastType.success, "인증이 완료되었습니다.");
			setIsAuth(true);
			setIsConfirm({ ...isConfirm, isOpen: false });
		} else {
			setErrorMsg({ ...errorMsg, authNum: "인증번호가 일치하지 않습니다." });
		}
	};

	const onClickReCerBtn = () => {
		axios
			.post(
				`${process.env.REACT_APP_SERVER_URL}/members/findPassword/sendmail`,
				{
					email: values.email,
				},
			)
			.then((res) => {
				// 발송 되면 모달 띄우기
				setErrorMsg({
					...errorMsg,
					email: "",
				});
				Toast(ToastType.success, "인증번호가 발송되었습니다.");
				setIsConfirm({
					isOpen: true,
					auth: res.data.message,
					minutes: 5,
					seconds: 0,
				});
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const checkValues = useCallback(
		debounce((values: inputType, isAuth: boolean) => {
			let isBlank = false;
			let isNotValid = true;

			// 빈 값 체크
			for (const key in values) {
				if (values[key] === "") {
					isBlank = true;
				}
			}
			if (!isBlank && isAuth && values.passwordCheck === values.password) {
				isNotValid = false;
			}
			setEmpty(isNotValid);
		}, 700),
		[],
	);

	const onClickSubmitBtn = () => {
		console.log(values.email, values.password);

		axios
			.post(`${process.env.REACT_APP_SERVER_URL}/members/findPassword`, {
				email: values.email,
				newPassword: values.password,
			})
			.then((res) => {
				Toast(ToastType.success, "비밀번호 변경이 완료되었습니다.");
				setCookie("accessToken", res.data.accessToken, { path: "/" });
				navigate("/login");
			})
			.catch((error) => {
				console.log(error);
			});
	};

	useEffect(() => {
		checkValues(values, isAuth);
	}, [values, isAuth]);

	useEffect(() => {
		let countDown: NodeJS.Timeout | null = null;

		if (isConfirm.isOpen) {
			countDown = setInterval(() => {
				setIsConfirm((prevState) => {
					let seconds = prevState.seconds;
					let minutes = prevState.minutes;

					if (seconds > 0) {
						seconds--;
					} else {
						if (minutes > 0) {
							minutes--;
							seconds = 59;
						} else {
							clearInterval(countDown!);
						}
					}
					return { ...prevState, seconds, minutes };
				});
			}, 1000);
		}

		return () => {
			clearInterval(countDown!);
		};
	}, [isConfirm.isOpen, isConfirm.minutes === 5]);

	return (
		<Container>
			{!isAuth ? (
				<PasswordFindContainer>
					<Logo />
					<h3>비밀번호 찾기</h3>
					{/* <hr /> */}
					<h4>비밀번호를 찾고자하는 이메일을 입력해주세요.</h4>
					<div className="auth_input">
						<Input
							placeholder="이메일 입력"
							name="email"
							onChange={onChangeValues}
							disabled={isConfirm.minutes !== 0}
						/>
						<SubmitBtn disabled={isDisabled} onClick={onClickAuthBtn}>
							인증
						</SubmitBtn>
					</div>
					<Warning>{errorMsg.email}</Warning>
					{isConfirm.isOpen ? (
						<>
							<Title>인증번호</Title>
							<InputCtn>
								<AuthNumInput
									type="text"
									name="authNum"
									onChange={onChangeValues}
									// disabled={isAuth}
								/>
								{isConfirm.isOpen ? (
									<span>
										{isConfirm.minutes}:
										{isConfirm.seconds < 10
											? `0${isConfirm.seconds}`
											: isConfirm.seconds}
									</span>
								) : null}
								{isConfirm.minutes === 0 && isConfirm.seconds === 0 ? (
									<ReAuthBtn onClick={onClickReCerBtn}>재발송</ReAuthBtn>
								) : (
									<AuthBtn onClick={onClickCerBtn}>확인</AuthBtn>
								)}
							</InputCtn>
							<Warning>{errorMsg.authNum}</Warning>
						</>
					) : null}
				</PasswordFindContainer>
			) : (
				<PasswordFindContainer>
					<Logo />
					<h3>비밀번호 재설정</h3>
					<Title>비밀번호</Title>
					<PasswordLabel>
						<Input
							type={isVisible ? "text" : "password"}
							name="password"
							onChange={onChangeValues}
							onBlur={onBlurInputs}
						/>
						<button className="eye_btn" onClick={onClickVisibleBtn}>
							{isVisible ? (
								<SvgIcon
									component={VisibilityOffRoundedIcon}
									sx={{ stroke: "#ffffff", strokeWidth: 1 }}
								/>
							) : (
								<SvgIcon
									component={VisibilityRoundedIcon}
									sx={{ stroke: "#ffffff", strokeWidth: 1 }}
								/>
							)}
						</button>
					</PasswordLabel>
					<Warning>{errorMsg.password}</Warning>
					<Title>비밀번호 확인</Title>
					<Input
						type="password"
						name="passwordCheck"
						onChange={onChangeValues}
						onBlur={onBlurInputs}
						// onClick={checkPwdCheckInput}
					/>
					<Warning>{errorMsg.passwordCheck}</Warning>
					<Submit disabled={empty} onClick={onClickSubmitBtn}>
						<p>비밀번호 변경</p>
					</Submit>
				</PasswordFindContainer>
			)}
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	height: 70vh;
	display: flex;
	justify-content: center;
	align-items: center;
	/* text-align: center; */
`;

const PasswordFindContainer = styled.div`
	width: 50rem;
	padding: 2rem;

	h3 {
		font-size: 2.2rem;
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		margin-bottom: 2rem;
	}

	h4 {
		margin-bottom: 2rem;
		font-size: 1.6rem;
		font-weight: 600;
	}

	hr {
		border: 0;
		width: 100%;
		height: 1px;
		background-color: ${(props) => props.theme.COLORS.GRAY_300};
		margin-bottom: 2rem;
	}

	p {
		margin-bottom: 2rem;
		font-size: 1.4rem;
		font-weight: 400;
	}

	.auth_input {
		display: flex;
		gap: 1rem;

		button {
			margin: 0;
			width: 20%;
			color: ${(props) => props.theme.COLORS.WHITE};
			font-weight: 600;
		}
	}

	.eye_btn {
		top: 0;
	}
`;

const AuthNumInput = styled(Input)``;

const InputCtn = styled(InputContainer)`
	span {
		right: 9.5rem;
	}
`;

const AuthBtn = styled(SubmitBtn)`
	margin: 0;
	color: #ffffff;
	font-weight: 600;
	width: 20%;
`;

const Submit = styled(SubmitBtn)`
	margin-top: 2rem;
	p {
		font-size: 1.4rem;
		margin: 0;
	}
`;

const Warning = styled(WarningTitle)`
	font-size: 1.2rem !important;
	font-weight: 400 !important;
`;

const ReAuthBtn = styled(AuthBtn)`
	color: ${(props) => props.theme.COLORS.WHITE};
	background-color: ${(props) => props.theme.COLORS.LIGHT_RED};
`;

export default PasswordFind;
