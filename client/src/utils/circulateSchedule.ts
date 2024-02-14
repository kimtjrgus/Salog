const circulateSchedule = (dateString:string) => {
  const currentDate = new Date(); // 현재 날짜와 시간을 가져옵니다.
  const targetDate = new Date(dateString); // 비교할 대상 날짜를 생성합니다.

  // 대상 날짜와 현재 날짜의 차이를 계산합니다.
  const differenceInTime = targetDate.getTime() - currentDate.getTime();
  // 1일은 24시간이고, 1시간은 60분, 1분은 60초, 1초는 1000밀리초
  const differenceInDays = differenceInTime / (1000 * 3600 * 24); // 밀리초를 일 단위로 변환

  return differenceInDays < 3; // 3일 미만이면 true를 반환합니다.
}

export default circulateSchedule;
