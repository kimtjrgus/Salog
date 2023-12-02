import { styled } from "styled-components";
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

const Dashboard = () => {
	const expData = {
		// labels: ["식비", "교통비", "주거비"],
		datasets: [
			{
				labels: ["식비", "교통비", "주거비"],
				data: [60, 13, 27],
				borderWidth: 2,
				hoverBorderWidth: 3,
				backgroundColor: [
					"rgba(238, 102, 121, 1)",
					"rgba(98, 181, 229, 1)",
					"rgba(255, 198, 0, 1)",
				],
				fill: true,
			},
		],
	};
	return (
		<Container>
			<StatContainer>
				<StatList>
					<h3>이번 달 지출</h3>
					<h4>105,000원</h4>
					<hr />
					<Doughnut data={expData} height={120} />
				</StatList>
			</StatContainer>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
`;

const StatContainer = styled.ul`
	padding: 1.5rem;
	display: flex;
	height: 22rem;
`;

const StatList = styled.li`
	border: 1px solid ${(props) => props.theme.COLORS.GRAY_300};
	box-shadow: 0px 2px 10px rgb(0, 0, 0, 10%);
	border-radius: 6px;
	margin: 0 0.3rem;
	width: 25rem;

	h3 {
		font-size: 1.2rem;
		margin-left: 1.2rem;
		margin-top: 1.5rem;
		color: ${(props) => props.theme.COLORS.GRAY_600};
	}

	h4 {
		font-size: 1.8rem;
		margin-left: 1.2rem;
		margin-top: 0.8rem;
	}

	hr {
		border: 1px solid ${(props) => props.theme.COLORS.GRAY_200};
	}
`;

export default Dashboard;
