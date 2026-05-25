<?php

namespace App\Enums;

use App\Traits\EnumResolver;

enum PermissionType: string
{
    use EnumResolver;

    case CLASSE_CREATE = 'classe_create';
    case CLASSE_DELETE = 'classe_delete';
    case CLASSE_UPDATE = 'classe_update';
    case CLASSE_VIEW = 'classe_view';


    /*  */
    case ATTENDANCE_CREATE = 'attendance_create';
    case ATTENDANCE_DELETE = 'attendance_delete';
   //
   // case ATTENDANCE_RESULT_ATTENDANCESTATUS = 'attendance_result_attendancestatus';
   //
   // case ATTENDANCE_RESULT_VIEW = 'attendance_result_view';
    case ATTENDANCE_UPDATE = 'attendance_update';
    case ATTENDANCE_VIEW = 'attendance_view';

    /*  */

    //
    //
    case BRANCH_CREATE = 'branch_create';
    case BRANCH_DELETE = 'branch_delete';
    case BRANCH_UPDATE = 'branch_update';
    case BRANCH_VIEW = 'branch_view';
    //

    case ROLE_PERMISSION_GRANT = 'role_permission_grant';
    case ROLE_PERMISSION_VIEW = 'role_permission_view';
    //

    //
    case SCHOOL_OF_THOUGHT_CREATE = 'school_of_thought_create';
    case SCHOOL_OF_THOUGHT_DELETE = 'school_of_thought_delete';
    case SCHOOL_OF_THOUGHT_UPDATE = 'school_of_thought_update';
    case SCHOOL_OF_THOUGHT_VIEW = 'school_of_thought_view';
    //
    
    //
    case SEMESTER_CREATE = 'semester_create';
    case SEMESTER_DELETE = 'semester_delete';
    case SEMESTER_UPDATE = 'semester_update';
    case SEMESTER_VIEW = 'semester_view';
    case COURSE_CREATE = 'course_create';
    case COURSE_DELETE = 'course_delete';
    case COURSE_UPDATE = 'course_update';
    case COURSE_VIEW = 'course_view';
    case USER_CREATE = 'user_create';
    case USER_DELETE = 'user_delete';
    case USER_UPDATE = 'user_update';
    case USER_VIEW = 'user_view';
}
