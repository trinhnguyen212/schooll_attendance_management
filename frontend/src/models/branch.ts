import { User } from './user';

export type Branch = {
    id: number;
    shortcode: string;
    name: string;
    email: string | null;
    phoneNumber: string;
    leaderId: number | null;
    createdAt: string;
    updatedAt: string;
};

export type BranchDetail = Branch & {
    leader: User | null;
};

export type QueryBranchType = {
    page?: number;
    perPage?: number;
    search?: string;
};
