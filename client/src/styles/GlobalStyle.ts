import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

const GlobalStyle = createGlobalStyle`
    ${reset}

    /* font */
    @font-face {
    font-family: 'Pretendard-Regular';
    src: url("./fonts/Pretendard-Regular.otf") format("truetype");
    }

    @font-face {
    font-family: 'Pretendard-Medium';
    src: url("./fonts/Pretendard-Medium.otf") format("truetype");
    }

    @font-face {
    font-family: 'Pretendard-SemiBold';
    src: url("./fonts/Pretendard-SemiBold.otf") format("truetype");
    }

    @font-face {
    font-family: 'Raleway-Bold';
    src: url("./fonts/Raleway-Bold.otf") format("truetype");
    }

    :root{
        --color-primary: #839DFA;
        --color-warning: #FFB11A;
        --color-safety: #1BBF83; 
        --color-danger: #FD6E4E;
        --color-black: #1E1E1E;
        --color-gray: #464656;
        --color-white: #FFFFFF;
        --color-border: #D0D0D0;
    }

    *{
        box-sizing: border-box;
    }

    html{
        font-size: 62.5%;
    }

    body{
        color: var(--color-black);
        font-family: 'Pretendard-Regular';
        font-size: 1.6rem;
    }

    h1,h2,h3,h4,h5,h6{
        font-family: 'Pretendard-SemiBold';
        font-size: 2.8rem
    }

    ol,ul,li{
        list-style: none;
    }

    a{
        text-decoration: none;
        color: inherit;
        cursor: pointer;
        display: block;
    }
    
    input, button{
        outline: none;
    }

    button {
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        color:inherit
    }

    span {
        color: inherit;
    }

    // icon setting
    .material-icons-round {
        font-size: inherit;
        display: block;
        color: inherit;
    }
`;

export default GlobalStyle;
