const circulateScheduleNow = (dateString:string) => {
    const currentDate = new Date(); 
    const targetDate = new Date(dateString); 

    // 시간 정보를 제거합니다.
    currentDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    return currentDate.getTime() === targetDate.getTime(); // 시간 정보가 제거된 날짜를 비교합니다.
}

export default circulateScheduleNow;