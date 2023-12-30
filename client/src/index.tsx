import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/index";
import GlobalStyle from "./styles/GlobalStyle";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import Theme from "./styles/Theme";
import RefreshToken from "./utils/refreshToken";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<RefreshToken />
				<ThemeProvider theme={Theme}>
					<GlobalStyle />
					<App />
				</ThemeProvider>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
