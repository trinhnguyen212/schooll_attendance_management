import appStyles from '~styles/App.module.css';
import styles from './styles/Classe.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FiEdit, FiSave } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiAddFill } from 'react-icons/ri';
import { Navigate, useNavigate, useParams } from 'react-router';
import { apiDeleteClasse, apiGetClasseById, apiUpdateClasse } from '~api/classe';
import { apiAutoCompleteUser } from '~api/user';
import CustomDataList from '~components/CustomDataList';
import Loading from '~components/Loading';
import YesNoPopUp from '~components/YesNoPopUp';
import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import NotFound from '~pages/Errors/NotFound';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';
import languageUtils from '~utils/languageUtils';
import CreateAttendance from './components/CreateAttendance';
import UpdateClasseStudents from './components/UpdateClasseStudents';
import ViewAttendance from './components/ViewAttendance';



export default function Classe() {
    const { classeId } = useParams();
    const { permissions, appLanguage, appTitle, user } = useAppContext();
    const [attendanceId, setAttendanceId] = useState<number>(0);

    const [showViewAttendancePopUp, setShowViewAttendancePopUp] = useState(false);

    const [showDeletePopUp, setShowDeletePopUp] = useState(false);
    const [showUpdateStudentsPopUp, setShowUpdateStudentsPopUp] = useState(false);
    const [showCreateAttendancePopUp, setShowCreateAttendancePopUp] = useState(false);
    const language = useLanguage('page.classe');

    const [queryUser, setQueryUser] = useState('');
    const debounceQueryUser = useDebounce(queryUser, AUTO_COMPLETE_DEBOUNCE);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const formUtils = createFormUtils(styles);
    const disabledUpdate = !permissions.has('classe_update');
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.PAGE_CLASSE, { id: classeId }],
        queryFn: () => apiGetClasseById(String(classeId)),
        enabled: permissions.has('classe_view'),
        retry: false,
        refetchOnWindowFocus: false,
    });

    const userQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_COURSE, { search: debounceQueryUser }],
        queryFn: () => apiAutoCompleteUser('teacher', debounceQueryUser),
        enabled: debounceQueryUser ? true : false
    });
    const handleUpdateClasse = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll('input[name]').forEach(node => {
            const element = node as HTMLInputElement;
            element.classList.remove('error');
            formUtils.getParentElement(element)?.removeAttribute('data-error');
        });
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        if (queryData.data) await apiUpdateClasse(formData, queryData.data.id);
    };
    const { mutate, isPending } = useMutation({
        mutationFn: handleUpdateClasse,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: () => { queryData.refetch(); }
    });
    const handleDeleteClasse = async () => {
        await apiDeleteClasse(String(classeId));
    };
    const onDeleteClasseSuccess = () => {
        [QUERY_KEYS.PAGE_CLASSES, QUERY_KEYS.PAGE_DASHBOARD].forEach(key => {
            queryClient.refetchQueries({ queryKey: [key] });
        });
        navigate('/semesters');
    };
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.PAGE_CLASSE, { id: classeId }] });
        };
    }, [classeId, queryClient]);
    useEffect(() => {
        if (queryData.data) appTitle.setAppTitle(queryData.data.name);
    }, [appTitle, queryData.data]);
    if (!permissions.has('classe_view')) return <Navigate to='/' />;
    if (queryData.error) return (
        <main className={css(appStyles.dashboard, styles.pageContent)}>
            <NotFound />
        </main>
    );

    return (
        <>

            {showViewAttendancePopUp ?
                <ViewAttendance
                    id={attendanceId}
                    setShowPopUp={setShowViewAttendancePopUp}
                    onMutateSuccess={() => { queryData.refetch(); }}
                /> : null
            }
            {showUpdateStudentsPopUp && queryData.data ?
                <UpdateClasseStudents
                    classeDetail={queryData.data}
                    setShowPopUp={setShowUpdateStudentsPopUp}
                    onMutateSuccess={() => { queryData.refetch(); }}
                /> : null
            }

            {showCreateAttendancePopUp && queryData.data ?
                <CreateAttendance
                    classeDetail={queryData.data}
                    setShowPopUp={setShowCreateAttendancePopUp}
                    onMutateSuccess={() => { queryData.refetch(); }}
                /> : null
            }
            {showDeletePopUp === true ?
                <YesNoPopUp
                    message={language?.deleteMessage || ''}
                    mutateFunction={handleDeleteClasse}
                    setShowPopUp={setShowDeletePopUp}
                    onMutateSuccess={onDeleteClasseSuccess}
                    langYes={language?.langYes}
                    langNo={language?.langNo}
                /> : null}
            <main className={css(appStyles.dashboard, styles.pageContent)}>
                {
                    queryData.isLoading ? <Loading /> : null
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
                                                disabled={disabledUpdate}
                                                defaultValue={queryData.data.shortcode}
                                                name='shortcode'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='name'>{language?.name}</label>
                                            <input
                                                id='name'
                                                disabled={disabledUpdate}
                                                defaultValue={queryData.data.name}
                                                name='name'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='teacher_id'>{language?.teacher}</label>
                                            <CustomDataList
                                                name='teacher_id'
                                                onInput={e => { setQueryUser(e.currentTarget.value); }}
                                                disabled={disabledUpdate}
                                                defaultOption={
                                                    {
                                                        label: languageUtils.getFullName(queryData.data.teacher.firstName, queryData.data.teacher.lastName),
                                                        value: queryData.data ? String(queryData.data.teacherId) : ''
                                                    }
                                                }
                                                options={userQueryData.data ? userQueryData.data.map(item => {
                                                    return {
                                                        label: languageUtils.getFullName(item.firstName, item.lastName),
                                                        value: String(item.id)
                                                    };
                                                }) : []}
                                                className={styles.customSelect}
                                            />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required}>{language?.course}</label>
                                            <input
                                                disabled
                                                defaultValue={queryData.data.course.name}
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                    </div>
                                    {
                                        permissions.hasAnyFormList(['classe_update', 'classe_delete']) ?
                                            <div className={styles.actionItems}>
                                                {
                                                    permissions.has('classe_update') ?
                                                        <button
                                                            name='save'
                                                            className={
                                                                css(
                                                                    appStyles.actionItem,
                                                                    isPending ? appStyles.buttonSubmitting : ''
                                                                )
                                                            }
                                                        ><FiSave />{language?.save}</button> : null
                                                }
                                                {
                                                    permissions.has('classe_delete') ?
                                                        <button
                                                            type='button'
                                                            onClick={() => {
                                                                setShowDeletePopUp(true);
                                                            }}
                                                            className={appStyles.actionItemWhiteBorderRed}>
                                                            <MdDeleteOutline /> {language?.delete}
                                                        </button> : null
                                                }
                                            </div>
                                            : null
                                    }
                                </form>
                            </section>
                            <section>
                                <div className={styles.header}>
                                    <h2 className={styles.title}>{language?.studentList}</h2>
                                </div>
                                {
                                    permissions.has('classe_update') ?
                                        <div
                                            className={appStyles.actionBar}
                                        >
                                            <button
                                                className={css(appStyles.actionItem, styles.editStudentsButton)}
                                                onClick={() => {
                                                    setShowUpdateStudentsPopUp(true);
                                                }}
                                            >
                                                <FiEdit />
                                                <span>
                                                    {language?.edit}
                                                </span>
                                            </button>
                                        </div>
                                        : null
                                }
                                <div className={styles.enrollmentsContainer}>
                                    {
                                        queryData.data.enrollments
                                            .map(enrollment => {
                                                const fullName = languageUtils.getFullName(enrollment.user.firstName, enrollment.user.lastName);
                                                const shortCode = enrollment.user.shortcode;
                                                return (
                                                    <div
                                                        key={`enrollment-${enrollment.id}`}
                                                        className={css(appStyles.dashboardCard, styles.card)}
                                                    >
                                                        <div className={styles.cardContent}>
                                                            {[fullName, `(${shortCode})`].join(' ')}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    }
                                </div>
                            </section>



                            
                            <div className={styles.header}>
                                <h2 className={styles.title}>{language?.attendancetList}</h2>
                            </div>
                            {
                                permissions.has('attendance_create') ?
                                    <div className='action-bar-d'
                                    >
                                        <button
                                            className={appStyles.actionItem}
                                            onClick={() => {
                                                setShowCreateAttendancePopUp(true);
                                            }}
                                        >
                                            <RiAddFill /> {language?.add}
                                        </button>
                                    </div>
                                    : null
                            }
                            <div className={styles.attendancesContainer}>
                                {
                                    queryData.data.attendances
                                        .map(attendance => {
                                            return (
                                                <div

                                                    title={attendance.name}
                                                    key={`attendance-${attendance.id}`}
                                                    onClick={() => {
                                                        setAttendanceId(attendance.id);
                                                        setShowViewAttendancePopUp(true);
                                                    }}
                                                    className={css(appStyles.dashboardCard, styles.attendanceCard)}
                                                >
                                                    <div className={styles.cardSection}>
                                                        <p>
                                                            {attendance.name}
                                                        </p>
                                                    </div>
                                                    <div className={styles.cardSection}>
                                                        {new Date(attendance.attendanceDate).toLocaleString(appLanguage.language)}
                                                    </div>
                                                    <div className={styles.tableContainer}>



                                                    </div>

                                                </div>
                                            );
                                        })
                                }

                            </div>

                        </>
                        : null

                }
            </main>
        </>
    );
}
