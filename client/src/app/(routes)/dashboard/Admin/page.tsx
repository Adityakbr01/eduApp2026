import DashBoardPage from "@/components/pages/dashboard/admin/DashBoardPage";
import RoleGate from "@/components/pages/dashboard/RoleGate";
import APP_INFO from "@/lib/constants/APP_INFO";
import { ROLES } from "@/validators/auth.schema";

export const metadata = {
    title: `Admin Dashboard | ${APP_INFO.NAME}`,
    description: "Admin dashboard for managing the application.",
};


export default function Page() {
    return (
        <RoleGate allowed={[ROLES.ADMIN, ROLES.MANAGER]}>
            <DashBoardPage />
        </RoleGate>
    );
}
