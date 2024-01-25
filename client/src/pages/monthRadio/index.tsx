import { styled } from "styled-components";
import { ResponsiveLine } from "@nivo/line";
import { useEffect, useState } from "react";
import { type outgoType } from "../imcome_outgo";
import axios from "axios";

const MonthRatio = () => {
	const [outgo, setOutgo] = useState<outgoType[]>([]);
	console.log(outgo);

	const data = [
		{
			id: "events",
			data: [
				{
					x: "2021-03-01",
					y: 314,
				},
				{
					x: "2021-03-02",
					y: 201,
				},
				{
					x: "2021-04-01",
					y: 309,
				},
			],
		},
	];

	useEffect(() => {
		axios
			.get("http://localhost:8000/outgo")
			.then((res) => {
				setOutgo(res.data);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	return (
		<Container>
			<h3>1월 지출 분석</h3>
			<TopContainer>
				<LineGraph>
					<div className="left__line">
						<div className="left">
							<h5>이번 달 총 지출</h5>
							<p>454,000원</p>
							<p>
								지난 달 보다 <span>+ 50,000원</span>
							</p>
							<ResponsiveLine
								data={data}
								xScale={{
									type: "time",
									format: "%Y-%m-%d",
									precision: "month",
									useUTC: false,
								}}
								xFormat="time:%Y-%m-%d"
								yScale={{
									type: "linear",
								}}
								yFormat=" >-.2f"
								axisLeft={{
									legendOffset: 12,
								}}
								axisBottom={{
									format: "%b %d",
									tickValues: "every month",
									legend: "time scale",
								}}
								colors={{ scheme: "reds" }}
								lineWidth={2}
								pointSize={8}
								pointBorderWidth={1}
								pointBorderColor={{
									from: "color",
									modifiers: [["darker", 0.3]],
								}}
								// enableSlices={false}
								enableGridX={false}
								enableGridY={false}
								legends={[]}
							/>
						</div>
					</div>
				</LineGraph>
			</TopContainer>
		</Container>
	);
};

export default MonthRatio;

const Container = styled.div`
	margin: 2rem 3rem;

	h3 {
		font-size: 2rem;
		color: #464656;
	}
`;

const TopContainer = styled.div`
	width: 100%;
	height: 20rem;
	display: flex;
	margin-top: 3rem;
`;

const LineGraph = styled.div`
	.left__line {
		width: 55rem;
		height: 23rem;
		padding: 1.5rem;
		border: 1px solid #c2c2c2;
		border-radius: 4px;

		h5 {
			font-size: 1.3rem;
			font-weight: 400;
			margin-bottom: 1rem;
		}

		p {
			font-size: 1.8rem;
			font-weight: 600;

			&:nth-child(3) {
				margin-top: 1.5rem;
				font-size: 1rem;
				color: #464656;
			}
		}

		span {
			font-size: 1rem;
			color: ${(props) => props.theme.COLORS.LIGHT_RED};
		}

		.left {
			width: 50%;
			height: 100%;
			border-right: 1px solid #c2c2c2;
		}
	}
`;
