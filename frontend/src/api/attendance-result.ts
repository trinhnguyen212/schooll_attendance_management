/* eslint-disable @typescript-eslint/no-explicit-any */
//import { QueryAttendanceResultsByUser, AttendanceResultWithAttendance } from '~models/attendance-result';

import apiUtils from '~utils/apiUtils';
import request from '../config/api';
import { ApiResponseWithData } from '../models/response';
import { AxiosResponse } from 'axios';



const prefix = 'attendance-results';


export async function apiUpdateAttendanceResult(attendance_status: string | number , id: string | number ) {
    const formData = new FormData();
    formData.append('attendance_status', attendance_status.toString());
    try {
        const apiPath = `${prefix}/${id}/attendance_status`;
        await request.put(apiPath, formData);
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}
export async function apiGetAttendanceResult(id: string | number): Promise<boolean | undefined> {
    try {
        const apiPath = `${prefix}/${id}/attendance_status`; // Update to the correct API endpoint for retrieving attendance result
        const response = await request.get(apiPath);

        // Assuming the API returns the attendance result (attendance_status) directly
        if (response?.data?.attendance_status !== undefined) {
            return response.data.attendance_status;
        } else {
            console.error('Unexpected response structure:', response);
            return undefined;
        }
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}




