import { API_HOST } from '../config/env';

export const importTemplateFileUrl = {
    student: API_HOST + '/data/Import_Student_Template.xlsx',
    parent: API_HOST + '/data/Import_Parent_Template.xlsx',
    teacher: API_HOST + '/data/Import_Teacher_Template.xlsx',
    admin: API_HOST + '/data/Import_Admin_Template.xlsx',
};
