import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import appStyles from '~styles/App.module.css';
import styles from './styles/Permissions.module.css';

import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { apiGetRolePermissionCount } from '~api/role-permission';
import Loading from '~components/Loading';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import css from '~utils/css';
import RolePermissions from './components/RolePermissions';

function CustomTabPanel(props: { [x: string]: any; children: any; value: any; index: any; }) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function Permissions() {
    const { permissions, appTitle } = useAppContext();
    const language = useLanguage('page.permissions');
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.PAGE_ROLE_PERMISSIONS],
        queryFn: apiGetRolePermissionCount,
        enabled: permissions.has('role_permission_view')
    });

    const [value, setValue] = useState(0);

    const handleChange = (_event: any, newValue: React.SetStateAction<number>) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (language) appTitle.setAppTitle(language.permissions);
    }, [appTitle, language]);

    if (!permissions.has('role_permission_view')) return <Navigate to='/' />;

    useEffect(() => {
        if (queryData.isError) {
            console.error('Error fetching data:', queryData.error);
        }
    }, [queryData]);

    return (
        <div className={css(appStyles.dashboard, styles.permissionContainer)}>
            {queryData.isLoading ? <Loading /> : null}
            {queryData.data ? (
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="permissions tabs"
                            sx={{
                                display: 'flex',
                                '& .MuiTabs-indicator': {
                                    backgroundColor: 'var(--color-primary)', // Active tab underline color
                                },
                            }}
                        >
                            <Tab
                                label="Teacher"
                                {...a11yProps(0)}
                                sx={{
                                    flex: '1',
                                    '&.Mui-selected': { color: 'var(--color-primary)' }, // Selected tab text color
                                }}
                            />
                            <Tab
                                label="Student"
                                {...a11yProps(1)}
                                sx={{
                                    flex: '1',
                                    '&.Mui-selected': { color: 'var(--color-primary)' },
                                }}
                            />
                            <Tab
                                label="Parent"
                                {...a11yProps(2)}
                                sx={{
                                    flex: '1',
                                    '&.Mui-selected': { color: 'var(--color-primary)' },
                                }}
                            />
                        </Tabs>


                    </Box>
                    <CustomTabPanel value={value} index={0}>
                        <RolePermissions role="2" />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <RolePermissions role="3" />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={2}>
                        <RolePermissions role="4" />
                    </CustomTabPanel>
                </Box>
            ) : null}
        </div>
    );
}
