import { UserDetail } from './user';

export type Enrollment = {
    id: number,
    classeId: number,
    studentId: number,
};

export type EnrollmentDetail = Enrollment & {
    user: UserDetail;
};
