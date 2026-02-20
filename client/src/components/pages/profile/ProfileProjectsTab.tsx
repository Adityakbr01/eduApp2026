"use client";

import { FolderOpen, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface ProfileProjectsTabProps {
  onLogout: () => void;
}

// Mock data - replace with actual data from API
const mockProjects: Project[] = [];

export default function ProfileProjectsTab({
  onLogout,
}: ProfileProjectsTabProps) {
  return (
    <div className="flex-1 w-full min-w-0">
      <div className="bg-[#111111] border border-[#BF532B1A] rounded-[20px] p-6 sm:p-8 h-full min-h-[600px] shadow-[0_0_50px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BF532B]/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 relative z-10 w-full shrink-0">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-manrope font-medium text-white mb-2 tracking-tight">
              My Projects
            </h1>
            <p className="text-white/40 text-[13px] font-manrope font-light tracking-wide">
              Showcase your best work to the community
            </p>
          </div>
          <Link
            href="/submit-projects"
            className="flex items-center gap-2 px-8 py-3.5 bg-[#BF532B] hover:bg-[#A64522] text-white rounded-xl transition-all text-sm font-manrope font-bold shadow-[0_4px_12px_rgba(191,83,43,0.3)]"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Submit Project</span>
          </Link>
        </div>

        {/* Projects Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {mockProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <div className="w-[60px] h-[60px] rounded-[20px] bg-[#BF532B]/10 border border-[#BF532B]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_-10px_rgba(191,83,43,0.2)]">
                <FolderOpen size={24} className="text-[#BF532B]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-manrope font-bold text-white mb-2">
                No projects yet
              </h3>
              <p className="text-white/40 text-sm font-manrope max-w-sm mb-8 leading-relaxed">
                You haven&apos;t submitted any projects yet. Start building your
                portfolio by submitting your first project!
              </p>
              <Link
                href="/submit-projects"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-manrope font-bold text-sm rounded-xl transition-all border border-white/10 hover:border-white/20"
              >
                Start Submission
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
          <button
            onClick={onLogout}
            className="text-white/30 hover:text-red-400 text-xs font-manrope font-bold transition-colors uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const getStatusBadge = (status: Project["status"]) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      approved: "bg-green-500/10 text-green-500 border-green-500/30",
      rejected: "bg-red-500/10 text-red-500 border-red-500/30",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-manrope font-bold capitalize border ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="group bg-[#0A0A0A] border border-white/5 rounded-[20px] p-4 flex flex-col hover:border-[#BF532B]/30 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative mb-4 overflow-hidden rounded-xl bg-[#111] aspect-video">
        <Image
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          src={project.thumbnail}
          width={400}
          height={225}
        />
        <div className="absolute top-3 right-3">{getStatusBadge(project.status)}</div>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <h4 className="font-manrope font-medium text-white text-[15px] leading-snug line-clamp-1 mb-2">
          {project.title}
        </h4>
        <p className="text-white/40 text-[12px] font-manrope line-clamp-2 mb-4">
          {project.description}
        </p>
        <p className="text-white/30 text-[11px] font-manrope mt-auto">
          Submitted on {project.submittedAt}
        </p>
      </div>
    </div>
  );
}
