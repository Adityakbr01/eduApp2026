"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LessonRes } from "@/services/classroom/batch-types";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// ─── SVG Icons ───

const BookOpenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="text-white mt-0.5 shrink-0 transition-all duration-300"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4.48974V19.4897M6.75 7.48974H4.5M7.5 10.4897H4.5M21 15.7397V3.6697C21 2.4697 20.02 1.5797 18.83 1.6797H18.77C16.67 1.8597 13.48 2.9297 11.7 4.0497L11.53 4.1597C11.24 4.3397 10.76 4.3397 10.47 4.1597L10.22 4.0097C8.44 2.8997 5.26 1.8397 3.16 1.6697C1.97 1.5697 1 2.4697 1 3.6597V15.7397C1 16.6997 1.78 17.5997 2.74 17.7197L3.03 17.7597C5.2 18.0497 8.55 19.1497 10.47 20.1997L10.51 20.2197C10.78 20.3697 11.21 20.3697 11.47 20.2197C13.39 19.1597 16.75 18.0497 18.93 17.7597L19.26 17.7197C20.22 17.5997 21 16.6997 21 15.7397Z" />
  </svg>
);

const VideoPlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="shrink-0"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.61364 14.9211V8.07891C8.61378 7.9933 8.63694 7.90931 8.6807 7.83573C8.72446 7.76215 8.78721 7.7017 8.86237 7.66071C8.93752 7.61971 9.02232 7.59969 9.10787 7.60273C9.19342 7.60577 9.27658 7.63177 9.34864 7.678L14.6712 11.0981C14.7386 11.1413 14.794 11.2008 14.8324 11.271C14.8708 11.3412 14.891 11.42 14.891 11.5C14.891 11.58 14.8708 11.6588 14.8324 11.729C14.794 11.7992 14.7386 11.8587 14.6712 11.9019L9.34864 15.323C9.27658 15.3692 9.19342 15.3952 9.10787 15.3982C9.02232 15.4013 8.93752 15.3812 8.86237 15.3402C8.78721 15.2993 8.72446 15.2388 8.6807 15.1652C8.63694 15.0916 8.61378 15.0067 8.61364 14.9211Z" />
    <path d="M0.5 11.5C0.5 5.70114 5.20114 1 11 1C16.7989 1 21.5 5.70114 21.5 11.5C21.5 17.2989 16.7989 22 11 22C5.20114 22 0.5 17.2989 0.5 11.5ZM11 2.43182C8.59497 2.43182 6.28844 3.38721 4.58783 5.08783C2.88721 6.78844 1.93182 9.09497 1.93182 11.5C1.93182 13.905 2.88721 16.2116 4.58783 17.9122C6.28844 19.6128 8.59497 20.5682 11 20.5682C13.405 20.5682 15.7116 19.6128 17.4122 17.9122C19.1128 16.2116 20.0682 13.905 20.0682 11.5C20.0682 9.09497 19.1128 6.78844 17.4122 5.08783C15.7116 3.38721 13.405 2.43182 11 2.43182Z" />
  </svg>
);

const AssignmentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="shrink-0"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15.1079 19.5544L18.0222 16.6589V19.0268H18.9092V15.1527H15.0088V16.034H17.3921L14.4778 18.9295L15.1079 19.5544ZM0.632812 19.4445V1.13281H19.0636V9.79197C18.8616 9.72254 18.6681 9.66608 18.483 9.62259C18.2987 9.57986 18.1082 9.53714 17.9116 9.49441V2.2773H1.78473V18.3001H9.01881C9.04722 18.5137 9.08331 18.7125 9.12709 18.8963C9.17086 19.0795 9.22731 19.2622 9.29642 19.4445H0.632812ZM1.78473 18.3001V2.2773V9.49441V9.40857V18.3001ZM4.66454 15.1756H9.22615C9.26839 14.9795 9.32599 14.7899 9.39894 14.6068L9.62933 14.03H4.66454V15.1756ZM4.66454 10.8609H12.2442C12.6228 10.5969 12.9956 10.3734 13.3627 10.1903C13.7298 10.0064 14.1237 9.86217 14.5446 9.75764V9.71644H4.66454V10.8609ZM4.66454 6.54622H15.0318V5.40174H4.66454V6.54622ZM16.7597 21.8674C15.4765 21.8674 14.3879 21.423 13.494 20.5341C12.5994 19.6452 12.152 18.5633 12.152 17.2883C12.152 16.0134 12.5994 14.9315 13.494 14.0426C14.3887 13.1537 15.4773 12.7096 16.7597 12.7104C18.0422 12.7112 19.1312 13.1552 20.0266 14.0426C20.922 14.9299 21.369 16.0119 21.3674 17.2883C21.3674 18.5625 20.9205 19.6441 20.0266 20.533C19.1312 21.4218 18.0422 21.8674 16.7597 21.8674Z" />
  </svg>
);

const QuizIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="shrink-0"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ─── Content Type Icon Helper ───
const ContentIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "video":
      return <VideoPlayIcon />;
    case "assignment":
      return <AssignmentIcon />;
    case "quiz":
      return <QuizIcon />;
    default:
      return <VideoPlayIcon />;
  }
};

// ─── Content List ───
const ContentList = ({
  contents,
  activeContentId,
  onContentSelect,
  variant = "desktop",
  collapsed = false,
}: {
  contents: LessonRes[];
  activeContentId?: string;
  onContentSelect?: (content: LessonRes) => void;
  variant?: "desktop" | "mobile";
  collapsed?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-dark-extra-light rounded-lg mt-2">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-4 py-4 cursor-pointer hover:bg-white/2 transition-all text-left"
        data-tip={collapsed ? "LESSON" : undefined}
        data-tip-dir={collapsed ? "right" : undefined}
      >
        <div className="flex items-center gap-2">
          <BookOpenIcon />
          <span
            className={cn(
              "line-clamp-1 font-apfel-mittel transition-all duration-500 ease-in-out",
              collapsed ? "opacity-0" : "opacity-100",
            )}
          >
            LESSON
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-white/30 transition-all duration-200 shrink-0",
            isExpanded && "rotate-180",
            collapsed && "opacity-0",
          )}
        />
      </button>

      {/* Animated Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col">
              {contents?.map((content) => {
                const isActive = content.id === activeContentId;
                return (
                  <div
                    key={content.id}
                    onClick={() => onContentSelect?.(content)}
                    className={cn(
                      "flex items-center gap-2 hover:bg-dark-light/10 px-4 py-3 cursor-pointer transition-colors",
                      isActive && "bg-dark-light/20 text-white/90",
                    )}
                  >
                    <div
                      className="ps-0.5"
                      data-tip-dir={collapsed ? "right" : undefined}
                      data-tip={collapsed ? content.title : undefined}
                    >
                      <ContentIcon type={content.type} />
                    </div>
                    <div
                      className={`flex justify-between items-center w-full gap-4 transition-all duration-500 ease-in-out ${
                        collapsed ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      <div>
                        <div
                          className={cn(
                            "line-clamp-1 text-lg",
                            variant === "mobile" &&
                              !isActive &&
                              "text-white/40",
                          )}
                        >
                          {content.title}
                        </div>
                        {content.overdue && content.daysLate && (
                          <div className="text-red-500 text-xs font-helvetica line-clamp-1">
                            Overdue: {content.daysLate} days late
                            {content.penalty
                              ? ` - ${content.penalty}% Penalty`
                              : ""}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-mono brightness-125 shrink-0",
                          variant === "mobile" &&
                            !isActive &&
                            "text-white/40 text-[.9rem]",
                        )}
                      >
                        {content.obtainedMarks}/{content.marks}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentList;
