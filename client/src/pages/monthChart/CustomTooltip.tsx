import { styled } from "styled-components";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <Container>
        <p className="label">{`${new Date(
          payload[0].payload.date
        ).getDate()}일 : ${payload[0].value}원`}</p>
      </Container>
    );
  }

  return null;
};

export default CustomTooltip;

/* styled-components */

const Container = styled.div`
  width: fit-content;
  font-size: 1.6rem;
  height: 2.8rem;
  padding: 8px;
  background-color: #fff;
  opacity: 0.85;
  border: 1px solid gray;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
