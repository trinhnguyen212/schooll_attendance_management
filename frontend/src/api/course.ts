/* eslint-disable @typescript-eslint/no-explicit-any */
import apiUtils from '~utils/apiUtils';
import request from '../config/api';
import { ApiResponseWithData } from '../models/response';
import { Course, CourseDetail } from '../models/course';
import encodeFormData from '../utils/encodeFormData';

const prefix = 'courses';

export async function apiGetCourses(query: string) {
    try {
        const apiPath = prefix;
        const res = await request.get(apiPath, {
            params: {
                search: query
            }
        });
        const { data } = res.data as ApiResponseWithData<Course[]>;
        return data;
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiGetCourseById(id: string | number) {
    try {
        const apiPath = `${prefix}/${id}`;
        const res = await request.get(apiPath);
        const { data } = res.data as ApiResponseWithData<CourseDetail>;
        return data;
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiCreateCourse(formData: FormData) {
    try {
        const apiPath = prefix;
        await request.post(apiPath, formData);
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiUpdateCourse(formData: FormData, id: string | number) {
    try {
        const apiPath = `${prefix}/${id}`;
        const data = encodeFormData(formData);
        await request.put(apiPath, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiDeleteCourse(id: string | number) {
    try {
        const apiPath = `${prefix}/${id}`;
        await request.delete(apiPath);
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}

export async function apiAutoCompleteCourse(search: string) {
    try {
        const apiPath = `${prefix}/complete`;
        const res = await request.get(apiPath, {
            params: {
                search: search
            }
        });
        const { data } = res.data as ApiResponseWithData<Course[]>;
        return data;
    } catch (error: any) {
        return apiUtils.handleError(error);
    }
}
