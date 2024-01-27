import { ResponsivePie } from "@nivo/pie";

const PieChart = ({ stat }: any) => {
	console.log(stat);

	const handle = {
		padClick: (data: any) => {
			console.log(data);
		},

		legendClick: (data: any) => {
			console.log(data);
		},
	};
	return (
		// chart height이 100%이기 때문이 chart를 덮는 마크업 요소에 height 설정
		<ResponsivePie
			/**
			 * chart에 사용될 데이터
			 */
			data={[...stat.data.tags].map((tag) => {
				const obj = {
					id: tag.tagName,
					value: tag.tagSum,
				};
				return obj;
			})}
			/**
			 * chart margin
			 */
			margin={{ right: 120, top: 10 }}
			/**
			 * chart 중간 빈공간 반지름
			 */
			innerRadius={0.7}
			/**
			 * pad 간격
			 */
			padAngle={0}
			/**
			 * pad radius 설정 (pad별 간격이 있을 시 보임)
			 */
			cornerRadius={1}
			/**
			 * chart 색상
			 */
			colors={
				stat.title === "이번 달 지출"
					? ["#F7532E", "#FA785B", "#FF9680", "#FFB5A4"]
					: stat.title === "이번 달 수입"
					  ? ["#5F82FE", "#839DFA", "#BECCFF", "#CDD8FF"]
					  : ["#00935D", "#15BD7F", "#76DBB6", "#9AF3D2"]
			} // 커스터하여 사용할 때
			// colors={{ scheme: "nivo" }} // nivo에서 제공해주는 색상 조합 사용할 때
			/**
			 * pad border 두께 설정
			 */
			borderWidth={0}
			/**
			 * link label skip할 기준 각도
			 */

			enableArcLabels={false}
			enableArcLinkLabels={false}
			arcLinkLabelsSkipAngle={0}
			/**
			 * link label 색상
			 */
			arcLinkLabelsTextColor="#000000"
			/**
			 * link label 연결되는 선 두께
			 */
			arcLinkLabelsThickness={2}
			/**
			 * link label 연결되는 선 색상
			 */
			arcLinkLabelsColor={{ from: "color" }} // pad 색상에 따라감
			/**
			 * label (pad에 표현되는 글씨) skip할 기준 각도
			 */
			sortByValue={true}
			arcLabelsSkipAngle={10}
			theme={{
				/**
				 * label style (pad에 표현되는 글씨)
				 */
				labels: {
					text: {
						fontSize: 14,
						fill: "#000000",
					},
				},
				/**
				 * legend style (default로 하단에 있는 색상별 key 표시)
				 */
				legends: {
					text: {
						fontSize: 12,
						fill: "#4F4F4F",
					},
				},
			}}
			/**
			 * pad 클릭 이벤트
			 */
			onClick={handle.padClick}
			/**
			 * legend 설정 (default로 하단에 있는 색상별 key 표시)
			 */
			legends={[
				{
					anchor: "right", // 위치
					direction: "column", // item 그려지는 방향
					justify: false, // 글씨, 색상간 간격 justify 적용 여부
					translateX: 60, // chart와 X 간격
					translateY: -15, // chart와 Y 간격
					itemsSpacing: 1, // item간 간격
					itemWidth: 30, // item width
					itemHeight: 20, // item height
					itemDirection: "left-to-right", // item 내부에 그려지는 방향
					itemOpacity: 1, // item opacity
					symbolSize: 10, // symbol (색상 표기) 크기
					symbolShape: "square", // symbol (색상 표기) 모양
					effects: [
						{
							// 추가 효과 설정 (hover하면 textColor를 olive로 변경)
							on: "hover",
							style: {
								itemTextColor: "#h4h4h4",
							},
						},
					],
					onClick: handle.legendClick, // legend 클릭 이벤트
				},
			]}
		/>
	);
};

export default PieChart;
