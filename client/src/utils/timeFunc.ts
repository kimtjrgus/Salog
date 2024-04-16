export const debounce = (
	func: (...args: any[]) => void, // 지연시키고자 하는 함수
	delay: number, // 호출이 지연될 시간
): ((...args: any[]) => void) => {
	let timeoutId: NodeJS.Timeout | null = null; // setTimeout에 의해 반환된 타이머 ID를 저장, 지연된 함수 호출을 취소하기 위해 사용됨

	return (...args: any[]) => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func(...args);
			timeoutId = null;
		}, delay);
	};
};
