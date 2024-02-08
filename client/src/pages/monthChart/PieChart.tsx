import { ResponsivePie } from "@nivo/pie";
import { styled } from "styled-components";

const PieChart = ({ stat }: any) => {
  const MaxCategory = () => {
    let maxValue = { tagName: "", tagSum: 0 };

    stat.data.tags.forEach((el: any) => {
      if (el.tagSum > maxValue.tagSum) maxValue = el;
    });
    return maxValue;
  };

  const { tagName, tagSum } = MaxCategory();

  const handle = {
    padClick: (data: any) => {
      console.log(data);
    },

    legendClick: (data: any) => {
      console.log(data);
    },
  };

  const margin = { left: 0, right: 150, top: 10, bottom: 50 };

  const styles = {
    root: {
      textAlign: "center" as any,
      position: "relative" as any,
      width: "38rem",
      height: "24rem",
    },
    overlay: {
      position: "absolute" as any,
      top: margin.top,
      right: margin.right,
      bottom: margin.bottom,
      left: margin.left,
      display: "flex",
      gap: 10,
      flexDirection: "column" as any,
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2rem",
      color: "#000000",
      // background: "#FFFFFF33",
      textAlign: "center" as any,
      // This is important to preserve the chart interactivity
      pointerEvents: "none" as any,
    },
    title: {
      fontSize: "1.1rem",
      color: "#757577",
      fontWeight: 400,
    },
    tagName: {
      fontSize: "1.8rem",
      color: "#464656",
      fontWeight: 600,
    },
    monthTotal: {
      fontSize: "1.3rem",
      color: "#464656",
      fontWeight: 600,
    },
  };
  return stat.sum === 0 && stat.data.monthlyTotal === 0 ? (
    <NullContainer>
      <NullPie></NullPie>
      <span>등록 된 지출 내역이 없습니다.</span>
    </NullContainer>
  ) : (
    <div style={styles.root}>
      <ResponsivePie
        /**
         * chart에 사용될 데이터
         */
        data={[...stat.data.tags].map((tag) => {
          const obj = {
            id: tag.tagName,
            value: tag.tagSum,
            label: `${tag.tagName}        ${tag.tagSum.toLocaleString()}원`,
          };
          return obj;
        })}
        /**
         * chart margin
         */
        margin={margin}
        /**
         * chart 중간 빈공간 반지름
         */
        innerRadius={0.9}
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
        colors={{ scheme: "pastel1" }}
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
              fontSize: "1.6rem",
              fill: "#464656",
            },
          },
          /**
           * legend style (default로 하단에 있는 색상별 key 표시)
           */
          legends: {
            text: {
              fontSize: "1.2rem",
              fontWeight: 600,
              whiteSpace: "pre",
              fill: "#464656",
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
            anchor: "top-right", // 위치
            direction: "column", // item 그려지는 방향
            justify: false, // 글씨, 색상간 간격 justify 적용 여부
            translateX: 140, // chart와 X 간격
            translateY: 0, // chart와 Y 간격
            itemsSpacing: 1, // item간 간격
            itemWidth: 140, // item width
            itemHeight: 20, // item height
            itemDirection: "left-to-right", // item 내부에 그려지는 방향
            itemOpacity: 1, // item opacity
            symbolSize: 10, // symbol (색상 표기) 크기
            symbolShape: "circle", // symbol (색상 표기) 모양
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
      <div style={styles.overlay}>
        <span style={styles.title}>최다 지출 카테고리</span>
        <span style={styles.tagName}>{tagName}</span>
        <span style={styles.monthTotal}>{tagSum.toLocaleString()}원</span>
      </div>
    </div>
  );
};

export default PieChart;

const NullContainer = styled.div`
  display: flex;
  align-items: center;

  span {
    font-size: 1.2rem;
    margin-left: 3rem;
    color: #6c6b6b;
  }
`;

const NullPie = styled.div`
  margin-left: 2rem;
  width: 180px;
  height: 180px;
  border: 8px solid #d6d6d6;
  border-radius: 50%;
`;
