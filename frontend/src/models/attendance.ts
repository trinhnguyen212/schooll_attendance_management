import { Classe } from './classe';
import { Course } from './course';
//import { User } from './user';

export type Attendance = {
    id: number;
    classeId: number;
    name: string;
    attendanceDate: string;
   attendanceTime: number;
   startedAt: string | null;
   cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type AttendanceInMonth = Attendance & {
    classe: Classe & {
        course: Course;
    };
};

export type AttendanceDetail = Attendance& {

};



export type QueryAttendanceType = {
    month?: string;
    year?: string;

};


