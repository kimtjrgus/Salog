import styled from "styled-components";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useState } from "react";

interface userType {
	email: string;
	password: string;
}

const Login = () => {
	const [values, setValues] = useState<userType>({ email: "", password: "" });
	console.log(values);

	const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { type, value } = e.target;
		setValues({ ...values, [type]: value });
	};

	return (
		<Container>
			<LoginContainer>
				<h2>로그인</h2>
				<LoginDiv>
					<Title>이메일</Title>
					<Input type="email" onChange={onChangeValues} />
					<Title>비밀번호</Title>
					<PasswordLabel>
						<Input type="password" onChange={onChangeValues} />
						<button>
							<SvgIcon
								component={VisibilityRoundedIcon}
								sx={{ stroke: "#ffffff", strokeWidth: 1 }}
							/>
						</button>
					</PasswordLabel>
					<SubmitBtn>
						<p>로그인</p>
					</SubmitBtn>
				</LoginDiv>
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
	height: 60vh;
	margin-top: 5rem;
	display: flex;
	flex-direction: column;

	p {
		font-size: 1.4rem;
	}
`;

const PasswordLabel = styled.label`
	position: relative;

	button {
		position: absolute;
		top: 50%;
		right: 2rem;

		svg {
			font-size: 20px;
		}
	}
`;

const Input = styled.input.attrs({ required: true })`
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

const SubmitBtn = styled.button`
	width: 100%;
	height: 4.3rem;
	margin-top: 5rem;
	border-radius: 0.8rem;
	background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};

	p {
		color: ${(props) => props.theme.COLORS.WHITE};
		font-weight: 500;
		font-size: 1.6rem;
	}
`;

export default Login;
