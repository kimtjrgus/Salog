import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { SectionsContainer, Section } from "react-fullpage";
import { styled } from "styled-components";
import landing1 from "src/assets/landing1.png";
import landing3 from "src/assets/landing3.png";
import { useNavigate } from "react-router-dom";
import { Header } from "src/components/Layout/Header";

const Landing = () => {
  const navigate = useNavigate();

  const duration = 1000;
  const delay = 500;

  const options = {
    activeClass: "active", // the class that is appended to the sections links
    anchors: ["sectionOne", "sectionTwo", "sectionThree"],
    arrowNavigation: true, // use arrow keys
    className: "SectionContainer", // the class name for the section container
    delay: 1000, // the scroll animation speed
    navigation: true, // use dots navigation
    scrollBar: false, // use the browser default scrollbar
    sectionClassName: "Section", // the section class name
    // sectionPaddingTop: "0", // the section top padding
    // sectionPaddingBottom: "0", // the section bottom padding
    verticalAlign: false, // align the content of each section vertical
  };

  useEffect(() => {
    AOS.init();
  });

  return (
    <Container>
      <Header />
      <SectionsContainer {...options}>
        <Section className="first-div">
          <div className="first-div-left">
            <h3 data-aos="fade-right" data-aos-duration={duration}>
              <span>가계부 </span>를 작성하면서 추억도 함께 기록하는건 어떨까요?
            </h3>
            <p
              data-aos="fade-right"
              data-aos-duration={duration}
              data-aos-delay={delay}
            >
              <span>샐로그 </span>에서 가계부를 작성하여 지출과 수입을 기록하고
            </p>
            <p
              data-aos="fade-right"
              data-aos-duration={duration}
              data-aos-delay={delay}
            >
              일기를 작성하여 그 날의 추억을 기록해보세요!
            </p>
            <button
              data-aos="zoom-in"
              data-aos-duration={duration}
              data-aos-delay={delay * 3}
              onClick={() => {
                navigate("/login");
              }}
            >
              시작하기
            </button>
          </div>
          <img
            data-aos="fade-left"
            data-aos-duration={duration}
            data-aos-delay={delay * 2}
            src={landing1}
            alt="랜딩1"
          />
        </Section>
        <Section className="second-div">
          <div className="second-top">
            <img
              className="landing2"
              data-aos="fade-left"
              data-aos-duration={duration}
              src={landing3}
              alt="랜딩2"
            />
            <div
              className="second-title"
              data-aos="fade-right"
              data-aos-duration={duration}
              data-aos-delay={delay}
            >
              <h3>지출 · 수입을 기록하고 분석을 이용하여</h3>
              <h3>내역을 효과적으로 관리해봐요!</h3>
              <p>
                고정 지출 · 수입을 기록하면 일정 3일 전 알림을 받을 수 있어요!
              </p>
            </div>
          </div>
          <div className="second-bottom">
            <img
              className="landing3"
              data-aos="fade-left"
              data-aos-duration={duration}
              data-aos-delay={delay * 1.5}
              src={landing3}
              alt="랜딩2"
            />
            <img
              className="landing4"
              data-aos="fade-right"
              data-aos-duration={duration}
              data-aos-delay={delay * 2}
              src={landing3}
              alt="랜딩2"
            />
          </div>
        </Section>
        <Section className="third-div">
          일기 소개가 슬라이더로 들어갈 예정
        </Section>
      </SectionsContainer>
    </Container>
  );
};

export default Landing;

const Container = styled.div`
  .Section {
    display: flex !important;
  }

  .first-div {
    background: #f5faff;
    height: 100vh;
    display: flex;
    align-items: center;

    > img {
      height: 50%;
      margin-top: 12rem;
      margin-left: 5rem;
      margin-bottom: 10rem;
    }
  }

  .first-div-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 13%;

    > h3 {
      font-family: "Raleway-Bold";
      font-weight: 700;
      margin-bottom: 5rem;
      font-size: 2.6rem;

      > span {
        color: #7694fe;
      }
    }

    > p {
      font-family: "Raleway-Bold";
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;

      > span {
        font-size: 2rem;
        color: #7694fe;
      }
    }

    > button {
      font-size: 1.6rem;
      margin-top: 7rem;
      margin-bottom: 10rem;
      background: #5b7fff;
      color: white;
      border-radius: 4px;
      width: 40rem;
      padding: 1.2rem 1.5rem;

      &:hover {
        background: #7290ff;
      }
    }
  }

  .second-div {
    background: #f5faff;
    height: 100vh;
    flex-direction: column;
    overflow: none;

    .landing2 {
      border: 1px solid #dfdfdf;
      border-radius: 12px;
      width: 450px;
      height: 253px;
    }

    .landing3 {
      position: relative;
      right: 8rem;
      top: 2rem;
      border: 1px solid #dfdfdf;
      margin-top: 3rem;
      border-radius: 12px;
      width: 450px;
      height: 253px;
    }

    .landing4 {
      position: relative;
      bottom: 12rem;
      left: 3rem;
      border: 1px solid #dfdfdf;
      border-radius: 12px;
      width: 450px;
      height: 253px;
    }

    .second-top {
      width: 100%;
      display: flex;
      margin-top: 12rem;
      margin-left: 10rem;

      .second-title {
        width: 60%;
        text-align: center;

        > h3 {
          font-family: "Raleway-Bold";
          font-size: 3.2rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }
        > p {
          font-size: 1.4rem;
          color: #939393;
        }
      }
    }

    .second-bottom {
      margin: 0 auto;
    }
  }

  .third-div {
    background: #f5faff;
    height: 100vh;
    display: flex;
    align-items: center;
  }
`;
