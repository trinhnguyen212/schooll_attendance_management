//import { Branch } from './branch';

export type SchoolOfThought = {
    id: number;
    shortcode: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type SchoolOfThoughtDetail = SchoolOfThought & {
};
export type QuerySchoolOfThoughtType = {
    page?: number;
    perPage?: number;
    search?: string;
};
