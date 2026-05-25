import { EnrollmentDetail } from './enrollment';
//
import { Attendance } from './attendance';
// //
import { Course } from './course';
import { User } from './user';

export type Classe = {
    id: number;
    teacherId: number;
    courseId: number;
    semesterId: number;
    shortcode: string;
    name: string;
};

export type ClasseDetail = Classe & {
    teacher: User;
    course: Course;
    enrollments: EnrollmentDetail[];
    attendances: Attendance [];
};

export type QueryClasseType = {
    semesterId?: number;
    search?: string;
    childId?: number; 
};
