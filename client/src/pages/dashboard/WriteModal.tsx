import moment from "moment";
import dateAsKor from "src/utils/dateAsKor";
import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import { type modalType } from ".";
import React, { useState } from "react";

interface Props {
	isOpen: modalType;
	setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
}

interface hoverType {
	hover: boolean;
	click: boolean;
}

interface valuesType {
	division: string;
	money: string;
	category: string;
	method: string;
	account: string;
	memo: string;
}

const WriteModal = ({ isOpen, setIsOpen }: Props) => {
	const [isHovered, setIsHovered] = useState<hoverType>({
		hover: false,
		click: false,
	});

	const [values, setValues] = useState<valuesType>({
		division: "outgo",
		money: "0",
		category: "",
		method: "",
		account: "",
		memo: "",
	});

	// input hover, click, blur 감지 후 실행 함수
	const handleMouseEnter = () => {
		setIsHovered({ ...isHovered, hover: true });
	};
	const handleMouseLeave = () => {
		setIsHovered({ ...isHovered, hover: false });
	};
	const handleMouseClick = () => {
		setIsHovered({ ...isHovered, click: true });
	};
	const handleMouseBlur = () => {
		setIsHovered({ ...isHovered, click: false });
	};

	const onChangeMoney = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;

		// 입력값에 e가 입력되는 것은 추후에 막아볼 예정
		if (inputValue.startsWith("0")) {
			setValues({ ...values, money: inputValue.substring(1) });
		} else {
			setValues({ ...values, money: inputValue });
		}
	};

	const onClickCloseBtn = () => {
		setIsOpen({ ...isOpen, writeIcon: false });
	};

	const onChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, division: e.target.value });
	};

	const onChangeMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setValues({ ...values, method: e.target.value });
	};

	const onChangeAccount = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, account: e.target.value });
	};

	const onChangeMemo = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, memo: e.target.value });
	};

	return (
		<Container $isOpen={isOpen.writeIcon}>
			<SvgIcon
				className="deleteIcon"
				component={ClearOutlinedIcon}
				onClick={onClickCloseBtn}
				sx={{ stroke: "#ffffff", strokeWidth: 1 }}
			/>
			<h4>
				{dateAsKor(
					moment(isOpen.day, "YYYY. M. D. a H:mm:ss").format("YYYY-MM-DD"),
				).replace(/\d+년/, "")}{" "}
				가계부
			</h4>
			<div className="money__write">
				<div className="moneyUnit">
					<h5
						className={
							isHovered.hover || isHovered.click
								? "fromLeft hovered"
								: !isHovered.hover && isHovered.click
								  ? "fromLeft hovered"
								  : "fromLeft"
						}
					>
						{Number(values.money).toLocaleString()}원
					</h5>
					<SvgIcon
						className="writeIcon"
						component={EditOutlinedIcon}
						sx={{ stroke: "#ffffff", strokeWidth: 1 }}
					/>
				</div>
				<input
					className="money__write__input"
					value={values.money}
					size={16}
					onChange={onChangeMoney}
					type="number"
					onMouseEnter={handleMouseEnter}
					onClick={handleMouseClick}
					onBlur={handleMouseBlur}
					onMouseLeave={handleMouseLeave}
				/>
				{values.money === "0" ||
					(values.money === "" && (
						<p className="p__info">금액을 입력해주세요</p>
					))}
			</div>
			<div className="division">
				<p>분류</p>
				<div className="division__btn">
					<div className="form_radio_btn">
						<input
							id="outgo"
							type="radio"
							name="division"
							value="outgo"
							onChange={onChangeLabel}
							defaultChecked
						/>
						<label htmlFor="outgo">지출</label>
					</div>
					<div className="form_radio_btn">
						<input
							id="income"
							type="radio"
							name="division"
							value="income"
							onChange={onChangeLabel}
						/>
						<label htmlFor="income">수입</label>
					</div>
				</div>
			</div>
			<div className="category">
				<p>카테고리</p>
				<select className="category__select">
					<option>선택</option>
					<option value="식비">카테고리 완성 되면 추후 추가 예정</option>
				</select>
				<SvgIcon
					className="deleteIcon"
					component={ArrowDropDownOutlinedIcon}
					sx={{ stroke: "#ffffff", strokeWidth: 1 }}
				/>
			</div>
			<div className="category">
				<p>결제 수단</p>
				<select className="category__select" onChange={onChangeMethod}>
					<option>선택</option>
					<option value="현금">현금</option>
					<option value="카드">카드</option>
					<option value="이체">이체</option>
				</select>
				<SvgIcon
					className="deleteIcon"
					component={ArrowDropDownOutlinedIcon}
					sx={{ stroke: "#ffffff", strokeWidth: 1 }}
				/>
			</div>
			<div className="account">
				<p>거래처</p>
				<input
					className="account__input"
					type="text"
					onChange={onChangeAccount}
				/>
			</div>
			<div className="account">
				<p>메모</p>
				<input className="account__input" type="text" onChange={onChangeMemo} />
			</div>
			<div className="receipt">
				<p>영수증 업로드</p>
				<input className="account__input" type="file" />
			</div>
			<div className="explanation">
				<p>🖊️ 영수증 업로드시 자동으로 항목이 작성됩니다</p>
			</div>
			<button>작성하기</button>
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
  bottom: 3.12rem;
  margin-right: 12.5rem;
  color: rgb(70, 70, 86);
  transition: 0.3s ease-in-out;
  border: ${(props) => (props.$isOpen ? "1px solid #d9d9d9" : "")};
  padding: ${(props) => (props.$isOpen ? "2rem" : "")};
  /* z-index: 75; */

   p {
        font-size: 1.2rem;
        font-weight: 600;
        color: #6d6d75;
    }

  .deleteIcon {
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

  .moneyUnit {
    display: flex;
  }

  h5 {
    display: block;
    position: relative;
    font-size: 1.8rem;
    min-width: 12rem;
    overflow-x: hidden;
    height: 2.5rem;
    white-space: nowrap;
  }

  .p__info {
    color: #99affe;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .money__write  {
    margin-top: 1rem;
    height: 3.7rem;
    display: flex;
    flex-direction: column;
    position: relative:
  }

  .money__write__input {
    position: absolute;
    width: 12rem;
    border: none;
    font-size: 1.8rem;
    font-weight: 600;
    color: transparent;
    background-color: transparent;
    cursor: pointer;
    }

  .writeIcon {
    font-size: 2rem;
    display: none;
  }
  

    h5:after {
    content: '';
    display:block;
    margin-top: 0.2rem;
    border-bottom: 1px solid #78a1df;  
    transform: scaleX(0);  
    transition: transform 250ms ease-in-out;
    }

    h5.hovered:after { 
        transform: scaleX(1);
     }

    h5.fromLeft:after{  transform-origin:  0% 50%; }

  /* input:focus {
    padding-bottom: 0.3rem;
    border-bottom: 0.1rem solid rgb(198, 198, 208);
  } */

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .division {
    display:flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    margin-top: 1rem;
  }

  .division__btn {
    display:flex;
    gap: 4px;
  }

  .form_radio_btn {
    input {
        display:none;
    }

    label {
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: 500;
        border-radius: 6px;
        padding: 0.5rem 1.2rem;
        border : 0.2rem solid #C9C9C9;
        color: rgb(144, 144, 160);
    }
  }

  .form_radio_btn input[type="radio"]:checked + label {
    border: 0.2rem solid rgb(119, 152, 252);
    color: rgb(119, 152, 252);
  }

  .category {
    display: flex;
    justify-content: space-between;
    align-items:center;
    margin-top: 1.5rem;

    select {
        cursor: pointer;
        font-size: 1.2rem;
        position: relative;
        border: none;
        border-bottom: 1px solid #C9C9C9;
        width: 11rem;
        padding-bottom: 0.3rem;
        padding-left: 0.3rem;
        color: #616165;
        font-weight: 500;
        outline:none;
        -webkit-appearance:none; /* 크롬 화살표 없애기 */
        -moz-appearance:none; /* 파이어폭스 화살표 없애기 */
        appearance:none /* 화살표 없애기 */
    }

    svg {
        position:absolute;
        right:1.5rem;
        margin-bottom: 1rem;
    }
  }

  .account {
    display: flex;
    justify-content: space-between;
    align-items:center;
    margin-top: 1.5rem;

     .account__input {
        border:none;
        border-bottom: 0.5px solid #C9C9C9;
        width: 11rem;
        padding-bottom: 0.3rem;
        padding-left: 0.3rem;
        font-weight: 500;
        font-size:1.2rem;
        color: #616165;
    }
  }

  .receipt {
    display:flex; 
    flex-direction: column;
    margin-top: 1.5rem;

    input {
        border: 1px solid #C9C9C9;
        border-radius: 4px;
        margin-top: 1rem;
        font-size: 1.2rem;
    }

    input[type=file]::file-selector-button {
        cursor: pointer;
        width: 60px;
        height: 27px;
        font-size: 1.1rem;
        border: none;
        border-right: 1px solid #C9C9C9;
        border-radius:4px;
    }
  }

  .explanation {
    display: flex;
    margin-top: 0.5rem;
    
    p{
        font-size: 1rem;
        white-space: nowrap;
    }
  }

  button {
    width: 100%;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    border-radius: 4px;
    height: 35px;
    margin-top: 3.5rem;
    color: white;
    font-weight: 500;
  }

`;

export default WriteModal;
