

export type AttendanceResult = {
    id: number;
    attendanceId: number;
    userId: number;
    attendanceStatus: boolean | string | number |undefined;
    createdAt: string;
    updatedAt: string;
};

