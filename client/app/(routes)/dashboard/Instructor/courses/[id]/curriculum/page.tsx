
import { CurriculumManager } from "@/components/pages/dashboards/instructor/courses/curriculum";
import RoleGate from "@/Providers/RoleGate";
import { ROLES } from "@/validators/auth.schema";

export default function CurriculumPage() {
    return (
        <RoleGate allowed={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
            <CurriculumManager />
        </RoleGate>
    );
}
