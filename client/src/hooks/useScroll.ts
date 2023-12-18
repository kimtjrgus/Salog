import { useState, useEffect, useRef } from "react";

export function useScroll() {
	const [scrollY, setScrollY] = useState<number>(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const listener = () => {
		if (containerRef.current) {
			const scrollTop = containerRef.current.scrollTop;
			setScrollY(scrollTop);
		}
	};

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.addEventListener("scroll", listener);
		}
		return () => {
			if (containerRef.current) {
				containerRef.current.removeEventListener("scroll", listener);
			}
		};
	}, []);
	return {
		scrollY,
		containerRef,
	};
}
