import styled from "styled-components";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { ReactComponent as Logo } from "../../assets/Slogo.svg";
import { Input, PasswordLabel, SubmitBtn } from "../login";
import { useState } from "react";

interface inputType {
	email: string;
	password: string;
	passwordCheck: string;
	authNum: string;
	isAuth: boolean;
}

const SignUp = () => {
	const [values, setValues] = useState<inputType>({
		email: "",
		password: "",
		passwordCheck: "",
		authNum: "",
		isAuth: false,
	});
	const [isVisible, setIsVisible] = useState<boolean>(false);

	const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues({ ...values, [name]: value });
	};
	// 비밀번호 표시/감추기 버튼 클릭 시 실행되는 함수
	const onClickVisibleBtn = () => {
		setIsVisible(!isVisible);
	};

	return (
		<Container>
			<SignUpContainer>
				<Logo />
				<h3>회원가입</h3>
				<Title>이메일</Title>
				<InputContainer>
					<InputW80 type="email" name="email" onChange={onChangeValues} />
					<CerBtn>인증</CerBtn>
				</InputContainer>
				<Title>인증번호</Title>
				<InputContainer>
					<InputW80 type="text" name="authNum" onChange={onChangeValues} />
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
				<Title>비밀번호</Title>
				<Input type="password" name="passwordCheck" onChange={onChangeValues} />
				<SmallTitle>
					이미 계정이 있으신가요? <span>로그인 화면으로 이동</span>
				</SmallTitle>
				<SubmitBtn>
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
`;

export default SignUp;
