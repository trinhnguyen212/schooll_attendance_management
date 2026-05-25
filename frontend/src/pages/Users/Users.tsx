import appStyles from '~styles/App.module.css';
import styles from '~styles/TablePage.module.css';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
    BiExport,
    BiImport
} from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import {
    RiAddFill
} from 'react-icons/ri';
import { Navigate, useSearchParams } from 'react-router';
import { apiAutoCompleteBranch, apiGetBranchById } from '~api/branch';
import { apiAutoCompleteSchoolOfThought, apiGetSchoolOfThoughtById } from '~api/school-of-thought';
import { apiDeleteUserByIds, apiGetPaginateUsers, apiImportUsers } from '~api/user';
import CustomDataList from '~components/CustomDataList';
import CustomSelect from '~components/CustomSelect';
import ImportData from '~components/ImportData';
import Loading from '~components/Loading';
import YesNoPopUp from '~components/YesNoPopUp';
// import ErrorPopUp from '~components/ErrorPopUp';
import DuplicatePopUp from '~components/DuplicatePopUp';


import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import { RoleName } from '~models/role';
import css from '~utils/css';
import { importTemplateFileUrl } from '~utils/template';
import CreateUser from './components/CreateUser';
import ExportUsers from './components/ExportUsers';
import UsersTable from './components/UsersTable';
import { ChevronDown } from 'lucide-react';
// import { toast } from 'sonner';

const schoolClassFilterKey = 'school_class_id';
const schoolOfThoughtFilterKey = 'school_of_thought_id';
const branchFilterKey = 'branch_id';

type UsersProps = {
    role: RoleName;
};


export default function Users({
    role
}: UsersProps) {
    const language = useLanguage('page.users');
    const { permissions, appTitle } = useAppContext();
    const [showCreatePopUp, setShowCreatePopUp] = useState(false);
    const [showExportPopUp, setShowExportPopUp] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
    const [showImportPopUp, setShowImportPopUp] = useState(false);
    const [showDeletePopUp, setShowDeletePopUp] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string | number>>(new Set());
    // const [showError, setShowError] = useState(false);
    // const [errorMsg, setErrorMsg] = useState('');
    const [showDuplicatePopUp, setShowDuplicatePopUp] = useState(false);
    const [duplicateItems, setDuplicateItems] = useState<{
        emails: string[];
        phones: string[];
    }>({ emails: [], phones: [] });


    //
    // const [duplicatePopUpVisible, setDuplicatePopUpVisible] = useState(false);
    // const [duplicateData, setDuplicateData] = useState<any[]>([]);
    //

    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const queryDebounce = useDebounce(searchQuery);
   // const [queryClass, setQueryClass] = useState('');
    const [queryThought, setQueryThought] = useState('');
    const [queryBranch, setQueryBranch] = useState('');
  //  const debounceQueryClass = useDebounce(queryClass, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryThought = useDebounce(queryThought, AUTO_COMPLETE_DEBOUNCE);
    const debounceQueryBranch = useDebounce(queryBranch, AUTO_COMPLETE_DEBOUNCE);
//    const initClass = useRef(searchParams.get(schoolClassFilterKey) || '');
    const initThought = useRef(searchParams.get(schoolOfThoughtFilterKey) || '');
    const initBranch = useRef(searchParams.get(branchFilterKey) || '');
    const queryClient = useQueryClient();
    const queryData = useQuery({
        queryKey: [
            QUERY_KEYS.PAGE_USERS,
            {
                role: role,
                page: searchParams.get('page') || '1',
                perPage: searchParams.get('per_page') || '10',
                search: queryDebounce,
                branchId: searchParams.get(branchFilterKey) || '',
                schoolClassId: searchParams.get(schoolClassFilterKey) || '',
                schoolOfThoughtId: searchParams.get(schoolOfThoughtFilterKey) || ''
            }
        ],
        queryFn: () => apiGetPaginateUsers({
            role: role,
            page: Number(searchParams.get('page') || '1'),
            perPage: Number(searchParams.get('per_page') || '10'),
            search: queryDebounce,
            branchId: searchParams.get(branchFilterKey) || '',
            schoolOfThoughtId: searchParams.get(schoolOfThoughtFilterKey) || '',
        }),
        enabled: permissions.has('user_view')
    });

    const thoughtQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_SCHOOL_OF_THOUGHT, { search: debounceQueryThought }],
        queryFn: () => apiAutoCompleteSchoolOfThought(debounceQueryThought),
        enabled: debounceQueryThought ? true : false
    });

    const initThoughtQueryData = useQuery({
        queryKey: [QUERY_KEYS.SCHOOL_OF_THOUGHT_DETAIL, { id: initThought.current }],
        queryFn: () => apiGetSchoolOfThoughtById(initThought.current),
        enabled: initThought.current ? true : false,
    });
    const initBranchQueryData = useQuery({
        queryKey: [QUERY_KEYS.BRANCH_DETAIL, { id: initBranch.current }],
        queryFn: () => apiGetBranchById(initBranch.current),
        enabled: initBranch.current ? true : false,
    });
    const branchQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_BRANCH, { search: debounceQueryBranch }],
        queryFn: () => apiAutoCompleteBranch(debounceQueryBranch),
        enabled: debounceQueryBranch ? true : false
    });


    //
    const importFunction = async (file: File) => {
        const response = await apiImportUsers(file, role);

        if (response?.duplicates && (response.duplicates.emails.length > 0 || response.duplicates.phones.length > 0)) {
            setDuplicateItems(response.duplicates); 
            setShowDuplicatePopUp(true);
        }

        return response;
    };

    //
    const handleDeleteUsers = async () => {
        await apiDeleteUserByIds(Array.from(selectedUserIds));
    };
    const onMutateSuccess = () => {
        [QUERY_KEYS.PAGE_USERS, QUERY_KEYS.PAGE_DASHBOARD].forEach(key => {
            queryClient.refetchQueries({ queryKey: [key] });
        });
    };
    useEffect(() => {
        setSelectedUserIds(new Set());
    }, [queryData.data]);
    useEffect(() => {
        return () => {
            if (!window.location.pathname.includes(role)) setSearchParams(new URLSearchParams());
        };
    });
    useEffect(() => {
        if (!searchParams.get('search') && !queryDebounce) return;
        if (queryDebounce === '') searchParams.delete('search');
        else searchParams.set('search', queryDebounce);
        setSearchParams(searchParams);
    }, [queryDebounce, searchParams, setSearchParams]);
    useEffect(() => {
        if (language) {
            if (role === 'student') appTitle.setAppTitle(language.student);
            if (role === 'teacher') appTitle.setAppTitle(language.teacher);
            if (role === 'parent') appTitle.setAppTitle(language.parent);
            if (role === 'admin') appTitle.setAppTitle(language.admin);
        }
    }, [appTitle, language, role]);
    if (!permissions.has('user_view')) return <Navigate to='/' />;
   // if (initClass.current && !initClassQueryData.data) return null;
    if (initThought.current && !initThoughtQueryData.data) return null;
    if (initBranch.current && !initBranchQueryData.data) return null;
    return (
        <>
            {showCreatePopUp === true ?
                <CreateUser
                    role={role}
                    onMutateSuccess={onMutateSuccess}
                    setShowPopUp={setShowCreatePopUp}
                /> : null}
            {showExportPopUp === true ?
                <ExportUsers
                    role={role}
                    setShowPopUp={setShowExportPopUp}
                   // exportFormat={exportFormat}
                /> : null}
            {showDeletePopUp === true ?
                <YesNoPopUp
                    message={language?.deleteMessage.replace('@n', String(selectedUserIds.size)) || ''}
                    mutateFunction={handleDeleteUsers}
                    setShowPopUp={setShowDeletePopUp}
                    onMutateSuccess={onMutateSuccess}
                    langYes={language?.langYes}
                    langNo={language?.langNo}
                /> : null}
            {showDuplicatePopUp && (
                <DuplicatePopUp
                    duplicates={duplicateItems}
                    setShowPopUp={setShowDuplicatePopUp}
                />
            )}

            {showImportPopUp === true ?
                <ImportData
                    title={[
                        language?.import,
                        language ? language[role] : ''
                    ].join(' ')
                    }
                    icon={<PiMicrosoftExcelLogoFill />}
                    teamplateUrl={importTemplateFileUrl[role]}
                    importFunction={importFunction}
                    setShowPopUp={setShowImportPopUp}
                    onMutateSuccess={onMutateSuccess}
                /> : null}
            <main className={appStyles.dashboard}>
                {
                    permissions.hasAnyFormList(['user_view', 'user_create', 'user_update', 'user_delete'])
                        ?
                        <section className={appStyles.actionBar}>
                            <div className={appStyles.leftActions}>
                                {
                                    permissions.has('user_create') ?
                                        <div className={appStyles.actionItem}
                                            onClick={() => {
                                                setShowCreatePopUp(true);
                                            }}
                                        >
                                            <RiAddFill /> {language?.add}
                                        </div>
                                        : null
                                }

                                <div
                                    onClick={() => {
                                        if (selectedUserIds.size > 0) setShowDeletePopUp(true);
                                    }}
                                    className={`${appStyles.actionItemWhiteBorderRed} ${selectedUserIds.size > 0 ? appStyles.enabled : appStyles.disabled
                                        }`}
                                >
                                    <MdDeleteOutline /> {language?.delete}
                                </div>


                            </div>

                            {/* {
                                permissions.has('user_create') ?
                                    <div className={appStyles.actionItemWhite}
                                        onClick={() => {
                                            setShowImportPopUp(true);
                                        }}
                                    >
                                        <BiImport /> {language?.import}
                                    </div>
                                    : null
                            } */}
                            <div className={appStyles.rightActions}>
                                {
                                    permissions.has('user_create') ?
                                        <div className={appStyles.actionItemWhite}
                                            onClick={() => {
                                                setShowImportPopUp(true);
                                            }}
                                        >
                                            <BiImport /> {language?.import}
                                        </div>
                                        : null
                                }
                                {/* {
                                    permissions.has('user_view') ?
                                        <div className={appStyles.actionItemWhite}
                                            onClick={() => {
                                                setExportFormat('csv');  // Set format to CSV
                                                setShowExportPopUp(true);  // Show the export pop-up
                                            }}
                                        >
                                            <BiExport /> Export csv
                                        </div>
                                        : null
                                } */}
                                {
                                    permissions.has('user_view') ?
                                        <div className={appStyles.actionItemWhite}
                                            onClick={() => {
                                                setExportFormat('xlsx');  
                                                setShowExportPopUp(true);  
                                            }}
                                        >
                                            <BiExport /> {language?.export}
                                        </div>
                                        : null
                                }
                            </div>



                        </section>
                        : null
                }
                <section className={styles.tablePageContent}>
                    <div className={styles.filterForm}>
                        <div style={{ zIndex: 2 }} className={styles.wrapInputItem}>
                            <label>{language?.filter.perPage}</label>
                            <div className={styles.selectWrapper}>
                                <CustomSelect
                                    defaultOption={
                                        {
                                            label: searchParams.get('per_page') || '10',
                                            value: searchParams.get('per_page') || '10'
                                        }
                                    }
                                    options={[
                                        {
                                            label: '10',
                                            value: '10'
                                        },
                                        {
                                            label: '20',
                                            value: '20'
                                        },
                                        {
                                            label: '30',
                                            value: '30'
                                        },
                                        {
                                            label: '40',
                                            value: '40'
                                        },
                                        {
                                            label: '50',
                                            value: '50'
                                        },
                                    ]}
                                    onChange={(option) => {
                                        searchParams.set('per_page', option.value);
                                        setSearchParams(searchParams);
                                    }}
                                    className={styles.customSelect}
                                />
                                <ChevronDown className={styles.dropdownIcon} size={20} />

                            </div>

                        </div>
                        {role === 'student' ?
                            <>{/* <div style={{ zIndex: 1 }} className={styles.wrapInputItem}>
                                <label htmlFor={schoolClassFilterKey}>{language?.class}</label>
                                <CustomDataList
                                    key='school_class-custom-datalist'
                                    name={schoolClassFilterKey}
                                    defaultOption={{
                                        label: initClass.current ? initClassQueryData.data!.name : '',
                                        value: initClass.current ? String(initClassQueryData.data!.id) : ''
                                    }}
                                    onInput={e => {
                                        setQueryClass(e.currentTarget.value);
                                        if (!e.currentTarget.value.trim()) {
                                            searchParams.delete(schoolClassFilterKey);
                                            setSearchParams(searchParams);
                                        }
                                    } }
                                    options={classQueryData.data ? classQueryData.data.map(item => {
                                        return {
                                            label: item.name,
                                            value: String(item.id)
                                        };
                                    }) : []}
                                    onChange={(option) => {
                                        searchParams.set(schoolClassFilterKey, String(option.value));
                                        setSearchParams(searchParams);
                                    } } />
                            </div> */}<div style={{ zIndex: 1 }} className={styles.wrapInputItem}>
                                    <label htmlFor={schoolOfThoughtFilterKey}>{language?.thought}</label>
                                    <CustomDataList
                                        key='school_of_thought-custom-datalist'
                                        name={schoolOfThoughtFilterKey}
                                        defaultOption={{
                                            label: initThought.current ? initThoughtQueryData.data!.name : '',
                                            value: initThought.current ? String(initThoughtQueryData.data!.id) : ''
                                        }}
                                        onInput={e => {
                                            setQueryThought(e.currentTarget.value);
                                            if (!e.currentTarget.value.trim()) {
                                                searchParams.delete(schoolOfThoughtFilterKey);
                                                setSearchParams(searchParams);
                                            }
                                        }}
                                        options={thoughtQueryData.data ? thoughtQueryData.data.map(item => {
                                            return {
                                                label: item.name,
                                                value: String(item.id)
                                            };
                                        }) : []}
                                        onChange={(option) => {
                                            searchParams.set(schoolOfThoughtFilterKey, String(option.value));
                                            setSearchParams(searchParams);
                                        }} />
                                </div></>
                            : role === 'teacher' ?
                                <div style={{ zIndex: 1 }} className={styles.wrapInputItem}>
                                    <label htmlFor={branchFilterKey}>{language?.branch}</label>
                                    <CustomDataList
                                        key='branch-custom-datalist'
                                        name={branchFilterKey}
                                        defaultOption={
                                            {
                                                label: initBranch.current ? initBranchQueryData.data!.name : '',
                                                value: initBranch.current ? String(initBranchQueryData.data!.id) : ''
                                            }
                                        }
                                        onInput={e => {
                                            setQueryBranch(e.currentTarget.value);
                                            if (!e.currentTarget.value.trim()) {
                                                searchParams.delete(branchFilterKey);
                                                setSearchParams(searchParams);
                                            }
                                        }}
                                        options={branchQueryData.data ? branchQueryData.data.map(item => {
                                            return {
                                                label: item.name,
                                                value: String(item.id)
                                            };
                                        }) : []}
                                        onChange={(option) => {
                                            searchParams.set(branchFilterKey, String(option.value));
                                            setSearchParams(searchParams);
                                        }}
                                    />
                                </div>
                                : null
                        }
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
                    <div className={styles.wrapTable}>
                        {
                            queryData.isLoading ? <Loading /> : null
                        }
                        {!queryData.isError ?
                            <UsersTable
                                role={role}
                                data={queryData.data}
                                searchParams={searchParams}
                                onMutateSuccess={onMutateSuccess}
                                setSearchParams={setSearchParams}
                                setSelectedRows={setSelectedUserIds}
                            />
                            : null}
                    </div>
                </section>
            </main>
        </>
    );
}
