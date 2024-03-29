import { useRef } from "react";

export default function useIntersectionObserver(callback: () => void) {
	// 컴포넌트가 리렌더링될 때마다 IntersectionObserver 인스턴스가 재생성 되는 것 방지
	const observer = useRef(
		new IntersectionObserver(
			(entries: IntersectionObserverEntry[]) => {
				entries.forEach((entry) => {
					// 타겟 요소가 루트 요소와 교차하면 콜백 실행
					if (entry.isIntersecting) {
						callback();
					}
				});
			},
			{ threshold: 1 },
		),
	);

	// Element는 DOM 요소를 나타내는 타입임
	const observe = (element: Element) => {		
		observer.current.observe(element);
	};

	const unobserve = (element: Element) => {
		observer.current.unobserve(element);
	};

	return [observe, unobserve];
}
