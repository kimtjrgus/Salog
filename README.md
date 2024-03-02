# 📒 가계부 작성 및 일기 기록 웹서비스 README

<div align="center">
<img width="1082" alt="main" src="https://github.com/kimtjrgus/salog/assets/120611048/f4391ed8-e8ad-41db-9e4e-ac3f8878e385">
<br /> 
<br /> 
  
  ### 프로젝트 기간 : 2023.11.17 ~ ing

  ### 배포 링크 : <a href="http://www.salog.kro.kr" target="_blank">Salog</a>
<br />
  </div>

  <hr border="0px" />
  
  ![Component 70](https://github.com/kimtjrgus/salog/assets/120611048/52114883-7a5f-43b0-8a3a-a26072be37a3)
  
  <hr />
  
## 👥 팀원 구성
  |<img src="https://github.com/codestates-seb/seb43_main_004/assets/120611048/fd4b071f-c773-4a17-b27f-ec9656290fa5" width="130px" />|<img src="https://github.com/codestates-seb/seb43_main_004/assets/120611048/1c7f47bc-6dba-4d67-b189-5ac3148256fd" width="130px" />|<img src="https://github.com/codestates-seb/seb43_main_004/assets/120611048/c194e140-fb6b-4bec-8b60-5b8398258e86" width="130px" />
|:---:|:---:|:---:|
|[이용석](https://github.com/021Skyfall)|[김석현](https://github.com/kimtjrgus)|[선유준](https://github.com/YujunSun0)
|BE (팀장)|BE|FE|

## 🔧 기술 스택

### Common
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)
![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)

### Front-end
 ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
  ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
  ![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)
  ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
  <img src="https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white">
  <img src="https://img.shields.io/badge/amazon s3-569A31?style=for-the-badge&logo=amazon s3&logoColor=white">


   
   ### Back-end
   <img src="https://img.shields.io/badge/java-1E8CBE?style=for-the-badge&logo=java&logoColor=white"> <img src="https://img.shields.io/badge/intellijidea-000000?style=for-the-badge&logo=intellijidea&logoColor=white">
    <img src="https://img.shields.io/badge/spring boot-6DB33F?style=for-the-badge&logo=spring boot&logoColor=white">
    <img src="https://img.shields.io/badge/spring security-6DB33F?style=for-the-badge&logo=spring security&logoColor=white">
    <img src="https://img.shields.io/badge/mySQL-4479A1?style=for-the-badge&logo=mySQL&logoColor=white">
    <img src="https://img.shields.io/badge/JWT-d63aff?style=for-the-badge&logo=JWT&logoColor=white">
    ![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
    ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
    ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

## 🖥️ 페이지 별 기능 

## 📄 기획서

<a href="https://docs.google.com/spreadsheets/d/1_bI9UAymfg1Typ5DVZzbXZe_OQ08q-AZO9Ve1Ph1SL8/edit#gid=0" target="_blank">사용자 요구사항 정의서</a>
<br />
<br />
<a href="https://docs.google.com/spreadsheets/d/1_bI9UAymfg1Typ5DVZzbXZe_OQ08q-AZO9Ve1Ph1SL8/edit#gid=256906179" target="_blank">기능 명세서</a>
<br />
<br />
<a href="https://docs.google.com/spreadsheets/d/1_bI9UAymfg1Typ5DVZzbXZe_OQ08q-AZO9Ve1Ph1SL8/edit#gid=89922257" target="_blank">API 명세서</a>
<br />
<br />
<a href="https://docs.google.com/spreadsheets/d/1_bI9UAymfg1Typ5DVZzbXZe_OQ08q-AZO9Ve1Ph1SL8/edit#gid=1572238774" target="_blank">테이블 명세서</a>
<br />
<br />
<a href="https://docs.google.com/spreadsheets/d/1_bI9UAymfg1Typ5DVZzbXZe_OQ08q-AZO9Ve1Ph1SL8/edit#gid=1829469387" target="_blank">코드 컨벤션</a>

## 💡 브랜치 전략

- Git-flow 전략을 기반으로 main, develop 브랜치와 feature 보조 브랜치를 운용했습니다.
- main, develop, Feat 브랜치로 나누어 개발을 하였습니다.
  - main 브랜치는 배포 단계에서만 사용하는 브랜치입니다.
  - develop 브랜치는 개발 단계에서 git-flow의 master 역할을 하는 브랜치입니다.
  - Feat 브랜치는 기능 단위로 독립적인 개발 환경을 위하여 사용하고 merge 후 각 브랜치를 삭제해주었습니다.
 
## 프로젝트 후기

### 이용석
이번 프로젝트는 이전에 진행했던 경험을 바탕으로 팀을 구성하여 더욱 발전된 결과물을 만들어낼 수 있었습니다. 
개개인의 시간을 활용하여 진행된 프로젝트였기에 일정은 예상보다 조금 늘어났지만, 그만큼 더 깊고 세밀한 부분까지 고려할 수 있었습니다.

특히, 보안과 배포 환경에 대한 깊은 고찰을 할 수 있던 시간은 매우 값진 경험이었습니다. 
이런 과정에서 Oauth와 Docker 같은 새로운 기술을 접하면서 통신 프로토콜과 배포 방법에 대한 이해도 깊어졌습니다. 
이 과정에서는 어려움도 많았지만, 그 어려움을 극복하며 새로운 기술을 습득한 것은 큰 성취감을 주었습니다.

에러 로그 분석 방법 등, 제 자신의 성장을 체감할 수 있는 순간도 있었습니다. 
프로젝트에 참여한 팀원들에게 감사의 마음을 전하며, 앞으로 리펙토링을 통해 이 프로젝트를 완벽에 더 가까이 가져가고자 합니다.

### 김석현
후기 작성 공간

### 선유준
많은 것을 배울 수 있었던 프로젝트였습니다. 
프론트엔드를 혼자 담당하게 되어 기획한 모든 기능들을 구현 해내기 위해 노력하였으며, 점차 완성되어 가는 웹을 보며 뿌듯함을 느꼈습니다.

특히, 이번엔 Redux-toolkit을 사용하면서 리덕스 상태를 지속적으로 저장 및 복원하기 위한 Redux-persist를 사용하면서 전역상태를 사용해보는 경험을 해본 점이 좋았습니다.

아쉬운 점으로는 React의 상태를 관리하면서 서버와 통신 할 때 최신화하는 것을 위해 React-Query를 사용해보고 싶었지만, 기능을 구현하는 것에 초점을 두어 학습하지 못한 점이 아쉬웠습니다.

모두 고생하셨고 리팩토링을 통하여 더 나은 프로젝트 완성까지 화이팅해봅시다!
