import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  BarChart3,
  Play,
  ChevronRight,
  Github,
  Youtube,
  Globe,
  MessageCircle,
} from "lucide-react";
import { SocialLink, SocialLinkType } from "@/services/courses";

// Custom Discord Icon since Lucide doesn't have the brand logo
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.116 13.116 0 0 0-.693 1.458 17.653 17.653 0 0 0-5.311 0c-.23-.523-.473-1.025-.694-1.458a.074.074 0 0 0-.079-.037 19.791 19.791 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.027c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.119.098.243.196.371.292a.077.077 0 0 1-.006.128 12.607 12.607 0 0 1-1.873.892.076.076 0 0 0-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.897 19.897 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);



interface CourseCardProps {
  title: string;
  date: string;
  progress: number;
  image: string;
  id: string;
  links?: SocialLink[];
}

const iconMap: Record<SocialLinkType, React.ReactNode> = {
  discord: <DiscordIcon className="w-4 h-4" />,
  github: <Github className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
  other: <MessageCircle className="w-4 h-4" />,
};

const colorMap: Record<SocialLinkType, string> = {
  discord:
    "text-[#5865F2] bg-[#5865F2]/10 border-[#5865F2]/20 hover:bg-[#5865F2]/20",
  github: "text-white bg-white/10 border-white/20 hover:bg-white/20",
  youtube: "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
  website:
    "text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20",
  other: "text-gray-400 bg-gray-400/10 border-gray-400/20 hover:bg-gray-400/20",
};

const CourseCard = ({
  title,
  date,
  progress,
  image,
  id,
  links = [],
}: CourseCardProps) => {
  return (
    <Link
      href={`/classroom/batch/${id}`}
      className="flex flex-col sm:flex-row w-full bg-[#1e1e1e] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden group transition-all duration-300 mb-5 relative"
    >
      {/* Image Section */}
      <div className="relative w-full sm:w-[320px] h-[200px] sm:h-auto shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={title}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          fill
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-[#1e1e1e]/80" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
            <div
              className={`w-2 h-2 rounded-full ${
                progress === 100
                  ? "bg-green-700"
                  : progress < 50
                    ? "bg-green-600"
                    : "bg-green-400"
              } animate-pulse`}
            />
            <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
              {progress === 100 ? "Completed" : "Active Batch"}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between gap-6 relative">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h2>
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/40">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Started {date}</span>
            </div>

            {/* Desktop Link Icons - Small badges */}
            <div className="hidden sm:flex items-center gap-2">
              {links.map((link, i) => (
                <div
                  key={i}
                  className={`p-1.5 rounded-full border ${colorMap[link.type] || colorMap.other}`}
                  title={link.type}
                >
                  {iconMap[link.type] || iconMap.other}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          {/* Progress Bar */}
          <div className="flex flex-col gap-2 group/progress">
            <div className="flex justify-between items-end text-xs font-medium">
              <div className="flex items-center gap-1.5 text-white/60">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Course Progress</span>
              </div>
              <span className="text-white group-hover/progress:text-primary transition-colors">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out group-hover:shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-all w-full sm:w-auto text-center group/btn shadow-lg shadow-white/5 hover:shadow-white/10 hover:scale-[1.02]">
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Learning</span>
            </div>

            {/* Mobile Links - Expanded buttons */}
            <div className="sm:hidden flex flex-wrap gap-2 w-full">
              {links.map((link, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to link.url
                    window.open(link.url, "_blank");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm border transition-all hover:scale-[1.02] ${colorMap[link.type] || colorMap.other}`}
                >
                  {iconMap[link.type] || iconMap.other}
                  <span className="capitalize">{link.type}</span>
                </button>
              ))}
            </div>

            {/* Desktop Links- Secondary Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {links.map((link, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(link.url, "_blank");
                  }}
                  className={`flex items-center justify-center p-3 rounded-xl border transition-all hover:scale-[1.05] ${colorMap[link.type] || colorMap.other}`}
                  title={`Open ${link.type}`}
                >
                  {iconMap[link.type] || iconMap.other}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
