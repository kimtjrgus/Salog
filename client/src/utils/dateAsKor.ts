// 일기의 날짜 표시를 원하는 형식으로 바꿔주는 함수
const dateAsKor = (date: string) => {
	const weeks = ["일", "월", "화", "수", "목", "금", "토"];
	const dateString = new Date(date);
	const year = dateString.getFullYear();
	const month = dateString.getMonth() + 1;
	const day = dateString.getDate();
	const week = dateString.getDay();

	return `${year}년 ${month}월 ${day}일 (${weeks[week]})`;
};

export default dateAsKor;
