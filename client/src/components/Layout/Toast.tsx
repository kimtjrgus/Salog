import { toast, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export enum ToastType {
	success = "success",
	error = "error",
	warning = "warning",
	info = "info",
	action = "action",
}

const toastOptions: ToastOptions = {
	position: "top-right",
	autoClose: 3000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
	theme: "light",
};

const Toast = (type: ToastType, message: string) => {
	switch (type) {
		case "success":
			toast.success(message, {
				...toastOptions,
			});
			break;
		case "error":
			toast.error(message, {
				...toastOptions,
			});
			break;
		case "warning":
			toast.warning(message, {
				...toastOptions,
			});
			break;
		default:
			toast(message);
	}
};

export default Toast;
