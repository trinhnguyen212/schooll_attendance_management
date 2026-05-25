import { Attendance } from './attendance';

export type DashboarData = {
    numberOfTeachers: number;
    numberOfStudents: number;
    numberOfParents: number;
    numberOfClasses: number;
    numberOfCourses: number;
    attendancesInThisMonth: number;

    attendancesEachMonth: number[];
    todayAttendances: Attendance[];
};
