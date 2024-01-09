import moment from "moment";
import dateAsKor from "src/utils/dateAsKor";
import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { type modalType } from ".";
import { useState } from "react";

interface Props {
	isOpen: modalType;
}

const WriteModal = ({ isOpen }: Props) => {
	const [money, setMoney] = useState<string>("0");

	console.log(money);

	const onChangeMoney = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;

		// 입력값에 e가 입력되는 것은 추후에 막아볼 예정
		if (inputValue.startsWith("0")) {
			setMoney(inputValue.substring(1));
		} else {
			setMoney(inputValue);
		}
	};
	return (
		<Container $isOpen={isOpen.writeIcon}>
			<SvgIcon
				component={ClearOutlinedIcon}
				sx={{ stroke: "#ffffff", strokeWidth: 1 }}
			/>
			<h4>
				{dateAsKor(
					moment(isOpen.day, "YYYY. M. D. a H:mm:ss").format("YYYY-MM-DD"),
				).replace(/\d+년/, "")}{" "}
				가계부
			</h4>
			<p className="p__info">금액을 입력해주세요</p>
			<div className="money__write">
				<h5>{money}원</h5>
				<input value={money} size={16} onChange={onChangeMoney} type="number" />
			</div>
		</Container>
	);
};

const Container = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  width: 24.863rem;
  height: ${(props) => (props.$isOpen ? "42.8rem" : "0px")};
  overflow-y: hidden;
  border-radius: 8px;
  background: white;
  right: -0.2rem;
  margin-right: 12.5rem;
  color: rgb(70, 70, 86);
  transition: 0.3s ease-in-out;
  border: ${(props) => (props.$isOpen ? "1px solid #d9d9d9" : "")};
  padding: ${(props) => (props.$isOpen ? "2rem" : "")};
  /* z-index: 75; */

  svg {
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

  h5 {
    font-size: 1.4rem;
    white-space: nowrap;
  }

  .p__info {
    margin-top: 2.5rem;
    color: #99affe;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .money__write  {
    margin-top: 1rem;
    display: flex;
    height: 5rem;
    position:relative:
  }
  
  input {
    position: absolute;
    top: 8rem;
    width: 10rem;
    cursor:pointer;
    border: none;
    font-size: 1.8rem;
    font-weight: 600;
    color: transparent;
    background-color: transparent;
  }

  input:focus {
    padding-bottom: 0.3rem;
    border-bottom: 0.1rem solid rgb(198, 198, 208);
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export default WriteModal;
