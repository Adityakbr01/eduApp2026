import DashBoardPage from "@/features/dashboards/admin/DashBoardPage";
import RoleGate from "@/providers/RoleGate";
import APP_info from "@/constants/app_info";
import { user_roles } from "@/constants/roles";

export const metadata = {
  title: `Admin Dashboard | ${APP_info.NAME}`,
  description: "Admin dashboard for managing the application.",
};

export default function Page() {
  return (
    <RoleGate allowed={[user_roles.ADMIN, user_roles.MANAGER]}>
      <DashBoardPage />
    </RoleGate>
  );
}
