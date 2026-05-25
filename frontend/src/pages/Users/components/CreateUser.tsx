import appStyles from '~styles/App.module.css';
import styles from '~styles/CreateModel.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import {
    RxCross2
} from 'react-icons/rx';
import { apiAutoCompleteBranch } from '~api/branch';
import { apiAutoCompleteSchoolOfThought } from '~api/school-of-thought';
import { apiAutoCompleteStudentStudying } from '~api/student-studying';
import { apiAutoCompleteStudentCurrentLevel } from '~api/student-current-level';
import { apiAutoCompleteLearningObjective } from '~api/learning-objective';
import { apiCreateUser, apiGetAllUser } from '~api/user';
import CustomDataList from '~components/CustomDataList';
import CustomSelect from '~components/CustomSelect';
import Loading from '~components/Loading';
import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import { RoleName } from '~models/role';
import { User } from '~models/user';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';
import dateFormat from '~utils/date-format';
import languageUtils from '~utils/languageUtils';

type CreateUserProps = {
    role: RoleName;
    onMutateSuccess: () => void;
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function CreateUser({
    role,
    onMutateSuccess,
    setShowPopUp
}: CreateUserProps) {
    const language = useLanguage('component.create_user');
    const [childs, setChilds] = useState<User[]>([]);
    const [shortcode, setShortcode] = useState('');
    const [firstName, setFirstName] = useState(''); // State to track first_name
    const [queryThought, setQueryThought] = useState('');
    const [queryStudying, setQueryStudying] = useState('');
    const [queryLevel, setQueryLevel] = useState('');
    const [queryObjective, setQueryObjective] = useState('');
    const [queryBranch, setQueryBranch] = useState('');
    const [queryUser, setQueryUser] = useState('');
    const debounceQueryThought = useDebounce(queryThought, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryStudying = useDebounce(queryStudying, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryLevel = useDebounce(queryLevel, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryObjective = useDebounce(queryObjective, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryBranch = useDebounce(queryBranch, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryUser = useDebounce(queryUser, AUTO_COMPLETE_DEBOUNCE);
    const queryClient = useQueryClient();
    const handleClosePopUp = () => {
        setShowPopUp(false);
    };
    const formUtils = createFormUtils(styles);


    const userQueryData = useQuery({
        queryKey: [QUERY_KEYS.ALL_STUDENT, { search: debounceQueryUser }],
        queryFn: () => apiGetAllUser('student', debounceQueryUser),
        enabled: debounceQueryUser ? true : false

    });

    const thoughtQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_SCHOOL_OF_THOUGHT, { search: debounceQueryThought }],
        queryFn: () => apiAutoCompleteSchoolOfThought(debounceQueryThought),
        enabled: debounceQueryThought ? true : false
    });
    const studyingQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_STUDYING, { search: debounceQueryStudying }],
        queryFn: () => apiAutoCompleteStudentStudying(debounceQueryStudying),
        enabled: debounceQueryStudying ? true : false
    });
    const levelQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_CURRENT_LEVEL, { search: debounceQueryLevel }],
        queryFn: () => apiAutoCompleteStudentCurrentLevel(debounceQueryLevel),
        enabled: debounceQueryLevel ? true : false
    });
    const objectiveQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_LEARNING_OBJECTIVE, { search: debounceQueryObjective }],
        queryFn: () => apiAutoCompleteLearningObjective(debounceQueryObjective),
        enabled: debounceQueryObjective ? true : false
    });

    const branchQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_BRANCH, { search: debounceQueryBranch }],
        queryFn: () => apiAutoCompleteBranch(debounceQueryBranch),
        enabled: debounceQueryBranch ? true : false
    });
    const handleCreateUser = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll<HTMLInputElement>('input[name]').forEach(node => {
            node.classList.remove('error');
            formUtils.getParentElement(node)?.removeAttribute('data-error');
        });
        const submitter = e.nativeEvent.submitter as HTMLButtonElement;
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        formData.append('role', role !== undefined ? role : 'student');
        childs.forEach(child => {
            formData.append('child_ids[]', String(child.id));
        });
        await apiCreateUser(formData);
        if (submitter.name === 'save') handleClosePopUp();
        else form.reset();
    };
    const { mutate, isPending } = useMutation({
        mutationFn: handleCreateUser,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: onMutateSuccess
    });



    const handleSetShortcode = (event: React.ChangeEvent<HTMLInputElement>) => {
        const now = new Date();
        const formattedDateTime = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;

        const inputValue = event.target.value.trim();
        const name = `${formattedDateTime}${languageUtils.getShortHand(firstName)}${languageUtils.getShortHand(inputValue)}`;

        setShortcode(name);
    };






    const options = [
        { value: 'male', label: language?.genders.male },
        { value: 'female', label: language?.genders.female },
    ];
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_BRANCH] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_SCHOOL_OF_THOUGHT] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_STUDYING] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_LEARNING_OBJECTIVE] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_STUDENT_CURRENT_LEVEL] });

            queryClient.removeQueries({ queryKey: [QUERY_KEYS.ALL_STUDENT] });

        };
    }, [queryClient]);
    return (
        <div className={
            css(
                styles.createModelContainer,
            )
        }>
            {
                isPending ? <Loading /> : null
            }
            <div className={
                css(
                    styles.createModelForm,
                )
            }>
                <div className={styles.header}>
                    <h2 className={styles.title}>{
                        [
                            language?.create,
                            language && role ? language[role] : ''
                        ].join(' ')
                    }</h2>
                    <div className={styles.escButton}
                        onClick={handleClosePopUp}
                    >
                        <RxCross2 />
                    </div>
                </div>
                <div className={styles.formContent}>
                    <form onSubmit={(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
                        mutate(e);
                    }}
                        onInput={(e) => { formUtils.handleOnInput(e); }}
                        className={styles.formData}>
                        <div className={styles.groupInputs}>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='shortcode'>{language?.shortcode}</label>
                                <input
                                    id='shortcode'
                                    name='shortcode'
                                    value={shortcode}
                                    readOnly // Prevents user modification
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text'
                                />
                            </div>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor="first_name">{language?.firstName}</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    className={css(appStyles.input, styles.inputItem)}
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)} // Update state when typing
                                />
                            </div>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='last_name'>{language?.lastName}</label>
                                <input
                                    id='last_name'
                                    name='last_name'
                                    onChange={handleSetShortcode}
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='email'>{language?.email}</label>
                                <input
                                    id='email'
                                    name='email'
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>
                            <div className={styles.wrapItem}>
                                <label htmlFor='phone_number'>{language?.phoneNumber}</label>
                                <input
                                    id='phone_number'
                                    name='phone_number'
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>

                            {role === 'student' ?
                                <>

                                    <div style={{ zIndex: 2 }} className={styles.wrapItem}>
                                        <label className={appStyles.required} htmlFor='learning_objective_id'>Learning Objective</label>
                                        <CustomDataList
                                            name='learning_objective_id'
                                            onInput={e => { setQueryObjective(e.currentTarget.value); }}
                                            options={objectiveQueryData.data ? objectiveQueryData.data.map(item => {
                                                return {
                                                    label: item.name,
                                                    value: String(item.id)
                                                };
                                            }) : []} />
                                    </div>
                                    <div style={{ zIndex: 2 }} className={styles.wrapItem}>
                                        <label className={appStyles.required} htmlFor='student_current_level_id'>Student Current Level</label>
                                        <CustomDataList
                                            name='student_current_level_id'
                                            onInput={e => { setQueryLevel(e.currentTarget.value); }}
                                            options={levelQueryData.data ? levelQueryData.data.map(item => {
                                                return {
                                                    label: item.name,
                                                    value: String(item.id)
                                                };
                                            }) : []} />
                                    </div>
                                    <div style={{ zIndex: 2 }} className={styles.wrapItem}>
                                        <label className={appStyles.required} htmlFor='student_studying_id'>Student Studying</label>
                                        <CustomDataList
                                            name='student_studying_id'
                                            onInput={e => { setQueryStudying(e.currentTarget.value); }}
                                            options={studyingQueryData.data ? studyingQueryData.data.map(item => {
                                                return {
                                                    label: item.name,
                                                    value: String(item.id)
                                                };
                                            }) : []} />
                                    </div>
                                    <div style={{ zIndex: 2 }} className={styles.wrapItem}>
                                        <label className={appStyles.required} htmlFor='school_of_thought_id'>{language?.thought}</label>
                                        <CustomDataList
                                            name='school_of_thought_id'
                                            onInput={e => { setQueryThought(e.currentTarget.value); }}
                                            options={thoughtQueryData.data ? thoughtQueryData.data.map(item => {
                                                return {
                                                    label: item.name,
                                                    value: String(item.id)
                                                };
                                            }) : []} />
                                    </div>
                                    <div className={styles.wrapItem}>
                                        <label htmlFor='disabilities_allergies_conditions'>Disabilities Allergies Conditions</label>
                                        <input
                                            id='disabilities_allergies_conditions'
                                            name='disabilities_allergies_conditions'
                                            className={css(appStyles.input, styles.inputItem)}
                                            type='text' />
                                    </div>
                                    
                                </>

                                : role === 'teacher' ? 
                                    <div style={{ zIndex: 2 }} className={styles.wrapItem}>
                                        <label className={appStyles.required} htmlFor='branch_id'>{language?.branch}</label>
                                        <CustomDataList
                                            name='branch_id'
                                            onInput={e => { setQueryBranch(e.currentTarget.value); }}
                                            options={branchQueryData.data ? branchQueryData.data.map(item => {
                                                return {
                                                    label: item.name,
                                                    value: String(item.id)
                                                };
                                            }) : []}
                                        />
                                    </div>
                                    : null
                            }
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor=''>{language?.genders.gender}</label>
                                <CustomSelect
                                    name='gender'
                                    defaultOption={options[0]}
                                    options={options}
                                    className={styles.customSelect}
                                />
                            </div>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='address'>{language?.address}</label>
                                <input
                                    id='address'
                                    name='address'
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='birth_date'>{language?.birthDate}</label>
                                <input
                                    defaultValue={dateFormat.toDateString(new Date())}
                                    max={dateFormat.toDateString(new Date())}
                                    type='date'
                                    id='birth_date'
                                    name='birth_date'
                                    className={css(appStyles.input, styles.inputItem)}
                                />
                            </div>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='password'>{language?.password}</label>
                                <input
                                    id='password'
                                    name='password'
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='password' />
                            </div>
                            {role === 'parent' ?
                                <><div style={{ zIndex: 3 }} className={styles.wrapItem}>
                                    <label className={appStyles.required}>{language?.search}</label>
                                    <input
                                        placeholder={language?.search}
                                        onInput={e => {
                                            setQueryUser(e.currentTarget.value);
                                        }}
                                        className={css(appStyles.input, styles.inputItem)}
                                        type='text' />
                                    <ul className={styles.allParentContainer}>
                                        {userQueryData.data ?
                                            userQueryData.data
                                                .filter(user => !childs.find(child => child.id === user.id))
                                                .map(user => (
                                                    <li
                                                        onClick={() => {
                                                            const newChilds = structuredClone(childs);
                                                            newChilds.push(user);
                                                            setChilds(newChilds);                                                           
                                                        }}
                                                        key={`user-${user.id}`}
                                                        className={styles.userItem}
                                                    >
                                                        <div className={styles.cardLeft}>
                                                            <span>{languageUtils.getFullName(user.firstName, user.lastName)}</span>
                                                        </div>
                                                    </li>
                                                )) : null}
                                    </ul>
                                </div>
                                    <div style={{ zIndex: 3 }} className={styles.wrapItem}>
                                        <label>{language?.allChilds}</label>
                                        <ul className={styles.joinedParentsContainer}>
                                            {childs.map((child, index) => {
                                                return (
                                                    <li
                                                        key={`joined-child-${child.id}`}
                                                        className={styles.joinedParent}
                                                    >
                                                        <div>
                                                            <span>
                                                                {languageUtils.getFullName(child.firstName, child.lastName)}
                                                            </span>
                                                            <span
                                                                style={{ height: '20px' }}
                                                                onClick={() => {
                                                                    //   if (!permissions.has('user_update')) return;
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
                                            })}
                                        </ul>
                                    </div></>
                                : null
                            }
                        </div>
                        <div className={styles.actionItems}>
                            <button name='save'
                                className={
                                    css(
                                        appStyles.actionItem,
                                        isPending ? appStyles.buttonSubmitting : ''
                                    )
                                }><FiSave />{language?.save}</button>
                            {/* <button name='save-more'
                                className={
                                    css(
                                        appStyles.actionItemWhite,
                                        isPending ? appStyles.buttonSubmitting : ''
                                    )
                                }
                            ><FiSave />{language?.saveMore}</button> */}
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
}
