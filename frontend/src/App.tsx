import './styles/App.module.css';

import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import SuspenseLoading from '~components/SuspenseLoading';
import themeUtils from '~utils/themeUtils';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Login from './pages/Auth/Login';
import VerifyEmail from './pages/Auth/VerifyEmail';
import NotFound from './pages/Errors/NotFound';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Users = lazy(() => import('./pages/Users/Users'));
const Permissisons = lazy(() => import('./pages/Permissisons/Permissisons'));
//const RolePermissions = lazy(() => import('./pages/Permissisons/RolePermissions'));
const Branches = lazy(() => import('./pages/Branches/Branches'));
const SchoolOfThoughts = lazy(() => import('./pages/SchoolOfThoughts/SchoolOfThoughts'));
const Courses = lazy(() => import('./pages/Courses/Courses'));
const Course = lazy(() => import('./pages/Courses/Course'));
const Semesters = lazy(() => import('./pages/Semesters/Semesters'));
const Classes = lazy(() => import('./pages/Classes/Classes'));
const Classe = lazy(() => import('./pages/Classes/Classe'));
const Semester = lazy(() => import('./pages/Semesters/Semester'));



const Profile = lazy(() => import('./pages/Profile/Profile'));


const router = createBrowserRouter([
    {
        errorElement: <NotFound />,
        children: [
            {
                path: 'auth',
                element: <AuthLayout />,
                children: [
                    {
                        path: 'login',
                        element: <Login />
                    },
                    {
                        path: 'verify-email',
                        element: <VerifyEmail />
                    },
                    {
                        path: 'forgot-password',
                        element: <ForgotPassword />
                    },
                ]
            },
            {
                path: '/',
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <Suspense key='dashboard' fallback={<SuspenseLoading />}><Dashboard /></Suspense>
                    },
                    {
                        path: 'courses',
                        children: [
                            {
                                index: true,
                                element: <Suspense key='courses' fallback={<SuspenseLoading />}><Courses /></Suspense>
                            },
                            {
                                path: ':id',
                                children: [
                                    {
                                        index: true,
                                        element: <Suspense key='course' fallback={<SuspenseLoading />}><Course /></Suspense>
                                    },

                                ],
                            }
                        ]
                    },
                    {
                        path: 'profile',
                        element: <Suspense key='profile' fallback={<SuspenseLoading />}><Profile /></Suspense>
                    },
                    {
                        path: 'branches',
                        element: <Suspense key='branches' fallback={<SuspenseLoading />}><Branches /></Suspense>
                    },

                    {
                        path: 'school-of-thoughts',
                        element: <Suspense key='school-of-thoughts' fallback={<SuspenseLoading />}><SchoolOfThoughts /></Suspense>
                    },
                    {
                        path: 'classes',
                        element: <Suspense key='classes' fallback={<SuspenseLoading />}><Classes /></Suspense>,
                        children: [
                          {
                            path: ':classeId',
                            element: <Suspense key='classe' fallback={<SuspenseLoading />}><Classe /></Suspense>
                          }
                        ]
                      },
                      
                    {
                        path: 'semesters',
                        children: [
                            {
                                index: true,
                                element: <Suspense key='semesters' fallback={<SuspenseLoading />}><Semesters /></Suspense>
                            },
                            {
                                path: ':id',
                                children: [
                                    {
                                        index: true,
                                        element: <Suspense key='semester' fallback={<SuspenseLoading />}><Semester /></Suspense>
                                    },
                                    {
                                        path: 'classes',
                                        children: [
                                            {
                                                index: true,
                                                element: <Suspense key='classes' fallback={<SuspenseLoading />}><Classes /></Suspense>
                                            },
                                            {
                                                path: ':classeId',
                                                element: <Suspense key='classe' fallback={<SuspenseLoading />}><Classe /></Suspense>
                                            }
                                        ],
                                    }
                                ]
                            }
                        ]
                    },

                    {
                        path: 'teachers',
                        element: <Suspense key='teachers' fallback={<SuspenseLoading />}><Users role='teacher' /></Suspense>
                    },
                    {
                        path: 'students',
                        element: <Suspense key='students' fallback={<SuspenseLoading />}><Users role='student' /></Suspense>
                    },
                    {
                        path: 'parents',
                        element: <Suspense key='users' fallback={<SuspenseLoading />}><Users role='parent' /></Suspense>
                    },
                    {
                        path: 'admins',
                        element: <Suspense key='admins' fallback={<SuspenseLoading />}><Users role='admin' /></Suspense>
                    },
                    {
                        path: 'permissions',
                        children: [
                            {
                                index: true,
                                element: <Suspense key='permissions' fallback={<SuspenseLoading />}><Permissisons /></Suspense>
                            },
                            // {
                            //     path: ':id',
                            //     element: <Suspense key='role-permissions' fallback={<SuspenseLoading />}><RolePermissions /></Suspense>
                            // },
                        ],
                    },
               
                    
                ]
            }
        ]
    }
]);

const queryClient = new QueryClient();

export default function App() {
    useEffect(() => {
        const primaryColor = themeUtils.getPrimaryColor();
        if (primaryColor) {
            themeUtils.setPrimaryColor(primaryColor);
        }
    }, []);
    return (
        <>
            <Toaster
                richColors
                closeButton
                visibleToasts={5}
                position='bottom-left'
                toastOptions={{
                    duration: 3000
                }}
            />
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </>
    );
}
