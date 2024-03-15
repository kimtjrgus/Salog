import { styled } from "styled-components";
import { SvgIcon } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";

interface receiptPropsType {
  imageUrl: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReceiptCheckModal = ({ imageUrl, setIsOpen }: receiptPropsType) => {
  return (
    <Background
      onClick={() => {
        setIsOpen(false);
      }}
    >
      <ReceiptModal>
        <SvgIcon
          className="deleteIcon"
          component={ClearOutlinedIcon}
          onClick={() => {
            setIsOpen(false);
          }}
          sx={{ stroke: "#000000", strokeWidth: 1 }}
        />
        <img src={imageUrl} alt="영수증 이미지" />
      </ReceiptModal>
    </Background>
  );
};

export default ReceiptCheckModal;

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 150;
  position: fixed;
  top: 0;
  left: 0;
`;

const ReceiptModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 100;
  width: 50rem;
  height: 50rem;
  border-radius: 4px;

  > img {
    width: 100%;
    height: 100%;
  }

  .deleteIcon {
    position: absolute;
    right: 1rem;
    top: 1rem;
    float: right;
    font-size: 2.8rem;
    cursor: pointer;
  }
`;
