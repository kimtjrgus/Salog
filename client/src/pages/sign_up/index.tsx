import styled from "styled-components";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { ReactComponent as Logo } from "../../assets/Slogo.svg";
import { Input, PasswordLabel, SubmitBtn } from "../login";
import { checkEmail, checkPassword } from "src/utils/validCheck";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface inputType {
	email: string;
	password: string;
	passwordCheck: string;
	authNum: string;
}

interface errorType {
	email: string;
	password: string;
	passwordCheck: string;
	authNum: string;
}

interface disabledType {
	email: boolean;
	authNum: boolean;
	submit: boolean;
}

interface validType {
	email: boolean;
	password: boolean;
	passwordCheck: boolean;
}

interface confirmType {
	isOpen: boolean;
	minutes: number;
	seconds: number;
}

const SignUp = () => {
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
	// 입력값 검사 통과 여부(email은 유효성, 중복 검사 및 인증번호까지 포함)
	const [isPassValid, setIsPassValid] = useState<validType>({
		email: false,
		password: false,
		passwordCheck: false,
	});

	// 비밀번호 입력 창의 type=password or text
	const [isVisible, setIsVisible] = useState<boolean>(false);

	// 입력 창 버튼 비활성화 or 활성화 상태
	const [isDisabled, setIsDisabled] = useState<disabledType>({
		email: true,
		authNum: true,
		submit: true,
	});
	const [isConfirm, setIsConfirm] = useState<confirmType>({
		isOpen: false,
		minutes: 5,
		seconds: 0,
	}); // 인증번호 발송 시 상태 (서버 기능 구현 전까지는 클릭하면 true로)

	const navigate = useNavigate();

	const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues({ ...values, [name]: value });

		switch (name) {
			case "email":
				checkEmail(value)
					? setIsDisabled({ ...isDisabled, email: false })
					: setIsDisabled({ ...isDisabled, email: true });
				break;
			case "password":
				if (!checkPassword(value)) {
					setErrorMsg({
						...errorMsg,
						[name]: "8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.",
					});
					setIsPassValid({ ...isPassValid, password: false });
				} else {
					setErrorMsg({ ...errorMsg, [name]: "" });
					setIsPassValid({ ...isPassValid, password: true });
				}
				break;
			case "passwordCheck":
				if (values.password !== value) {
					setErrorMsg({ ...errorMsg, [name]: "비밀번호가 일치하지 않습니다." });
					setIsPassValid({ ...isPassValid, passwordCheck: false });
				} else {
					setErrorMsg({ ...errorMsg, [name]: "" });
					setIsPassValid({ ...isPassValid, passwordCheck: true });
				}
				break;
		}
	};

	// 패스워드 확인 입력창 클릭 시 일치하는지 확인
	const checkPwdCheckInput = () => {
		if (values.password.length) {
			values.password !== values.passwordCheck
				? setErrorMsg({
						...errorMsg,
						passwordCheck: "비밀번호가 일치하지 않습니다.",
				  })
				: setErrorMsg({ ...errorMsg, passwordCheck: "" });
		}
	};

	// 비밀번호 표시/감추기 버튼 클릭 시 실행되는 함수
	const onClickVisibleBtn = () => {
		setIsVisible(!isVisible);
	};

	const onClickAuthBtn = () => {
		// 인증번호 발송 로직 구현해야함.
		// 발송 되면 모달 띄우기
		setIsConfirm({ isOpen: true, minutes: 5, seconds: 0 });
	};

	useEffect(() => {
		const countDown = setInterval(() => {
			if (isConfirm.seconds > 0)
				setIsConfirm({ ...isConfirm, seconds: isConfirm.seconds - 1 });
			if (isConfirm.seconds === 0) {
				if (isConfirm.minutes === 0) {
					clearInterval(countDown);
				} else {
					setIsConfirm({
						...isConfirm,
						minutes: isConfirm.minutes - 1,
						seconds: 59,
					});
				}
			}
		}, 1000);
		return () => {
			clearInterval(countDown);
		};
	}, [isConfirm.seconds, isConfirm.minutes]);

	return (
		<Container>
			<SignUpContainer>
				<Logo />
				<h3>회원가입</h3>
				<Title>이메일</Title>
				<InputContainer>
					<InputW80 type="email" name="email" onChange={onChangeValues} />
					<CerBtn disabled={isDisabled.email} onClick={onClickAuthBtn}>
						인증
					</CerBtn>
				</InputContainer>
				<WarningTitle>이미 존재하는 이메일입니다.</WarningTitle>
				<Title>인증번호</Title>
				<InputContainer>
					<InputW80 type="text" name="authNum" onChange={onChangeValues} />
					{isConfirm.isOpen ? (
						<span>
							{isConfirm.minutes}:{isConfirm.seconds}
						</span>
					) : null}
					<CerBtn>확인</CerBtn>
				</InputContainer>
				<Title>비밀번호</Title>
				<PasswordLabel>
					<Input
						type={isVisible ? "text" : "password"}
						name="password"
						onChange={onChangeValues}
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
					onClick={checkPwdCheckInput}
				/>
				<WarningTitle>{errorMsg.passwordCheck}</WarningTitle>
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
				<SubmitBtn disabled={isDisabled.submit}>
					<p>회원가입</p>
				</SubmitBtn>
			</SignUpContainer>
		</Container>
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
	height: 85vh;
	display: flex;
	flex-direction: column;

	h3 {
		font-size: 2.4rem;
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		margin-bottom: 2rem;
	}
`;

const Title = styled.p`
	color: ${(props) => props.theme.COLORS.GRAY_500};
	font-size: 1.4rem;
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

const InputContainer = styled.div`
	display: flex;
	justify-content: space-between;
	position: relative;

	span {
		font-size: 1.2rem;
		color: ${(props) => props.theme.COLORS.LIGHT_RED};
		position: absolute;
		top: 53%;
		right: 10.5rem;
	}
`;

const InputW80 = styled(Input)`
	width: 80%;
	height: 3.8rem;
`;

const CerBtn = styled.button`
	width: 15%;
	height: 3.8rem;
	margin-top: 1.5rem;
	border-radius: 6px;
	background-color: ${(props) => props.theme.COLORS.SKY};
	color: #6385ff;

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

const WarningTitle = styled.p`
	font-size: 1.2rem;
	margin-top: 0.5rem;
	color: ${(props) => props.theme.COLORS.LIGHT_RED};
`;

export default SignUp;
