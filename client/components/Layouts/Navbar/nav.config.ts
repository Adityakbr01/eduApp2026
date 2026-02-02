import { user_roles, user_Role_type } from "@/constants/roles";
import {
  User,
  Settings,
  LogOut,
  Shield,
  BookOpen,
  LayoutDashboard,
  Users,
  Headphones,
  type LucideIcon,
} from "lucide-react";

// ============ Types ============
export interface NavLink {
  label: string;
  href?: string;
  external?: boolean;
  isButton?: boolean;
}

export interface ProfileMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface RoleDashboardLink {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: user_Role_type[];
}

// ============ Main Navigation Links ============
export const mainNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Bootcamp", href: "https://bootcamp.sheryians.com", external: true },
  { label: "Request Callback", isButton: true },
];

// ============ Profile Menu Items (Common for all logged-in users) ============
export const commonProfileMenuItems: ProfileMenuItem[] = [
  { label: "My Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ============ Role-Based Dashboard Links ============
// Add new roles here - the system will automatically show links based on user's role
export const roleDashboardLinks: RoleDashboardLink[] = [
  {
    label: "Admin Dashboard",
    href: "/dashboard/Admin",
    icon: Shield,
    roles: [user_roles.ADMIN],
  },
  {
    label: "Instructor Dashboard",
    href: "/dashboard/Instructor",
    icon: BookOpen,
    roles: [user_roles.INSTRUCTOR],
  },
  {
    label: "Manager Dashboard",
    href: "/dashboard/Manager",
    icon: LayoutDashboard,
    roles: [user_roles.MANAGER],
  },
  {
    label: "Support Dashboard",
    href: "/dashboard/Support",
    icon: Headphones,
    roles: [user_roles.SUPPORT],
  },
  {
    label: "My Learning",
    href: "/dashboard/learning",
    icon: BookOpen,
    roles: [user_roles.STUDENT],
  },
];

// ============ Helper Functions ============

/**
 * Get dashboard links based on user's role
 * @param userRole - The user's role name
 * @returns Array of dashboard links the user has access to
 */
export const getDashboardLinksByRole = (
  userRole: string | undefined
): RoleDashboardLink[] => {
  if (!userRole) return [];

  return roleDashboardLinks.filter((link) =>
    link.roles.includes(userRole as user_Role_type)
  );
};

/**
 * Get all menu items for a user (role-based + common)
 * @param userRole - The user's role name
 * @returns Combined array of dashboard links and common menu items
 */
export const getFullMenuForRole = (
  userRole: string | undefined
): ProfileMenuItem[] => {
  const dashboardLinks = getDashboardLinksByRole(userRole);
  
  // Convert role dashboard links to profile menu items
  const roleMenuItems: ProfileMenuItem[] = dashboardLinks.map((link) => ({
    label: link.label,
    href: link.href,
    icon: link.icon,
  }));

  // Return role-specific links first, then common items
  return [...roleMenuItems, ...commonProfileMenuItems];
};

// ============ Export Icons for External Use ============
export const icons = {
  User,
  Settings,
  LogOut,
  Shield,
  BookOpen,
  LayoutDashboard,
  Users,
  Headphones,
};
