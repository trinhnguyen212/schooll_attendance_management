const keys = [
    'USER_EXPORTABLE_FIELDS',
    'PAGE_DASHBOARD',
    'PAGE_PROFILE',
    'PAGE_USERS',
    'PAGE_BRANCHES',
    'PAGE_PERMISSIONS',
    'PAGE_ROLE_PERMISSIONS',
    'PAGE_SCHOOL_OF_THOUGHTS',
    'USER_DETAIL',
    'SCHOOL_OF_THOUGHT_DETAIL',
    'BRANCH_DETAIL',
    'AUTO_COMPLETE_USER',
    'AUTO_COMPLETE_BRANCH',
    'AUTO_COMPLETE_SCHOOL_OF_THOUGHT',
    'AUTO_COMPLETE_STUDENT_CURRENT_LEVEL',
    'AUTO_COMPLETE_STUDENT_STUDYING',
    'AUTO_COMPLETE_LEARNING_OBJECTIVE',
    'PAGE_COURSES',
    'PAGE_COURSE',
    'PAGE_SEMESTERS',
    'PAGE_SEMESTER',
    'PAGE_CLASSES',
    'PAGE_CLASSE',
    'AUTO_COMPLETE_SEMESTER',
    'AUTO_COMPLETE_COURSE',
    'AUTO_COMPLETE_CLASSE',
    'ALL_STUDENT',
    'ALL_TEACHER',
    'ALL_PARENT',
    ///
    'PAGE_ATTENDANCES',
    'ATTENDANCE',
    // /
    'LOGIN_SESSIONS',
    'CALLABLE_COMMANDS',

    //
    'ATTENDANCE_RESULTS_BY_USER',
    //

    //
    'ATTENDANCE_RESULTS',
    'ATTENDANCE_RESULT',
    // //
] as const;

type QueryKey = (typeof keys)[number];

const QUERY_KEYS: Record<QueryKey, QueryKey> = Object.freeze(
    keys.reduce((acc, key) => {
        acc[key] = key;
        return acc;
    }, {} as Record<QueryKey, QueryKey>)
);

export default QUERY_KEYS;
