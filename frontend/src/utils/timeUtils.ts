const timeUtils = {
    countDown(dateTime: Date) {
        const timeRemaining = (dateTime.getTime() - new Date().getTime()) / 1000;
        const date = new Date(0);
        if (timeRemaining >= 0) {
            date.setSeconds(timeRemaining);
        }
        else {
            date.setSeconds(0);
        }
        return date.toISOString().substring(11, 19);
    },
    isTimeWithinOneHour(dateTime: Date) {
        const currentDateTime = new Date();
        const oneHourMiliSeconds = 60 * 60 * 1000;
        const offset = dateTime.getTime() - currentDateTime.getTime();
        return offset > 0 && offset < oneHourMiliSeconds;
    },


    isOnTimeAttendance(attendanceDate: Date, attendanceTime: number) {
        const currentDateTime = new Date();
        const attendanceEndTime = attendanceDate.getTime() + attendanceTime * 60 * 1000;
        return attendanceDate.getTime() < currentDateTime.getTime()
            && currentDateTime.getTime() < attendanceEndTime;
    }
};

export default Object.freeze(timeUtils);
