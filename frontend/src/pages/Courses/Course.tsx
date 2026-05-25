import appStyles from '~styles/App.module.css';
import styles from './styles/Course.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { RiAddFill } from 'react-icons/ri';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { apiDeleteCourse, apiGetCourseById, apiUpdateCourse } from '~api/course';
import Loading from '~components/Loading';
import YesNoPopUp from '~components/YesNoPopUp';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import NotFound from '~pages/Errors/NotFound';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';

export default function Course() {
    const { id } = useParams();
    const { permissions, appTitle } = useAppContext();
    const language = useLanguage('page.course');
    const queryClient = useQueryClient();
    const [showDeletePopUp, setShowDeletePopUp] = useState(false);
    const navigate = useNavigate();
    const formUtils = createFormUtils(styles);
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.PAGE_COURSE, { id: id }],
        queryFn: () => apiGetCourseById(String(id)),
        enabled: permissions.has('course_view'),
        retry: false,
        refetchOnWindowFocus: false,
    });
    const handleUpdateCourse = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        if (!permissions.has('course_update')) return;
        document.querySelector(`.${styles.formData}`)?.querySelectorAll('input[name]').forEach(node => {
            const element = node as HTMLInputElement;
            element.classList.remove('error');
            formUtils.getParentElement(element)?.removeAttribute('data-error');
        });
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        if (queryData.data) await apiUpdateCourse(formData, queryData.data.id);
    };
    const { mutate, isPending } = useMutation({
        mutationFn: handleUpdateCourse,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: () => { queryData.refetch(); }
    });
    const handleDeletetCourse = async () => {
        await apiDeleteCourse(String(id));
    };
    const onMutateSuccess = () => {
        [QUERY_KEYS.PAGE_COURSES].forEach(key => {
            queryClient.refetchQueries({ queryKey: [key] });
        });
        navigate('/courses');
    };

    useEffect(() => {
        if (!queryData.data) return;
        appTitle.setAppTitle(queryData.data.name);
    }, [appTitle, queryData.data]);
    if (!permissions.has('course_view')) return <Navigate to='/' />;
    if (queryData.error) return (
        <main className={css(appStyles.dashboard, styles.pageContent)}>
            <NotFound />
        </main>
    );
    return (
        <>


            {showDeletePopUp === true ?
                <YesNoPopUp
                    message={language?.deleteMessage || ''}
                    mutateFunction={handleDeletetCourse}
                    setShowPopUp={setShowDeletePopUp}
                    onMutateSuccess={onMutateSuccess}
                    langYes={language?.langYes}
                    langNo={language?.langNo}
                /> : null}
            <main className={css(appStyles.dashboard, styles.pageContent)}>
                {
                    queryData.isLoading ? <Loading /> : null
                }
                {
                    isPending ? <Loading /> : null
                }
                {
                    queryData.data ?
                        <>
                            <section className={styles.formContent}>
                                <div className={styles.header}>
                                    <h2 className={styles.title}>{queryData.data.name}</h2>
                                </div>
                                <form onSubmit={(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
                                    mutate(e);
                                }}
                                    onInput={e => { formUtils.handleOnInput(e); }}
                                    className={styles.formData}>
                                    <input name='is_active' defaultValue='1' hidden />
                                    <div className={styles.groupInputs}>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='shortcode'>{language?.shortcode}</label>
                                            <input
                                                id='shortcode'
                                                disabled={!permissions.has('course_update')}
                                                defaultValue={queryData.data.shortcode}
                                                name='shortcode'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='name'>{language?.name}</label>
                                            <input
                                                id='name'
                                                disabled={!permissions.has('course_update')}
                                                defaultValue={queryData.data.name}
                                                name='name'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                    </div>
                                    {
                                        permissions.hasAnyFormList(['course_update', 'course_delete']) ?
                                            <div className={styles.actionItems}>
                                                {
                                                    permissions.has('course_update') ?
                                                        <button name='save'
                                                            className={
                                                                css(
                                                                    appStyles.actionItem,
                                                                    isPending ? appStyles.buttonSubmitting : ''
                                                                )
                                                            }
                                                        >{language?.save}</button> : null
                                                }
                                                {
                                                    permissions.has('course_delete') ?
                                                        <button
                                                            type='button'
                                                            onClick={() => {
                                                                setShowDeletePopUp(true);
                                                            }}
                                                            className={appStyles.actionItemWhiteBorderRed}>
                                                            <MdDeleteOutline /> {language?.delete}
                                                        </button>
                                                        : null
                                                }
                                            </div>
                                            : null
                                    }
                                </form>
                            </section>
                     
                        </> : null
                }
            </main>
        </>
    );
}
