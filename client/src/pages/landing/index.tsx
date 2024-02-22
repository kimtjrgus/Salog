import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { styled } from "styled-components";
import landing1 from "src/assets/landing1.png";
import landing2 from "src/assets/landing2.png";
import landing3 from "src/assets/landing3.png";
import landing4 from "src/assets/landing4.png";
import landing5 from "src/assets/landing5.png";
import landing6 from "src/assets/landing6.png";
import landing7 from "src/assets/landing7.png";
import { useNavigate } from "react-router-dom";
import { Header } from "src/components/Layout/Header";

const Landing = () => {
  const [showButton, setShowButton] = useState(false); // top 버튼을 보여주는 상태

  const navigate = useNavigate();

  const duration = 1000;
  const delay = 500;

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1, // 스크린에 보여지는 슬라이드 개수
    slidesToScroll: 1, // n장씩 뒤로 넘어가게 함
    centerMode: true, // 중앙정렬
    centerPadding: "0px", // 0px 하면 슬라이드 끝쪽 이미지가 안잘림
  };

  // const options = {
  //   activeClass: "aos-init aos-animate", // the class that is appended to the sections links
  //   anchors: ["One", "Two", "Three"],
  //   arrowNavigation: true, // use arrow keys
  //   className: "SectionContainer", // the class name for the section container
  //   delay: 1000, // the scroll animation speed
  //   navigation: true, // use dots navigation
  //   scrollBar: false, // use the browser default scrollbar
  //   sectionClassName: "div", // the section class name
  //   // sectionPaddingTop: "0", // the section top padding
  //   // sectionPaddingBottom: "0", // the section bottom padding
  // };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    AOS.init({
      once: true,
      useClassNames: true,
      animatedClassName: "aos-init aos-animate",
    });

    // Top 버튼을 위한 스크롤 감지
    const handleShowButton = () => {
      if (window.scrollY > 720) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener("scroll", handleShowButton);
    return () => {
      window.removeEventListener("scroll", handleShowButton);
    };
  }, []);

  return (
    <Container>
      <Header />
      <div className="first-div">
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
      </div>
      <div className="second-div">
        <div className="second-top">
          <img
            className="landing2"
            data-aos="zoom-in-up"
            data-aos-duration={duration}
            data-aos-delay={delay * 0.5}
            src={landing2}
            alt="랜딩2"
          />
          <div className="second-title" data-aos="fade-left">
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
            data-aos="zoom-in-up"
            data-aos-duration={duration}
            data-aos-delay={delay}
            src={landing3}
            alt="랜딩3"
          />
          <img
            className="landing4"
            data-aos="zoom-in-right"
            data-aos-duration={duration}
            data-aos-delay={delay * 2}
            src={landing4}
            alt="랜딩4"
          />
        </div>
      </div>
      <div className="third-div">
        <p data-aos="zoom-in" data-aos-duration={duration}>
          일기를 작성하여 그 날의 추억을 기록해보아요!
        </p>
        <span data-aos="zoom-in" data-aos-duration={duration}>
          당일 작성한 가계부가 있다면 내역을 확인할 수 있어요.
        </span>
        <SliderContainer
          data-aos="zoom-in"
          data-aos-duration={duration}
          data-aos-delay={delay}
        >
          <Slider {...settings}>
            <img className="landing5" src={landing5} alt="랜딩5" />
            <img className="landing5" src={landing6} alt="랜딩6" />
            <img className="landing5" src={landing7} alt="랜딩7" />
          </Slider>
        </SliderContainer>
      </div>
      {showButton && (
        <div className="scroll__container">
          <button id="top" onClick={scrollToTop} type="button">
            Top
          </button>
        </div>
      )}
    </Container>
  );
};

export default Landing;

const Container = styled.div`
  overflow: hidden;

  .scroll__container {
    position: fixed;
    right: 5%;
    bottom: 5%;
    z-index: 1;
  }
  #top {
    font-weight: bold;
    font-size: 1.5rem;
    padding: 15px 10px;
    background-color: #000;
    color: #fff;
    border: 1px solid rgb(210, 204, 193);
    border-radius: 50%;
    outline: none;
    cursor: pointer;
  }
  #top:hover {
    color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }

  .first-div {
    background: #f2f7ff;
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
    background: #f2f7ff;
    display: flex;
    height: 100vh;
    flex-direction: column;

    .landing2 {
      border: 1px solid #dfdfdf;
      border-radius: 12px;
      width: 45rem;
      height: 25.3rem;
    }

    .landing3 {
      position: relative;
      right: 8rem;
      top: 2rem;
      border: 1px solid #dfdfdf;
      margin-top: 3rem;
      border-radius: 12px;
      width: 45rem;
      height: 25.3rem;
    }

    .landing4 {
      position: relative;
      bottom: 12rem;
      left: 3rem;
      border: 1px solid #dfdfdf;
      border-radius: 12px;
      width: 45rem;
      height: 25.3rem;
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
    background: #f2f7ff;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

    > p {
      margin-top: 20rem;
      margin-bottom: 1.5rem;
      font-size: 3.2rem;
      font-weight: 700;
    }

    > span {
      font-size: 1.4rem;
      margin-bottom: 4rem;
      font-weight: 500;
      color: #939393;
    }

    .landing5 {
      border-radius: 12px;
      width: 45rem;
      height: 28rem;
    }
  }
`;

const SliderContainer = styled.div`
  width: 50rem;
  height: 30rem;
  .slick-dots {
    .slick-active {
      button::before {
        color: black;
      }
    }
    button::before {
      color: #333333;
    }
  }

  .slick-prev:before,
  .slick-next:before {
    color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }
`;
