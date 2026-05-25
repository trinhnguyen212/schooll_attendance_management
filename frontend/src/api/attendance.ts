/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { AttendanceResult } from '~models/attendance-result';
import { UserDetail } from '~models/user';
import request from '../config/api';
import { AttendanceDetail, AttendanceInMonth, QueryAttendanceType } from '../models/attendance';
import { ApiResponseWithData } from '../models/response';
import apiUtils from '../utils/apiUtils';
import encodeFormData from '../utils/encodeFormData';

const prefix = 'attendances';



export async function apiGetAttendanceById(id: string | number) {
    try {
        const apiPath = `${prefix}/${id}`;
        const res = await request.get(apiPath);
        const { data } = res.data as ApiResponseWithData<AttendanceDetail>;
        return data;
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiCreateAttendance(formData: FormData) {
    try {
        const apiPath = prefix;
        await request.post(apiPath, formData);
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiUpdateAttendance(formData: FormData, id: string | number) {
    try {
        const apiPath = `${prefix}/${id}`;
        const encodedData = encodeFormData(formData);
        await request.put(apiPath, encodedData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiDeleteAttendance(id: string | number) {
    try {
        const apiPath = `${prefix}/${id}`;
        await request.delete(apiPath);
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}





export async function apiGetAttendanceResults(id: string | number) {
    try {
        const apiPath = `${prefix}/${id}/results`;
        const res = await request.get(apiPath);
        const { data } = res.data as ApiResponseWithData<{
            attendanceId: number;
            user: UserDetail;
            result: AttendanceResult | null;
        }[]>;
        return data;
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}


