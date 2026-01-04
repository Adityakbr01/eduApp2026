import APP_info from '@/constants/app_info';
import { user_roles } from '@/constants/roles';
import RoleGate from '@/Providers/RoleGate';
import { InstructorDashboard } from '@/components/pages/dashboards/instructor';

export const metadata = {
    title: `Instructor Dashboard | ${APP_info.NAME}`,
    description: "Instructor dashboard for managing the courses.",
};

function page() {
    return (
        <RoleGate allowed={[user_roles.INSTRUCTOR]}>
            <InstructorDashboard />
        </RoleGate>
    )
}

export default page