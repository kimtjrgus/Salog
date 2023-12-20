import { styled } from "styled-components";
import { Input, SubmitBtn } from "../login";
import { ReactComponent as Logo } from "../../assets/Slogo.svg";
import React, { useEffect, useState } from "react";
import { InputContainer, Title, type confirmType } from "../sign_up";
import { checkEmail } from "src/utils/validCheck";

const PasswordFind = () => {
	const [email, setEmail] = useState<string>("");
	const [authNum, setAuthNum] = useState<string>("");
	console.log(email, authNum);
	const [isDisabled, setIsDisabled] = useState<boolean>(true);
	const [isConfirm, setIsConfirm] = useState<confirmType>({
		isOpen: false,
		auth: "",
		minutes: 5,
		seconds: 0,
	}); // 인증번호 발송 시 상태 (서버 기능 구현 전까지는 클릭하면 true로)

	const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		checkEmail(e.target.value) ? setIsDisabled(false) : setIsDisabled(true);
	};

	const onClickAuthBtn = () => {
		// 이메일이 존재하는 경우
		// 인증번호 발송
		setIsConfirm({ ...isConfirm, isOpen: true, minutes: 5, seconds: 0 });
		// 존재하지 않으면 메세지 띄우기
	};

	const onClickCerBtn = () => {
		// 인증번호가 일치하다면
		// 인증완료 토스트 창 띄우고
		setIsConfirm({ ...isConfirm, isOpen: false });
	};

	const onChangeAuthNum = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAuthNum(e.target.value);
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
	}, [isConfirm.isOpen]);

	return (
		<Container>
			<PasswordFindContainer>
				<Logo />
				<h3>비밀번호 찾기</h3>
				{/* <hr /> */}
				<p>비밀번호를 찾고자하는 이메일을 입력해주세요.</p>
				<div className="auth_input">
					<Input placeholder="이메일 입력" onChange={onChangeEmail} />
					<SubmitBtn disabled={isDisabled} onClick={onClickAuthBtn}>
						인증
					</SubmitBtn>
				</div>
				{isConfirm.isOpen ? (
					<>
						<Title>인증번호</Title>
						<InputContainer>
							<AuthNumInput
								type="text"
								name="authNum"
								onChange={onChangeAuthNum}
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
								<ReAuthBtn>재발송</ReAuthBtn>
							) : (
								<AuthBtn onClick={onClickCerBtn}>확인</AuthBtn>
							)}
						</InputContainer>
					</>
				) : null}
			</PasswordFindContainer>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	height: 50vh;
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

	hr {
		border: 0;
		width: 100%;
		height: 1px;
		background-color: ${(props) => props.theme.COLORS.GRAY_300};
		margin-bottom: 2rem;
	}

	p {
		margin-bottom: 2rem;
		font-size: 1.6rem;
		font-weight: 600;
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
`;

const AuthNumInput = styled(Input)``;

const AuthBtn = styled(SubmitBtn)`
	margin: 0;
	color: #ffffff;
	font-weight: 600;
	width: 20%;
`;

const ReAuthBtn = styled(AuthBtn)`
	color: ${(props) => props.theme.COLORS.WHITE};
	background-color: ${(props) => props.theme.COLORS.LIGHT_RED};
`;

export default PasswordFind;
