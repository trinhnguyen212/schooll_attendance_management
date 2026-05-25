/* eslint-disable @typescript-eslint/no-explicit-any */
import apiUtils from '~utils/apiUtils';
import request from '../config/api';
import { ApiResponseWithData, Pagination } from '../models/response';
import { StudentStudying } from '../models/student-studying';
//import encodeFormData from '../utils/encodeFormData';

const prefix = 'student-studyings';

export async function apiAutoCompleteStudentStudying(search: string) {
    try {
        const apiPath = `${prefix}/complete`;
        const res = await request.get(apiPath, {
            params: {
                search: search
            }
        });
        const { data } = res.data as ApiResponseWithData<StudentStudying[]>;
        return data;
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}
