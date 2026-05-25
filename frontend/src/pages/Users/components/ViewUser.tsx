import appStyles from '~styles/App.module.css';
import styles from '~styles/ViewModel.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FiChevronDown, FiSave, FiX } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
//import { Link } from 'react-router';
import { apiAutoCompleteBranch } from '~api/branch';
import { apiAutoCompleteStudentStudying } from '~api/student-studying';
import { apiAutoCompleteStudentCurrentLevel } from '~api/student-current-level';
import { apiAutoCompleteSchoolOfThought } from '~api/school-of-thought';
import { apiAutoCompleteLearningObjective } from '~api/learning-objective';
import { apiGetUserById, apiUpdateUser, apiGetAllUser, } from '~api/user';
import CustomDataList from '~components/CustomDataList';
import CustomSelect from '~components/CustomSelect';
import Loading from '~components/Loading';
import { User } from '~models/user';
import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';
import dateFormat from '~utils/date-format';
import languageUtils from '~utils/languageUtils';

type ViewUserProps = {
    id: number;
    onMutateSuccess: () => void;
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function ViewUser({
    id,
    onMutateSuccess,
    setShowPopUp
}: ViewUserProps) {
    const language = useLanguage('component.view_user');
    const { permissions } = useAppContext();
    const [childs, setChilds] = useState<User[]>([]);
    const [queryUser, setQueryUser] = useState('');
    const [queryStudying, setQueryStudying] = useState('');
    const [queryLevel, setQueryLevel] = useState('');
    const [queryThought, setQueryThought] = useState('');
    const [queryObjective, setQueryObjective] = useState('');
    const [queryBranch, setQueryBranch] = useState('');
    const debounceQueryUser = useDebounce(queryUser, AUTO_COMPLETE_DEBOUNCE);
    const [disabledUpdate, setDisabledUpdate] = useState(!permissions.has('user_update'));
    const debouceQueryStudying = useDebounce(queryStudying, AUTO_COMPLETE_DEBOUNCE);
    const debouceQueryLevel = useDebounce(queryLevel, AUTO_COMPLETE_DEBOUNCE);
    const debouceQueryThought = useDebounce(queryThought, AUTO_COMPLETE_DEBOUNCE);
    const debouceQueryObjective = useDebounce(queryObjective, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryBranch = useDebounce(queryBranch, AUTO_COMPLETE_DEBOUNCE);
    const queryClient = useQueryClient();
    const handleClosePopUp = () => {
        setShowPopUp(false);
    }; const formUtils = createFormUtils(styles);
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.USER_DETAIL, { id: id }],
        queryFn: () => apiGetUserById(id)
    });
    //
    const userQueryData = useQuery({
        queryKey: [QUERY_KEYS.ALL_STUDENT, { search: debounceQueryUser }],
        queryFn: () => apiGetAllUser('student', debounceQueryUser),
        enabled: permissions.has('user_view') ? true : false
    });


    //
    //

    //
    const studyingQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_STUDYING, { search: debouceQueryStudying }],
        queryFn: () => apiAutoCompleteStudentStudying(debouceQueryStudying),
        enabled: !!debouceQueryStudying
    });
    //
    //
    const levelQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_CURRENT_LEVEL, { search: debouceQueryLevel }],
        queryFn: () => apiAutoCompleteStudentCurrentLevel(debouceQueryLevel),
        enabled: !!debouceQueryLevel
    });
    //
    //
    const thoughtQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_SCHOOL_OF_THOUGHT, { search: debouceQueryThought }],
        queryFn: () => apiAutoCompleteSchoolOfThought(debouceQueryThought),
        enabled: debouceQueryThought && permissions.has('school_of_thought_view') ? true : false
    });
    //
    //
    const objectiveQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_LEARNING_OBJECTIVE, { search: debouceQueryObjective }],
        queryFn: () => apiAutoCompleteLearningObjective(debouceQueryObjective),
        enabled: !!debouceQueryObjective
    });
    //
    const branchQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_BRANCH, { search: debounceQueryBranch }],
        queryFn: () => apiAutoCompleteBranch(debounceQueryBranch),
        enabled: debounceQueryBranch && permissions.has('branch_view') ? true : false
    });
    useEffect(() => {
        if (queryData.data && queryData.data.childs) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setChilds(queryData.data.childs.map(({ pivot, ...user }) => user));
        }
    }, [queryData.data]);
    const handleUpdateUser = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll<HTMLInputElement>('input[name]').forEach(node => {
            node.classList.remove('error');
            formUtils.getParentElement(node)?.removeAttribute('data-error');
        });
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        childs.forEach(child => {
            formData.append('child_ids[]', String(child.id));
        });
        await apiUpdateUser(formData, id);
    };
    const { mutate, isPending } = useMutation({
        mutationFn: handleUpdateUser,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: onMutateSuccess
    });

    const genderOptions = [
        { value: 'male', label: language?.genders.male },
        { value: 'female', label: language?.genders.female },
    ];
    const statusOptions = [
        { value: '1', label: language?.status.active },
        { value: '0', label: language?.status.inactive },
    ];

    const roleTitles = {
        teacher: 'Teacher Details',
        admin: 'Admin Details',
        parent: 'Parent Details',
        student: 'Student Details'
    };


    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.USER_DETAIL, { id: id }] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_BRANCH] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_STUDYING] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_CURRENT_LEVEL] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_SCHOOL_OF_THOUGHT] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_LEARNING_OBJECTIVE] });

            queryClient.removeQueries({ queryKey: [QUERY_KEYS.ALL_STUDENT] });
        };
    }, [queryClient, id]);
    useEffect(() => {
        if (!queryData.data) return;
        if (queryData.data.role.name === 'admin') {
            setDisabledUpdate(true);
        }
    }, [queryData.data]);
    return (
        <div
            className={
                css(
                    styles.viewModelContainer,
                )
            }>
            {
                isPending ? <Loading /> : null
            }
            <div
                className={
                    css(
                        styles.viewModelForm,
                    )
                }>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {roleTitles[queryData.data?.role?.name as keyof typeof roleTitles] || ''}
                    </h2>

                </div>
                <>
                    {
                        queryData.isLoading ? <Loading /> : null
                    }
                    <div className={styles.formContent}>
                        {
                            queryData.data ? (
                                <form onSubmit={(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
                                    mutate(e);
                                }}
                                    onInput={(e) => { formUtils.handleOnInput(e); }}
                                    className={styles.formData}>
                                    <div>
                                        <div className={styles.groupInputs}>
                                            <div className={styles.wrapItem}>
                                                <label className={appStyles.required} htmlFor='first_name'>{language?.firstName}</label>
                                                <input
                                                    id='first_name'
                                                    disabled={disabledUpdate}
                                                    defaultValue={queryData.data.firstName}
                                                    name='first_name'
                                                    className={css(appStyles.input, styles.inputItem)}
                                                    type='text' />
                                            </div>
                                            <div className={styles.wrapItem}>
                                                <label className={appStyles.required} htmlFor='last_name'>{language?.lastName}</label>
                                                <input
                                                    id='last_name'
                                                    disabled={disabledUpdate}
                                                    defaultValue={queryData.data.lastName}
                                                    name='last_name'
                                                    className={css(appStyles.input, styles.inputItem)}
                                                    type='text' />
                                            </div>
                                            <div className={styles.wrapItem}>
                                                <label className={appStyles.required} htmlFor='email'>{language?.email}</label>
                                                <input
                                                    id='email'
                                                    disabled={disabledUpdate}
                                                    defaultValue={queryData.data.email}
                                                    name='email'
                                                    className={css(appStyles.input, styles.inputItem)}
                                                    type='text' />
                                            </div>
                                            <div className={styles.wrapItem}>
                                                <label htmlFor='phone_number'>{language?.phoneNumber}</label>
                                                <input
                                                    id='phone_number'
                                                    disabled={disabledUpdate}
                                                    defaultValue={queryData.data.phoneNumber || ''}
                                                    name='phone_number'
                                                    className={css(appStyles.input, styles.inputItem)}
                                                    type='text' />
                                            </div>
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
                                            {queryData.data.role.name === 'student' ?
                                                <>

                                                    <div style={{ zIndex: 3 }} className={styles.wrapItem}>
                                                        <label className={appStyles.required} htmlFor='learning_objective_id'>Learning Objective</label>
                                                        <CustomDataList
                                                            name='learning_objective_id'
                                                            defaultOption={{
                                                                label: queryData.data.learningObjective?.name,
                                                                value: queryData.data.learningObjective ? String(queryData.data.learningObjective.id) : ''
                                                            }}
                                                            onInput={e => { setQueryObjective(e.currentTarget.value); }}
                                                            options={objectiveQueryData.data ? objectiveQueryData.data.map(item => {
                                                                return {
                                                                    label: item.name,
                                                                    value: String(item.id)
                                                                };
                                                            }) : []}
                                                            disabled={disabledUpdate} />
                                                    </div>
                                                    <div style={{ zIndex: 3 }} className={styles.wrapItem}>
                                                        <label className={appStyles.required} htmlFor='student_studying_id'>Student Studying</label>
                                                        <CustomDataList
                                                            name='student_studying_id'
                                                            defaultOption={{
                                                                label: queryData.data.studentStudying?.name,
                                                                value: queryData.data.studentStudying ? String(queryData.data.studentStudying.id) : ''
                                                            }}
                                                            onInput={e => { setQueryStudying(e.currentTarget.value); }}
                                                            options={studyingQueryData.data ? studyingQueryData.data.map(item => {
                                                                return {
                                                                    label: item.name,
                                                                    value: String(item.id)
                                                                };
                                                            }) : []}
                                                            disabled={disabledUpdate} />
                                                    </div>
                                                    <div style={{ zIndex: 3 }} className={styles.wrapItem}>
                                                        <label className={appStyles.required} htmlFor='student_current_level_id'>Student Current Level</label>
                                                        <CustomDataList
                                                            name='student_current_level_id'
                                                            defaultOption={{
                                                                label: queryData.data.studentCurrentLevel?.name,
                                                                value: queryData.data.studentCurrentLevel ? String(queryData.data.studentCurrentLevel.id) : ''
                                                            }}
                                                            onInput={e => { setQueryLevel(e.currentTarget.value); }}
                                                            options={levelQueryData.data ? levelQueryData.data.map(item => {
                                                                return {
                                                                    label: item.name,
                                                                    value: String(item.id)
                                                                };
                                                            }) : []}
                                                            disabled={disabledUpdate} />
                                                    </div>
                                                    <div style={{ zIndex: 3 }} className={styles.wrapItem}>
                                                        <label className={appStyles.required} htmlFor='school_of_thought_id'>{language?.thought}</label>
                                                        <CustomDataList
                                                            name='school_of_thought_id'
                                                            defaultOption={{
                                                                label: queryData.data.schoolOfThought?.name,
                                                                value: queryData.data.schoolOfThought ? String(queryData.data.schoolOfThought.id) : ''
                                                            }}
                                                            onInput={e => { setQueryThought(e.currentTarget.value); }}
                                                            options={thoughtQueryData.data ? thoughtQueryData.data.map(item => {
                                                                return {
                                                                    label: item.name,
                                                                    value: String(item.id)
                                                                };
                                                            }) : []}
                                                            disabled={disabledUpdate} />
                                                    </div>

                                                    <div className={styles.wrapItem}>
                                                        <label htmlFor='disabilities_allergies_conditions'>Disabilities/Allergies Conditions</label>
                                                        <input
                                                            id='disabilities_allergies_conditions'
                                                            disabled={disabledUpdate}
                                                            defaultValue={queryData.data.disabilitiesAllergiesConditions || ''}
                                                            name='disabilities_allergies_conditions'
                                                            className={css(appStyles.input, styles.inputItem)}
                                                            type='text' />
                                                    </div>

                                                </>
                                                : queryData.data.role.name === 'teacher' ?
                                                    <div style={{ zIndex: 3 }} className={styles.wrapItem}>
                                                        <label className={appStyles.required} htmlFor='branch_id'>{language?.branch}</label>
                                                        <CustomDataList
                                                            name='branch_id'
                                                            defaultOption={
                                                                {
                                                                    label: queryData.data.branch?.name,
                                                                    value: queryData.data.branch ? String(queryData.data.branch.id) : ''
                                                                }
                                                            }
                                                            onInput={e => { setQueryBranch(e.currentTarget.value); }}
                                                            options={branchQueryData.data ? branchQueryData.data.map(item => {
                                                                return {
                                                                    label: item.name,
                                                                    value: String(item.id)
                                                                };
                                                            }) : []}
                                                            disabled={disabledUpdate}
                                                        />
                                                    </div>
                                                    : null
                                            }
                                            <div
                                                className={styles.wrapItem}
                                                style={{ zIndex: 2 }}
                                            >
                                                <label className={appStyles.required} htmlFor=''>
                                                    {language?.genders.gender}
                                                </label>
                                                <div className={styles.selectWithIcon}>
                                                    <CustomSelect
                                                        name="gender"
                                                        defaultOption={
                                                            queryData.data.gender === 'male'
                                                                ? genderOptions[0]
                                                                : genderOptions[1]
                                                        }
                                                        disabled={disabledUpdate}
                                                        options={genderOptions}
                                                        className={styles.customSelect}
                                                    />
                                                    <FiChevronDown className={styles.dropdownIcon} />
                                                </div>
                                            </div>
                                            <div className={styles.wrapItem}>
                                                <label className={appStyles.required} htmlFor='address'>{language?.address}</label>
                                                <input
                                                    id='address'
                                                    disabled={disabledUpdate}
                                                    defaultValue={queryData.data.address}
                                                    name='address'
                                                    className={css(appStyles.input, styles.inputItem)}
                                                    type='text' />
                                            </div>
                                            <div className={styles.wrapItem}>
                                                <label className={appStyles.required} htmlFor='birth_date'>{language?.birthDate}</label>
                                                <input
                                                    defaultValue={dateFormat.toDateString(new Date(queryData.data.birthDate))}
                                                    max={dateFormat.toDateString(new Date())}
                                                    type='date'
                                                    id='birth_date'
                                                    name='birth_date'
                                                    className={css(appStyles.input, styles.inputItem)}
                                                    disabled={disabledUpdate}
                                                />
                                            </div>
                                            <div className={styles.wrapItem}>
                                                <label className={appStyles.required} htmlFor=''>
                                                    {language?.status.accountStatus}
                                                </label>
                                                <div className={styles.selectWithIcon}>
                                                    <CustomSelect
                                                        name="is_active"
                                                        defaultOption={
                                                            queryData.data.isActive
                                                                ? statusOptions[0]
                                                                : statusOptions[1]
                                                        }
                                                        disabled={disabledUpdate}
                                                        options={statusOptions}
                                                        className={styles.customSelect}
                                                    />
                                                    <FiChevronDown className={styles.dropdownIcon} />
                                                </div>
                                            </div>

                                            <div className={styles.wrapItem}>
                                                <label htmlFor='password'>{language?.password}</label>
                                                <input
                                                    id='password'
                                                    disabled={disabledUpdate}
                                                    placeholder={language?.leaveBlank}
                                                    name='password'
                                                    className={css(appStyles.input, styles.inputItem)}
                                                    type='password' />
                                            </div>

                                            {queryData.data.role.name === 'parent' && (
                                                <div className={styles.wrapItem} style={{ zIndex: 3 }}>
                                                    <div className={css(styles.wrapItem, styles.dataContainer)}>
                                                        <div className={styles.wrapItem}>
                                                            <label className={appStyles.required} htmlFor="shortcode">
                                                                {language?.search}
                                                            </label>
                                                            <input
                                                                id="shortcode"
                                                                placeholder={language?.searchAdd}
                                                                value={queryUser} // Controlled input
                                                                onChange={(e) => setQueryUser(e.target.value)}
                                                                className={css(appStyles.input, styles.inputItem)}
                                                                type="text"
                                                            />
                                                            {permissions.has('user_view') && queryUser && (
                                                                <ul className={styles.allParentContainer}>
                                                                    {userQueryData?.data
                                                                        ?.filter(
                                                                            (user) =>
                                                                                !childs.find((child) => child.id === user.id) &&
                                                                                languageUtils
                                                                                    .getFullName(user.firstName, user.lastName)
                                                                                    .toLowerCase()
                                                                                    .includes(queryUser.toLowerCase())
                                                                        )
                                                                        .map((user) => (
                                                                            <li
                                                                                key={`user-${user.id}`}
                                                                                className={styles.userItem}
                                                                                onClick={() => setChilds((prevChilds) => [...prevChilds, user])}
                                                                            >
                                                                                <div className={styles.cardLeft}>
                                                                                    <span className={styles.userName}>
                                                                                        {languageUtils.getFullName(user.firstName, user.lastName)}
                                                                                    </span>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {queryData.data.role.name === 'parent' ?
                                                <div className={styles.wrapItem}>
                                                    <label>{language?.childs}</label>
                                                    <ul className={styles.joinedParentsContainer}>
                                                        {
                                                            childs.map((child, index) => {
                                                                return (
                                                                    <li
                                                                        className={styles.joinedParent}
                                                                        key={`joined-child-${child.id}`}
                                                                    >
                                                                        <div>
                                                                            <span>
                                                                                {languageUtils.getFullName(child.firstName, child.lastName)}

                                                                            </span>

                                                                            <span
                                                                                style={{ height: '20px' }}
                                                                                onClick={() => {
                                                                                    if (!permissions.has('user_update')) return;
                                                                                    const newChilds = structuredClone(childs);
                                                                                    newChilds.splice(index, 1);
                                                                                    setChilds(newChilds);
                                                                                }}
                                                                            >
                                                                                <RxCross2 />
                                                                            </span>
                                                                        </div>
                                                                    </li>
                                                                );
                                                            })
                                                        }
                                                    </ul>

                                                </div>
                                                : null
                                            }
                                        </div>

                                    </div>
                                  
                                            <div className={styles.actionItems}>
                                            {
                                        permissions.has('user_update') && !disabledUpdate ?
                                                <button name='save'
                                                    className={
                                                        css(
                                                            appStyles.actionItem,
                                                            isPending ? appStyles.buttonSubmitting : ''
                                                        )
                                                    }
                                                ><FiSave />{language?.save}</button>
                                                : null
                                            }

                                                <button
                                                    name="exist"
                                                    className={css(
                                                        appStyles.actionItem,
                                                        isPending ? appStyles.buttonSubmitting : ''
                                                    )}
                                                    onClick={handleClosePopUp}
                                                >
                                                    <FiX /> Exit
                                                </button>
                                            </div>
                              

                                </form>
                            ) : null
                        }
                    </div>
                </>
            </div>
        </div>
    );
}
