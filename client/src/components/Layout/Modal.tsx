import React from "react";
import { styled } from "styled-components";

const StyledModal = styled.div`
	display: none;
	width: 100%;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.3);
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99;

	&.on {
		display: flex;
	}

	.msg-box {
		width: 40rem;
		background-color: ${(props) => props.theme.COLORS.WHITE};
		border-radius: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 5rem;

		span {
			font-size: 1.4rem;
			margin-bottom: 3rem;
		}

		.msg-title {
			font-size: 2rem;
			color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			font-weight: 600;
			margin-bottom: 2rem;
			white-space: pre-line;
			text-align: center;
			line-height: 1.5em;
		}

		.msg-body {
			font-size: 1.6rem;
			color: ${(props) => props.theme.COLORS.GRAY_500};
			font-weight: 600;
			margin-bottom: 3rem;
			white-space: pre-line;
			text-align: center;
			line-height: 1.5em;
		}

		.btn-box {
			display: flex;
			gap: 1rem;
		}

		button:first-child {
			background-color: ${(props) => props.theme.COLORS.GRAY_300};
			border-radius: 4px;
			padding: 0.5rem 1rem;
			font-size: 1.2rem;
			color: ${(props) => props.theme.COLORS.GRAY_600};
			font-weight: 500;
		}

		button:last-child {
			background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			border-radius: 4px;
			padding: 0.6rem 1rem;
			font-size: 1.2rem;
			color: ${(props) => props.theme.COLORS.WHITE};
			font-weight: 400;
		}
	}
`;

interface ModalProps {
	state: boolean;
	setState: (state: boolean) => void;
	icon?: string;
	msgTitle: string;
	msgBody?: string;
	children: React.ReactNode;
}

const Modal = (props: ModalProps) => {
	const { state, setState, icon, msgTitle, msgBody, children } = props;
	const handleState = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			setState(false);
		}
	};

	return (
		<StyledModal className={state ? "on" : ""} onClick={handleState}>
			<div className="msg-box">
				{icon && <span className="material-icons-round">{icon}</span>}
				{/* 줄바꿈이 필요할때는 \n 추가 */}
				<p className="msg-title">{msgTitle}</p>
				<p className="msg-body">{msgBody}</p>
				<div className="btn-box">{children}</div>
			</div>
		</StyledModal>
	);
};

export default Modal;
