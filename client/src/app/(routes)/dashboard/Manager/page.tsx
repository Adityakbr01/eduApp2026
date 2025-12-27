import DashBoardPage from "@/components/pages/dashboard/manager/DashBoard";
import RoleGate from "@/components/pages/dashboard/RoleGate";
import APP_INFO from "@/lib/constants/app_info";
import { ROLES } from "@/validators/auth.schema";

export const metadata = {
    title: `Manager Dashboard | ${APP_INFO.NAME}`,
    description: "Manager dashboard for managing the application.",
};


export default function Page() {
    return (
        <RoleGate allowed={[ROLES.MANAGER, ROLES.ADMIN]}>
            <DashBoardPage />
        </RoleGate>
    );
}
