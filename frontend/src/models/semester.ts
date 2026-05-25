import { Classe } from './classe';

export type Semester = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
};

export type SemesterDetail = Semester & {
    classes: Classe[];
};

export type QuerySemesterType = {
    page?: number;
    perPage?: number;
    search?: string;
};
