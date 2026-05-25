import { AppPermissionName } from './app-permission-name';
import { Branch } from './branch';
import { Role, RoleName } from './role';
import { SchoolOfThought } from './school-of-thought';
import { LearningObjective } from './learning-objective';
import { StudentStudying} from './student-studying';
import { StudentCurrentLevel } from './student-current-level';


export type User = {
    id: number;
    roleId: number;
    shortcode: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    gender: 'male' | 'female';
    address: string;
    disabilitiesAllergiesConditions: string | null;
    birthDate: string;
    schoolClassId: number | null;
    schoolOfThoughtId: number | null;
    branchId: number | null;
    isActive: boolean;
    emailVerifiedAt: string | null;
};

export type UserDetail = User & {
    role: Role;
    learningObjective: LearningObjective | null;
    studentStudying: StudentStudying | null;
    studentCurrentLevel: StudentCurrentLevel | null;
    schoolOfThought: SchoolOfThought | null;
    branch: Branch | null;

    childs: (User & {
        pivot: {
            userId: number;
            childId: number;
            id: number;
            createdAt: string;
            updatedAt: string;
        };
    })[] ;
};

export type UserWithPermissions = {
    childs: UserWithPermissions | undefined;
    user: UserDetail;
    permissions: AppPermissionName[];
};

export type QueryUserType = {
    role: RoleName;
    page?: number;
    perPage?: number;
    search?: string;
    schoolOfThoughtId?: string;
    branchId?: string;
};

export type ExportQueryUserType = Omit<QueryUserType, 'page' | 'perPage'> & {
    fields: string[];

    //
    format?: 'xlsx';
    //
};
