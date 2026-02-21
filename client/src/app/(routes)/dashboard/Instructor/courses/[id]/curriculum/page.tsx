import { CurriculumManager } from "@/features/dashboards/instructor/courses/curriculum";
import RoleGate from "@/providers/RoleGate";
import { ROLES } from "@/validators/auth.schema";

export default function CurriculumPage() {
  return (
    <RoleGate allowed={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
      <CurriculumManager />
    </RoleGate>
  );
}
