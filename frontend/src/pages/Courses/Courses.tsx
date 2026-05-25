import appStyles from '~styles/App.module.css';
import styles from '~styles/CardPage.module.css';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { LuBookOpenCheck } from 'react-icons/lu';
import { RiAddFill } from 'react-icons/ri';
import { Link, Navigate, useSearchParams } from 'react-router';
import { apiGetCourses } from '~api/course';
import Loading from '~components/Loading';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import css from '~utils/css';
import CreateCourse from './components/CreateCourse';

export default function Courses() {
    const { permissions, appTitle } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const queryDebounce = useDebounce(searchQuery);
    const language = useLanguage('page.courses');
    const [showCreatePopUp, setShowCreatePopUp] = useState(false);
    const queryClient = useQueryClient();
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.PAGE_COURSES, { search: queryDebounce }],
        queryFn: () => apiGetCourses(queryDebounce),
        enabled: permissions.has('course_view')
    });
    useEffect(() => {
        if (!searchParams.get('search') && !queryDebounce) return;
        if (queryDebounce === '') searchParams.delete('search');
        else searchParams.set('search', queryDebounce);
        setSearchParams(searchParams);
    }, [queryDebounce, searchParams, setSearchParams]);
    const onMutateSuccess = () => {
        [QUERY_KEYS.PAGE_COURSES].forEach(key => {
            queryClient.refetchQueries({ queryKey: [key] });
        });
    };
    useEffect(() => {
        if (language) appTitle.setAppTitle(language.courses);
    }, [appTitle, language]);
    if (!permissions.has('course_view')) return <Navigate to='/' />;
    return (
        <>
            {showCreatePopUp === true ?
                <CreateCourse
                    onMutateSuccess={onMutateSuccess}
                    setShowPopUp={setShowCreatePopUp}
                /> : null}
            <main className={appStyles.dashboard}>
                {
                    permissions.hasAnyFormList(['course_create'])
                        ?
                        <section className={appStyles.actionBar}>
                            {
                                permissions.has('course_create') ?
                                    <button
                                        className={appStyles.actionItem}
                                        onClick={() => {
                                            setShowCreatePopUp(true);
                                        }}
                                    >
                                        <RiAddFill /> {language?.add}
                                    </button>
                                    : null
                            }
                        </section>
                        : null
                }
                <section className={styles.pageContent}>
                    {
                        queryData.isLoading ? <Loading /> : null
                    }
                    <div className={styles.filterForm}>
                        <div className={styles.wrapInputItem}>
                            <label>{language?.filter.search}</label>
                            <input
                                onInput={(e) => {
                                    setSearchQuery(e.currentTarget.value);
                                }}
                                defaultValue={queryDebounce}
                                className={css(appStyles.input, styles.inputItem)}
                            />
                        </div>
                    </div>
                    <div className={styles.wrapCardContainer}>
                        <div className={styles.cardContainer}>
                            {queryData.data ?
                                queryData.data.map(item => {
                                    return (
                                        <Link
    key={`course-${item.id}`}
    to={permissions.has('course_create') ? String(item.id) : '#'}
    className={css(appStyles.dashboardCard, styles.card)}
    onClick={(e) => {
        if (!permissions.has('course_create')) e.preventDefault(); 
    }}
>
    <div className={styles.cardTop}>
        <p className={styles.content}>
            {item.name}
        </p>
    </div>
    <div className={styles.cardBottom}>
        <LuBookOpenCheck />
        {item.shortcode}
    </div>
</Link>

                                    );
                                }) : null}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
