import appStyles from '~styles/App.module.css';
import styles from './styles/Dashboard.module.css';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { GrCertificate } from 'react-icons/gr';
import {
    PiChalkboardTeacherLight,
    PiClock,
    PiStudent
} from 'react-icons/pi';
//import { Link } from 'react-router-dom';
import { apiGetDashboard } from '~api/dashboard';
import Loading from '~components/Loading';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import css from '~utils/css';
import DashboardCard from './components/DashboardCard';
import AttendancesEachMonthChart from './components/AttendancesEachMonthChart';

export default function Dashboard() {
    const { permissions, appLanguage, appTitle, user } = useAppContext(); // Access user from context
    const language = useLanguage('page.dashboard');
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.PAGE_DASHBOARD],
        queryFn: apiGetDashboard,
        
    });
    

    //
    const [showUserName, setShowUserName] = useState(false);

    useEffect(() => {
        // Set a delay before showing the user's name
        const timer = setTimeout(() => {
            setShowUserName(true);
        }, 2000); // Adjust delay as needed (in milliseconds)

        return () => clearTimeout(timer);
    }, []);
    //

    const formatNumber = (number: number) => {
        return number.toLocaleString(appLanguage.language, {
            notation: 'compact'
        });
    };

    useEffect(() => {
        if ((user.user?.role.name === 'admin' || user.user?.role.name === 'teacher') && language) {
            appTitle.setAppTitle(language.dashboard);
        }
    }, [appTitle, language, user.user?.role.name]);
    

    return (
        <main className={css(appStyles.dashboard, styles.dashboard)}>
            {queryData.isLoading ? <Loading /> : null}
            {!queryData.isError && queryData.data ? (
                <>
                    <section className={styles.wrapDashboardItem}>
                        {/* Show the number of students only for admin and teacher */}
                        {(user.user?.role.name === 'admin' || user.user?.role.name === 'teacher') && (
                            <DashboardCard
                            
                                to={permissions.has('user_view') ? '/students' : undefined}
                                color="magenta"
                                content={language?.items.numberOfStudents}
                                data={formatNumber(queryData.data?.numberOfStudents)}
                                icon={<PiStudent />}
                            />
                        )}

                        {/* Show the number of parents only for admin */}
                        {(user.user?.role.name === 'admin' || user.user?.role.name === 'teacher') && (
                            <DashboardCard
                                to={permissions.has('user_view') ? '/parents' : undefined}
                                color="magenta"
                                content={language?.items.numberOfParents}
                                data={formatNumber(queryData.data?.numberOfParents)}
                                icon={<PiStudent />}
                            />
                        )}

                        {/* Show the number of teachers only for admin */}
                        {(user.user?.role.name === 'admin' || user.user?.role.name === 'teacher') && (
                            <DashboardCard
                                to={permissions.has('user_view') ? '/teachers' : undefined}
                                color="red"
                                content={language?.items.numberOfTeachers}
                                data={formatNumber(queryData.data?.numberOfTeachers)}
                                icon={<PiChalkboardTeacherLight />}
                            />
                        )}

                        {/* Show the number of classes and courses for admin and teacher */}
                        {(user.user?.role.name === 'admin' || user.user?.role.name === 'teacher' ) && (
                            <>
                                <DashboardCard
                                    color="green"
                                    content={language?.items.numberOfClasses}
                                    data={formatNumber(queryData.data?.numberOfClasses)}
                                    icon={<GrCertificate />}
                                />
                                <DashboardCard
                                    color="green"
                                    content={language?.items.numberOfCourses}
                                    data={formatNumber(queryData.data?.numberOfCourses)}
                                    icon={<GrCertificate />}
                                />
                            </>
                        )}
                    </section>
                    

                    {(user.user?.role.name === 'admin' || user.user?.role.name === 'teacher' ) && (
                    <div className={css(styles.wrapSections)}>
                        <AttendancesEachMonthChart
                            label={language?.attendancesEachMonth}
                            data={queryData.data.attendancesEachMonth}
                        />
                    </div>
                    )}
{user.user?.role.name === 'student' && (
    <section className={styles.aboutSection}>
       
       <h1 className={styles.userName}>
       Hi {user.user.firstName}! 
        </h1>
       <h1 className={styles.welcomeMessag}>
       
            {showUserName && <span >Welcome to Madrasahtul Islamiyah</span>} {/* Replace 'Ellie Piper' with dynamic user data */}
        </h1>

        
        <p>
            At Madrasahtul Islamiyah, we are dedicated to nurturing the hearts and minds of our students
            with a strong foundation in Islamic education and academic excellence. Located in
            Wellington, New Zealand, we are proud to serve our community as a beacon of knowledge, faith,
            and unity.
        </p>
        <h2>About Our School</h2>
        <p>
            Our institution focuses on providing a comprehensive curriculum that blends traditional
            Islamic education with modern academic subjects. We aim to create an inclusive and supportive
            environment where students grow spiritually, intellectually, and socially to become role
            models in their communities.
        </p>
        <ul>
            <li><strong>Values:</strong> Faith, Integrity, Compassion, Respect</li>
            <li><strong>Focus:</strong> Holistic development through knowledge and character-building</li>
            <li><strong>Environment:</strong> Safe, inclusive, and community-focused</li>
        </ul>
        
        <h2>Support Our Mission</h2>
        <p>
            Your generous contributions help us continue providing a quality education and a nurturing
            environment for our students. Together, we can build a brighter future for the community.
        </p>
        <p>
            <strong>How to Donate:</strong> You can support us by donating online or by visiting us in
            person. All donations go directly toward school improvements, student programs, and
            scholarships.
        </p>
        <p className={styles.donationInfo}>
            For more information about donations, please contact us at:{' '}
            <a href="mailto:donations@madrasahtul-islamiyah.co.nz">donations@madrasahtul-islamiyah.co.nz</a>
        </p>
        <h2>Your Feedback</h2>
        <p>
            The dedicated team of Madrasahtul Islamiyah strives wholeheartedly to provide their utmost
            commitment. Rooted in the teachings of the Quran and Sunnah, we work tirelessly to deliver
            excellence in education and seek prayers and guidance from our Ulama and elders. Your
            suggestions and feedback are invaluable to us, helping us continuously improve. Please feel
            free to contact us directly or drop us an email.
        </p>
        <a
            href="https://madrasahtul-islamiyah.co.nz/contact-details/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactButton}
        >
            Contact Us
        </a>
    </section>
)}


                </>
            ) : null}
        </main>
    );
}
