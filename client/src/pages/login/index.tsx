import styled from "styled-components";
import { useState } from "react";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { ReactComponent as Kakao } from "../../assets/Kakao.svg";
import { ReactComponent as Google } from "../../assets/Google.svg";
import { ReactComponent as Naver } from "../../assets/Naver.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setCookie } from "src/utils/cookie";

interface userType {
	email: string;
	password: string;
}

const Login = () => {
	const [values, setValues] = useState<userType>({ email: "", password: "" });
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const navigate = useNavigate();

	// 이메일, 비밀번호가 변경될 때 상태를 저장하는 함수
	const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues({ ...values, [name]: value });
	};
	// 비밀번호 표시/감추기 버튼 클릭 시 실행되는 함수
	const onClickVisibleBtn = () => {
		setIsVisible(!isVisible);
	};

	const onClickLoginBtn = () => {
		// 유효성 검사가 true라면
		axios
			.post("http://localhost:8000/login", values)
			.then((res) => {
				setCookie("accessToken", res.data.accessToken, { path: "/" });
				navigate("/");
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<Container>
			<LoginContainer>
				<h2>로그인</h2>
				<LoginDiv>
					<Title>이메일</Title>
					<Input type="email" name="email" onChange={onChangeValues} />
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
					<SubmitBtn onClick={onClickLoginBtn}>
						<p>로그인</p>
					</SubmitBtn>
				</LoginDiv>
				<RedirectContainer>
					<p>비밀번호를 잊으셨나요?</p>
					<span>비밀번호 찾기</span>
				</RedirectContainer>
				<RedirectContainer>
					<p>아직 회원이 아니신가요?</p>
					<span
						onClick={() => {
							navigate("/signup");
						}}
					>
						회원가입
					</span>
				</RedirectContainer>
				<TitleWithLine>
					<hr />
					<span>또는</span>
					<hr />
				</TitleWithLine>
				<OauthBtnContainer>
					<OauthBtn>
						<Kakao />
					</OauthBtn>
					<OauthBtn>
						<Google />
					</OauthBtn>
					<OauthBtn>
						<Naver />
					</OauthBtn>
				</OauthBtnContainer>
			</LoginContainer>
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

const LoginContainer = styled.div`
	width: 43.5rem;
	height: 70vh;
	display: flex;
	flex-direction: column;
	align-items: center;

	h2 {
		text-align: center;
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	}
`;

const LoginDiv = styled.div`
	width: 43.5rem;
	margin-top: 4rem;
	display: flex;
	flex-direction: column;

	p {
		font-size: 1.4rem;
	}
`;

export const PasswordLabel = styled.label`
	position: relative;

	button {
		position: absolute;
		top: 47%;
		right: 2rem;

		svg {
			font-size: 20px;
		}
	}
`;

export const Input = styled.input.attrs({ required: true })`
	width: 100%;
	height: 4.3rem;
	margin-top: 1.5rem;
	padding-left: 1rem;
	padding-right: 5.5rem;
	border-radius: 0.6rem;
	border: 1px solid ${(props) => props.theme.COLORS.GRAY_400};
`;

const Title = styled.p`
	color: ${(props) => props.theme.COLORS.GRAY_500};
	margin-top: 2rem;
`;

export const SubmitBtn = styled.button`
	width: 100%;
	height: 4.3rem;
	margin-top: 5rem;
	margin-bottom: 2rem;
	border-radius: 0.8rem;
	background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};

	p {
		color: ${(props) => props.theme.COLORS.WHITE};
		font-weight: 500;
		font-size: 1.6rem;
	}

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

const RedirectContainer = styled.div`
	margin-top: 1rem;
	width: 19rem;
	text-align: center;
	justify-content: space-between;
	font-size: 1.2rem;

	p {
		display: inline;
		color: ${(props) => props.theme.COLORS.GRAY_500};
	}

	span {
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		margin-left: 0.5rem;
		cursor: pointer;
	}
`;

const TitleWithLine = styled.div`
	width: 43.5rem;
	margin-top: 1.5rem;
	font-size: 1.2rem;
	display: flex;
	align-items: center;

	hr {
		flex: auto;
		height: 1px;
		border: 0;
		background-color: ${(props) => props.theme.COLORS.GRAY_300};
	}

	span {
		padding: 0 10px;
		color: ${(props) => props.theme.COLORS.GRAY_500};
	}
`;

const OauthBtnContainer = styled.div`
	display: flex;
	margin-top: 1.5rem;
`;

const OauthBtn = styled.button`
	width: 40px;
	height: 40px;
	border: none;
	margin: 0 1.5rem;
`;

export default Login;
