import styled from "styled-components";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { ReactComponent as Logo } from "../../assets/Slogo.svg";
import { Input, PasswordLabel, SubmitBtn } from "../login";
import { checkEmail, checkPassword } from "src/utils/validCheck";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "src/utils/timeFunc";
import axios from "axios";
import { setCookie } from "src/utils/cookie";
import Toast, { ToastType } from "src/components/Layout/Toast";
import Modal from "src/components/Layout/Modal";

export interface inputType {
	[key: string]: any;
	email: string;
	password: string;
	passwordCheck: string;
	authNum: string;
}

export interface errorType {
	email: string;
	password: string;
	passwordCheck: string;
	authNum: string;
}

export interface confirmType {
	isOpen: boolean;
	auth: string;
	minutes: number;
	seconds: number;
}

interface alarmType {
	webAlarm: boolean;
	emailAlarm: boolean;
}

const SignUp = () => {
	// 입력해야 하는 값들
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

	const [alarm, setAlarm] = useState<alarmType>({
		webAlarm: false,
		emailAlarm: false,
	});

	// 입력값 검사 통과 여부(email은 유효성, 중복 검사 및 인증번호까지 포함)
	const [isAuth, setIsAuth] = useState<boolean>(false);

	// 비밀번호 입력 창의 type=password or text
	const [isVisible, setIsVisible] = useState<boolean>(false);

	// 이메일 입력 창 버튼 비활성화 or 활성화 상태
	const [isDisabled, setIsDisabled] = useState<boolean>(true);
	const [empty, setEmpty] = useState<boolean>(true);

	const [isConfirm, setIsConfirm] = useState<confirmType>({
		isOpen: false,
		auth: "",
		minutes: 0,
		seconds: 0,
	}); // 인증번호 발송 시 상태 (서버 기능 구현 전까지는 클릭하면 true로)
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const navigate = useNavigate();

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
					setErrorMsg({ ...errorMsg, [name]: "비밀번호가 일치하지 않습니다." });
				}
		}
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

	// 비밀번호 표시/감추기 버튼 클릭 시 실행되는 함수
	const onClickVisibleBtn = () => {
		setIsVisible(!isVisible);
	};

	const onClickAuthBtn = () => {
		// 인증번호 발송 로직 구현해야함.
		axios
			.post(`${process.env.REACT_APP_SERVER_URL}/members/emailcheck`, {
				email: values.email,
			})
			.then(() => {
				axios
					.post(`${process.env.REACT_APP_SERVER_URL}/members/signup/sendmail`, {
						email: values.email,
					})
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
			})
			.catch((error) => {
				console.log(error);
				setErrorMsg({
					...errorMsg,
					email: "이미 존재하는 이메일입니다.",
				});
			});
	};

	const onClickCerBtn = () => {
		// 인증번호가 일치하다면
		if (isConfirm.auth === values.authNum) {
			setIsOpen(true);
			setIsAuth(true);
			setIsConfirm({ ...isConfirm, isOpen: false });
		} else {
			setErrorMsg({ ...errorMsg, authNum: "인증번호가 일치하지 않습니다." });
		}
	};

	// 재전송 버튼을 누르면 실행되는 함수
	const onClickReCerBtn = () => {
		axios
			.post(`${process.env.REACT_APP_SERVER_URL}/members/signup/sendmail`, {
				email: values.email,
			})
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

	const onChangeCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setAlarm({ ...alarm, [name]: checked });
	};

	const onClickSubmitBtn = () => {
		axios
			.post(`${process.env.REACT_APP_SERVER_URL}/members/signup`, {
				email: values.email,
				password: values.password,
				webAlarm: alarm.webAlarm,
				emailAlarm: alarm.emailAlarm,
			})
			.then((res) => {
				setCookie("accessToken", res.data.accessToken, { path: "/" });
				navigate("/login");
			})
			.catch((error) => {
				console.log(error);
			});
	};

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

	useEffect(() => {
		checkValues(values, isAuth);
	}, [values, isAuth]);

	return (
		<>
			<Container>
				<SignUpContainer>
					<Logo />
					<h3>회원가입</h3>
					<Title>이메일</Title>
					<InputContainer>
						<InputW80
							type="email"
							name="email"
							onChange={onChangeValues}
							disabled={isAuth || isConfirm.minutes !== 0}
						/>
						<CerBtnBlue
							disabled={isDisabled || isAuth}
							onClick={onClickAuthBtn}
						>
							인증
						</CerBtnBlue>
					</InputContainer>
					<WarningTitle>{errorMsg.email}</WarningTitle>
					{isConfirm.isOpen ? (
						<>
							<Title>인증번호</Title>
							<InputContainer>
								<InputW80
									type="text"
									name="authNum"
									onChange={onChangeValues}
									disabled={isAuth}
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
									<CerBtnRed onClick={onClickReCerBtn}>재발송</CerBtnRed>
								) : (
									<CerBtnBlue onClick={onClickCerBtn}>확인</CerBtnBlue>
								)}
							</InputContainer>
							<WarningTitle>{errorMsg.authNum}</WarningTitle>
						</>
					) : null}
					<Title>비밀번호</Title>
					<PasswordLabel>
						<Input
							type={isVisible ? "text" : "password"}
							name="password"
							onChange={onChangeValues}
							onBlur={onBlurInputs}
						/>
						<button onClick={onClickVisibleBtn}>
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
					<WarningTitle>{errorMsg.password}</WarningTitle>
					<Title>비밀번호 확인</Title>
					<Input
						type="password"
						name="passwordCheck"
						onChange={onChangeValues}
						onBlur={onBlurInputs}
						// onClick={checkPwdCheckInput}
					/>
					<WarningTitle>{errorMsg.passwordCheck}</WarningTitle>
					<Radio>
						<input
							type="checkbox"
							name="webAlarm"
							onChange={onChangeCheckBox}
						/>
						<span>웹 알림 수신 동의 (선택)</span>
						<input
							type="checkbox"
							name="emailAlarm"
							onChange={onChangeCheckBox}
						/>
						<span>이메일 알림 수신 동의 (선택)</span>
					</Radio>
					<SmallTitle>
						이미 계정이 있으신가요?{" "}
						<span
							onClick={() => {
								navigate("/login");
							}}
						>
							로그인 화면으로 이동
						</span>
					</SmallTitle>
					<SubmitBtn disabled={empty} onClick={onClickSubmitBtn}>
						<p>회원가입</p>
					</SubmitBtn>
				</SignUpContainer>
			</Container>
			<Modal
				state={isOpen}
				setState={setIsOpen}
				msgTitle="이메일 인증이 완료되었습니다."
			>
				<button
					onClick={() => {
						setIsOpen(false);
					}}
				>
					확인
				</button>
			</Modal>
		</>
	);
};

const Container = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const SignUpContainer = styled.div`
	width: 47rem;
	height: 90vh;
	display: flex;
	flex-direction: column;

	h3 {
		font-size: 2.4rem;
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		margin-bottom: 2rem;
	}
`;

export const Title = styled.p`
	color: ${(props) => props.theme.COLORS.GRAY_500};
	font-size: 1.4rem;
	margin-bottom: 1rem;
	margin-top: 2rem;
`;

const SmallTitle = styled(Title)`
	font-size: 1.2rem;
	margin-top: 3rem;

	span {
		margin-left: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: underline;
	}
`;

export const InputContainer = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 1rem;
	align-items: flex-start;
	position: relative;

	span {
		font-size: 1.2rem;
		color: ${(props) => props.theme.COLORS.LIGHT_RED};
		position: absolute;
		top: 36%;
		right: 10.5rem;
	}
`;

const InputW80 = styled(Input)`
	width: 80%;
	height: 3.8rem;

	&:focus {
		border: 1px solid ${(props) => props.theme.COLORS.LIGHT_BLUE};
	}
`;

const CerBtnBlue = styled.button`
	width: 15%;
	height: 3.8rem;
	border-radius: 6px;
	background-color: ${(props) => props.theme.COLORS.SKY};
	color: #6385ff;

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

const CerBtnRed = styled(CerBtnBlue)`
	color: ${(props) => props.theme.COLORS.WHITE};
	background-color: ${(props) => props.theme.COLORS.LIGHT_RED};
`;

export const WarningTitle = styled.p`
	font-size: 1.2rem;
	margin-top: 0.5rem;
	color: ${(props) => props.theme.COLORS.LIGHT_RED};
`;

const Radio = styled.div`
	display: flex;
	margin-top: 2rem;

	span {
		font-size: 1.3rem;
		align-self: center;
		margin-right: 2rem;
		color: ${(props) => props.theme.COLORS.GRAY_500};
		font-weight: 500;
	}

	input {
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 50%;
		border: 1px solid #999;
		appearance: none;
		cursor: pointer;
		transition: background 0.2s;
		margin-right: 0.5rem;
	}

	input:checked {
		background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		border: none;
	}
`;

export default SignUp;
