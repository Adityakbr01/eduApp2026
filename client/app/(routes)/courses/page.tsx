import APP_info from '@/constants/app_info';
import { CoursesPage } from '@/components/pages/course/CoursesPage';

export const metadata = {
    title: `Explore Courses | ${APP_info.NAME}`,
    description: "Browse and discover courses to enhance your skills",
};

export default function Page() {
    return <CoursesPage />;
}
