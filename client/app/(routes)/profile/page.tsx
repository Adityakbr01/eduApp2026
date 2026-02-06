"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Briefcase, GraduationCap } from "lucide-react";

import ProfileBasicTab from "@/components/pages/profile/ProfileBasicTab";
import ProfileProfessionalTab from "@/components/pages/profile/ProfileProfessionalTab";
import ProfileBatchesTab from "@/components/pages/profile/ProfileBatchesTab";
import ProfileProjectsTab from "@/components/pages/profile/ProfileProjectsTab";
import { useLogout } from "@/services/auth/mutations";
import { useAuthStore } from "@/store/auth";
import ProfileSkeleton from "@/components/ProfileSkeleton";

// Skeleton component for loading state


type TabType = "basic" | "professional" | "batches" | "projects";

const navTabs = [
  {
    id: "basic" as TabType,
    label: "Basic Info",
    description: "Personal information",
    icon: UserIcon,
  },
  {
    id: "professional" as TabType,
    label: "Professional",
    description: "Work & education details",
    icon: Briefcase,
  },
  {
    id: "batches" as TabType,
    label: "Your Batches",
    description: "Enrolled & purchased",
    icon: GraduationCap,
  },
  {
    id: "projects" as TabType,
    label: "My Projects",
    description: "Submitted projects",
    icon: Briefcase,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: logout } = useLogout();
  const { user, hydrated, isLoggedIn } = useAuthStore();
  const router = useRouter();

  // Redirect to signin if not logged in after hydration
  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.replace("/signin");
    }
  }, [hydrated, isLoggedIn, router]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    logout();
  };

  // Show skeleton while loading or if not logged in (redirecting)
  if (!hydrated || !isLoggedIn || !user) {
    return <ProfileSkeleton />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <ProfileBasicTab
            isEditing={isEditing}
            onEdit={handleEdit}
            onLogout={handleLogout}
          />
        );
      case "professional":
        return (
          <ProfileProfessionalTab
            isEditing={isEditing}
            onEdit={handleEdit}
            onLogout={handleLogout}
          />
        );
      case "batches":
        return (
          <ProfileBatchesTab onEdit={handleEdit} onLogout={handleLogout} />
        );
      case "projects":
        return <ProfileProjectsTab onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pt-10 min-h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <div className="w-full lg:w-[280px] flex-shrink-0 lg:sticky lg:top-24 h-fit">
        <div className="bg-[#111111] border border-white/5 rounded-[20px] p-5 w-full h-full flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col w-full">
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-[20px] font-manrope font-light text-white tracking-tight">
                My Profile
              </h1>
              <p className="text-white/40 text-[12px] font-manrope font-light leading-relaxed mt-1">
                Manage your personal information and preferences
              </p>
            </div>

            {/* Profile Avatar */}
            <div className="flex flex-col items-center text-center mt-1 mb-6">
              <div className="relative mb-4 group">
                <div className="w-[100px] h-[100px] rounded-full p-[2px] border-2 border-white/10 relative">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1A1A]">
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt="Profile"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        src={user.avatar}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <UserIcon size={40} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <h2 className="text-[20px] font-manrope font-medium text-white mb-2 tracking-tight">
                {user?.name || "User"}
              </h2>
              <div className="px-3 py-1 rounded-full bg-[#BF532B]/10 border border-[#BF532B]/30 text-[#BF532B] text-[11px] font-manrope font-medium uppercase tracking-wider">
                {user?.roleName || "student"}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 w-full">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden border ${
                      isActive
                        ? "border-transparent text-white shadow-[0_4px_20px_-4px_rgba(191,83,43,0.4)]"
                        : "border-white/5 bg-[#161616] text-white/40 hover:bg-[#1C1C1C] hover:text-white/80"
                    }`}
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-[#BF532B] z-0"
                        style={{ opacity: 1 }}
                      />
                    )}
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#0A0A0A] text-white/30 group-hover:text-white/60 group-hover:bg-[#111]"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2 : 1.5}
                      />
                    </div>
                    <div className="relative z-10 text-left flex-1 min-w-0">
                      <div
                        className={`font-manrope font-medium text-[14px] leading-tight truncate ${
                          isActive ? "text-white" : "text-white/70"
                        }`}
                      >
                        {tab.label}
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 font-manrope font-light truncate ${
                          isActive ? "text-white/80" : "text-white/30"
                        }`}
                      >
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6 w-full">
            <div className="bg-[#161616] border border-white/5 rounded-xl p-4 flex flex-col justify-between h-[90px] hover:border-white/10 transition-all">
              <div className="text-3xl font-manrope font-medium text-white">1</div>
              <div className="text-[11px] text-white/40 font-manrope font-light leading-tight">
                Purchased Batches
              </div>
            </div>
            <div className="bg-[#161616] border border-[#BF532B]/50 rounded-xl p-4 flex flex-col justify-between h-[90px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[#BF532B]/5 pointer-events-none" />
              <div className="text-3xl font-manrope font-medium text-white relative z-10">
                1
              </div>
              <div className="text-[11px] text-white/60 font-manrope font-light leading-tight relative z-10">
                Enrolled Batches
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0">{renderTabContent()}</div>
    </div>
  );
}

