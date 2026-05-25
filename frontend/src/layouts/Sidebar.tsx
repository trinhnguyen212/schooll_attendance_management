import styles from './styles/Sidebar.module.css';

import { useEffect } from 'react';
import {
    AiOutlineUser
} from 'react-icons/ai';
import { IoSettingsOutline } from 'react-icons/io5';
import { LuSchool } from 'react-icons/lu';
import { MdOutlineStickyNote2 } from 'react-icons/md';
import {
    PiBooks,
    PiChalkboardTeacherLight,
    PiClock,
    PiStudent,
} from 'react-icons/pi';
import { RiAdminLine } from 'react-icons/ri';
import {
    RxDashboard
} from 'react-icons/rx';
import {
    SiGoogleclassroom
} from 'react-icons/si';
import { TbBrandAuth0 } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { API_HOST } from '~config/env';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import css from '~utils/css';
import getMetaContent from '~utils/getMetaContent';

const STRICT_WIDTH = 800;

export default function Sidebar() {
    const { DOM, permissions, user } = useAppContext();
    const language = useLanguage('component.sidebar');
     // Check if the user has children (based on 'childs' array)
     //const hasChildren = user?.childs && user?.childs.length > 0;
     const hasChildren = user?.user?.childs && user?.user?.childs.length > 0;
     
    let sidebarItems = [
        {
            name: language?.dashboard,
            to: '',
            icon: <RxDashboard />,
         //   isActive: permissions.has('dashboard_view')

           isActive: (user?.user?.role.name === 'admin' || user?.user?.role.name === 'teacher')
        },
        {
            name: language?.profile,
            to: 'profile',
            icon: <AiOutlineUser />,
            isActive: true
        },
        {
            name: language?.admins,
            to: 'admins',
            icon: <RiAdminLine />,
            isActive: permissions.has('user_view')
        },
        {
            name: language?.teachers,
            to: 'teachers',
            icon: <PiChalkboardTeacherLight />,
            isActive: permissions.has('user_view')
        },
        {
            name: language?.students,
            to: 'students',
            icon: <PiStudent />,
            isActive: permissions.has('user_view')
        },
        {
            name: language?.parents,
            to: 'parents',
            icon: <PiStudent />,
            isActive: permissions.has('user_view')
        },
        {
            name: language?.courses,
            to: 'courses',
            icon: <PiBooks />,
            isActive: permissions.has('course_view')
        },
        {
            name: language?.branch,
            to: 'branches',
            icon: <LuSchool />,
            isActive: permissions.has('branch_view')
        },
        {
            name: language?.schoolClass,
            to: 'school-classes',
            icon: <SiGoogleclassroom />,
            isActive: permissions.has('school_class_view')
        },
        
        {
            name: language?.schoolOfThought,
            to: 'school-of-thoughts',
            icon: <SiGoogleclassroom />,
            isActive: permissions.has('school_of_thought_view')
        },
        {
            name: language?.semester,
            to: 'semesters',
            icon: <MdOutlineStickyNote2 />,
            isActive: permissions.has('semester_view')
        },



        {
            name: language?.permission,
            to: 'permissions',
            icon: <TbBrandAuth0 />,
            isActive: permissions.has('role_permission_view')
        },
        
        
        // {
        //     name: language?.settings,
        //     to: 'settings',
        //     icon: <IoSettingsOutline />,
        //     isActive: true
        // },
    ];
   
    useEffect(() => {
        function updateSize() {
            if (window.innerWidth < STRICT_WIDTH) DOM.sideBarRef.current?.classList.add(styles.hide);
            else DOM.sideBarRef.current?.classList.remove(styles.hide);
        }
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [DOM.sideBarRef]);
    return (
        <nav ref={DOM.sideBarRef} className={
            css(
                styles.sidebar,
                window.innerWidth < STRICT_WIDTH ? styles.hide : ''
            )
        }>
            <ul className={styles.list}>
                {
                    sidebarItems.map((feature, index) => {
                        if (feature.isActive === false) return;
                        return (
                            <li
                                onClick={e => {
                                    e.currentTarget.querySelector('a')?.click();
                                    if (window.innerWidth < STRICT_WIDTH) DOM.sideBarRef.current?.classList.add(styles.hide);
                                }}
                                key={index}
                                className={css(
                                    styles.listItem,
                                    feature.to === window.location.pathname.split('/')[1] ? styles.current : ''
                                )}
                            >
                                <Link to={feature.to}>
                                    <div className={styles.icon}>
                                        {feature.icon}
                                    </div>
                                    <div className={styles.text}>
                                        {feature.name}
                                    </div>
                                </Link>
                            </li>
                        );
                    })
                }
            </ul>


        </nav>
    );
}