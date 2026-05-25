/* eslint-disable @typescript-eslint/no-explicit-any */
import apiUtils from '~utils/apiUtils';
import request from '../config/api';
import { ApiResponseWithData, Pagination } from '../models/response';
import { StudentCurrentLevel } from '../models/student-current-level';
//import encodeFormData from '../utils/encodeFormData';

const prefix = 'student-current-levels';

export async function apiAutoCompleteStudentCurrentLevel(search: string) {
    try {
        const apiPath = `${prefix}/complete`;
        const res = await request.get(apiPath, {
            params: {
                search: search
            }
        });
        const { data } = res.data as ApiResponseWithData<StudentCurrentLevel[]>;
        return data;
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}
