import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import GlobalStyle from "./styles/GlobalStyle";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import Theme from "./styles/Theme";
import RefreshToken from "./utils/refreshToken";

export const persistor = persistStore(store);

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);
root.render(
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<BrowserRouter>
				<RefreshToken />
				<ThemeProvider theme={Theme}>
					<GlobalStyle />
					<App />
				</ThemeProvider>
			</BrowserRouter>
		</PersistGate>
	</Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
