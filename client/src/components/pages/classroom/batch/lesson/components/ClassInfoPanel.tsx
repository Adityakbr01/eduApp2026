"use client";

import StatusIcon from "@/features/batch/Modules/StatusIcon";
import {
  ContentDetailResponse,
  QuizData,
} from "@/services/classroom/batch-types";
import { Play, CheckCircle, Maximize, CheckCheck } from "lucide-react";

// ─── Inline SVG Icons ───

const BookmarkIcon = () => (
  // ... existing svg ...
  <svg
    width="21"
    height="21"
    viewBox="0 0 13 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.8896 1.02539C11.135 1.02539 11.3414 1.09827 11.5342 1.26953L11.6162 1.34961C11.8342 1.57964 11.9398 1.84061 11.9395 2.17383V16.2061L6.7002 13.8369L6.3916 13.6973L6.08203 13.8369L0.84375 16.2061V2.1748C0.84375 1.84045 0.949403 1.5789 1.16699 1.34961C1.35683 1.14969 1.55638 1.05195 1.79102 1.03027L1.89453 1.02539H10.8896Z"
      stroke="#bf532b"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const AiIcon = () => (
  // ... existing svg ...
  <svg
    width="25"
    height="25"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.2357 5.49299H17.2257V3.69522C17.2257 3.5098 17.1521 3.33198 17.0209 3.20086C16.8898 3.06975 16.712 2.99609 16.5266 2.99609H15.428C15.2425 2.99609 15.0647 3.06975 14.9336 3.20086C14.8025 3.33198 14.7288 3.5098 14.7288 3.69522V5.49299H8.71881C7.46543 5.49365 6.26358 5.99184 5.37731 6.87811C4.49104 7.76438 3.99285 8.96623 3.99219 10.2196V13.0361C3.99219 16.1346 5.22307 19.1062 7.41405 21.2972C9.60503 23.4882 12.5766 24.7191 15.6751 24.7191H16.5266C16.712 24.7191 16.8898 24.6454 17.0209 24.5143C17.1521 24.3832 17.2257 24.2053 17.2257 24.0199V22.9213C17.2257 22.7359 17.1521 22.558 17.0209 22.4269C16.8898 22.2958 16.712 22.2222 16.5266 22.2222H15.6751C13.2389 22.2222 10.9023 21.2544 9.17962 19.5316C7.4569 17.8089 6.48908 15.4724 6.48908 13.0361V10.2196C6.48908 9.62824 6.724 9.0611 7.14215 8.64295C7.56031 8.2248 8.12745 7.98988 8.71881 7.98988H23.2357C23.8271 7.98988 24.3942 8.2248 24.8124 8.64295C25.2305 9.0611 25.4655 9.62824 25.4655 10.2196V13.2334C25.4639 13.9184 25.3801 14.6008 25.2158 15.2658C25.1722 15.4372 25.1955 15.6187 25.2808 15.7735C25.3661 15.9284 25.5071 16.045 25.6752 16.0998L26.7239 16.4419C26.8145 16.4719 26.9103 16.483 27.0053 16.4745C27.1004 16.466 27.1927 16.4381 27.2765 16.3924C27.3603 16.3468 27.4339 16.2844 27.4926 16.2091C27.5513 16.1339 27.5939 16.0474 27.6178 15.955C27.8449 15.0655 27.9606 14.1513 27.9624 13.2334V10.2196C27.9617 8.96623 27.4635 7.76438 26.5772 6.87811C25.691 5.99184 24.4891 5.49365 23.2357 5.49299Z"
      fill="white"
    />
    <path
      d="M11.9819 15.9804C13.0851 15.9804 13.9794 15.0861 13.9794 13.9829C13.9794 12.8797 13.0851 11.9854 11.9819 11.9854C10.8787 11.9854 9.98438 12.8797 9.98438 13.9829C9.98438 15.0861 10.8787 15.9804 11.9819 15.9804Z"
      fill="white"
    />
    <path
      d="M19.9741 15.9804C21.0773 15.9804 21.9716 15.0861 21.9716 13.9829C21.9716 12.8797 21.0773 11.9854 19.9741 11.9854C18.8709 11.9854 17.9766 12.8797 17.9766 13.9829C17.9766 15.0861 18.8709 15.9804 19.9741 15.9804Z"
      fill="white"
    />
    <path
      d="M27.8882 23.1705L30.1504 24.0619C30.197 24.0803 30.2369 24.1123 30.2651 24.1537C30.2933 24.1951 30.3083 24.2441 30.3083 24.2941C30.3083 24.3442 30.2933 24.3931 30.2651 24.4345C30.2369 24.476 30.197 24.5079 30.1504 24.5263L27.8882 25.4177C27.4878 25.5761 27.1241 25.8149 26.8196 26.1194C26.5151 26.4239 26.2763 26.7876 26.1179 27.188L25.2265 29.4352C25.2081 29.4818 25.1761 29.5218 25.1347 29.5499C25.0933 29.5781 25.0444 29.5931 24.9943 29.5931C24.9443 29.5931 24.8953 29.5781 24.8539 29.5499C24.8125 29.5218 24.7805 29.4818 24.7621 29.4352L23.8707 27.188C23.7128 26.7873 23.4741 26.4234 23.1696 26.1189C22.865 25.8143 22.5011 25.5757 22.1004 25.4177L19.8532 24.5263C19.8067 24.5079 19.7667 24.476 19.7385 24.4345C19.7104 24.3931 19.6953 24.3442 19.6953 24.2941C19.6953 24.2441 19.7104 24.1951 19.7385 24.1537C19.7667 24.1123 19.8067 24.0803 19.8532 24.0619L22.1004 23.1705C22.5011 23.0126 22.865 22.7739 23.1696 22.4694C23.4741 22.1648 23.7128 21.8009 23.8707 21.4002L24.7621 19.153C24.7805 19.1065 24.8125 19.0665 24.8539 19.0383C24.8953 19.0102 24.9443 18.9951 24.9943 18.9951C25.0444 18.9951 25.0933 19.0102 25.1347 19.0383C25.1761 19.0665 25.2081 19.1065 25.2265 19.153L26.1179 21.4002C26.2763 21.8007 26.5151 22.1644 26.8196 22.4689C27.1241 22.7734 27.4878 23.0122 27.8882 23.1705Z"
      fill="white"
    />
  </svg>
);

const McqIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.8 15.2C13.08 15.2 13.3 15.1 13.5 14.9C13.7 14.7 13.8 14.5 13.8 14.25C13.8 14 13.7 13.8 13.5 13.6C13.3 13.4 13 13.3 12.8 13.3C12.6 13.3 12.35 13.4 12.16 13.6C11.97 13.8 11.87 14 11.87 14.25C11.87 14.5 11.97 14.7 12.16 14.9C12.35 15.1 12.6 15.2 12.8 15.2Z" />
    <path d="M12.3 11.7H13.4C13.4 11.2 13.5 10.9 13.6 10.6C13.7 10.3 14 10 14.5 9.5C15 9 15.4 8.6 15.6 8.3C15.8 7.9 15.9 7.5 15.9 7C15.9 6.2 15.6 5.5 15 5C14.5 4.4 13.7 4.1 12.8 4.1C12.1 4.1 11.5 4.3 11 4.7C10.5 5 10.1 5.5 9.8 6.2L10.8 6.6C11 6.1 11.3 5.8 11.6 5.5C12 5.3 12.4 5.2 12.8 5.2C13.4 5.2 13.9 5.3 14.2 5.7C14.6 6 14.8 6.5 14.8 7C14.8 7.3 14.7 7.6 14.6 7.9C14.4 8.2 14.1 8.6 13.6 9C13.1 9.4 12.7 9.8 12.5 10.2C12.4 10.6 12.3 11.1 12.3 11.7Z" />
    <path d="M6.26 18.2C5.7 18.2 5.2 18 4.8 17.6C4.4 17.2 4.3 16.8 4.3 16.2V3.1C4.3 2.5 4.4 2 4.8 1.7C5.2 1.3 5.7 1.1 6.2 1.1H19.4C19.9 1.1 20.4 1.3 20.8 1.7C21.1 2 21.3 2.5 21.3 3.1V16.2C21.3 16.8 21.1 17.2 20.8 17.6C20.4 18 19.9 18.2 19.4 18.2H6.26ZM6.2 17H19.4C19.6 17 19.7 16.9 19.9 16.7C20 16.6 20.1 16.4 20.1 16.2V3.1C20.1 2.9 20 2.7 19.9 2.6C19.7 2.4 19.6 2.3 19.4 2.3H6.26C6 2.3 5.9 2.4 5.75 2.6C5.6 2.7 5.5 2.9 5.5 3.1V16.2C5.5 16.4 5.6 16.6 5.75 16.7C5.9 16.9 6 17 6.2 17Z" />
  </svg>
);

interface ClassInfoPanelProps {
  contentDetail: ContentDetailResponse | undefined;
  activeContentId: string | null;
  quizState?: {
    currentIndex: number;
    completed: boolean;
    obtainedMarks: number;
  };
}

const ClassInfoPanel = ({
  contentDetail,
  activeContentId,
  quizState,
}: ClassInfoPanelProps) => {
  const isQuiz = contentDetail?.contentType === "quiz";
  const quizData = contentDetail?.assessment?.data as QuizData | undefined;
  const currentQuestion = quizData?.questions?.[quizState?.currentIndex || 0];
  const isCompleted = isQuiz
    ? quizState?.completed
    : contentDetail?.isCompleted;
  return (
    <div className="h-full">
      {/* Maximize btn */}
      {/* Todo add functionality */}
      <div className="h-16 absolute right-5 z-10 flex items-center justify-end">
        <button className="text-amber-300 hover:brightness-150">
          <Maximize size={20} />
        </button>
      </div>

      <div className="bg-dark-card rounded-2xl flex flex-col overflow-y-auto h-full w-full border border-white/5 text-white/80">
        {/* Header */}
        <div className="flex items-center gap-2 pe-12 w-full shadow-md shadow-black/5 h-16 shrink-0 px-6 text-xl text-white/80 bg-dark-extra-light pl-5 pr-5">
          <div className="flex items-center gap-3 text-xl ml-2 text-accent">
            {isQuiz ? (
              <McqIcon />
            ) : (
              <div className="border-2 border-accent rounded-full w-5.5 h-5.5 flex items-center justify-center p-[2px]">
                <Play
                  size={14}
                  className="text-accent ms-0.5"
                  strokeWidth={3}
                />
              </div>
            )}
            <span className="text-white/80 font-medium tracking-wide text-lg sm:text-xl">
              {isQuiz ? "MCQ's" : "Class"}
            </span>
          </div>
          <div className="cursor-pointer pe-8 transition-all text-accent -mt-0.5 hover:scale-105 ms-auto shrink-0">
            <BookmarkIcon />
          </div>
        </div>

        {/* Content Detail */}
        <div className="px-8 py-6 h-full overflow-y-auto">
          {contentDetail ? (
            <div className="flex flex-col gap-5">
              {/* Title + Badges */}
              <div className="flex flex-wrap items-center justify-between gap-5">
                <h1 className="text-2xl sm:text-3xl font-apfel-mittel text-white">
                  {contentDetail.title}
                </h1>
                <div className="flex text-lg py-2 gap-2 text-white/60 w-fit items-center">
                  {isCompleted ? (
                    <>
                      Completed <StatusIcon completed={true} />
                    </>
                  ) : (
                    <span className="text-white/40 text-sm">In Progress</span>
                  )}
                </div>
              </div>

              {isQuiz && quizData && currentQuestion ? (
                // QUIZ SPECIFIC DISPLAY
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-3 py-0.5 rounded-full font-bold tracking-wide text-xs md:text-sm font-helvetica border bg-yellow-500/10 text-yellow-500 border-yellow-500/60 transition-colors">
                      Question {(quizState?.currentIndex || 0) + 1} of{" "}
                      {quizData.questions.length}
                    </div>
                  </div>
                  <p className="text-lg md:text-xl text-white/80 font-helvetica leading-relaxed">
                    {currentQuestion.question}
                  </p>

                  {/* Move general description below the quiz interface if available */}
                  {contentDetail.description && (
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Description
                      </h3>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {contentDetail.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // STANDARD DISPLAY
                <div className="flex flex-col gap-5 mt-6 border-t border-white/5 pt-5">
                  {/* Content type + level badges */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70">
                      {contentDetail.contentType}
                    </span>
                    {contentDetail.level && (
                      <span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {contentDetail.level}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {contentDetail.description && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Description
                      </h3>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {contentDetail.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {contentDetail.tags && contentDetail.tags.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {contentDetail.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full border border-white/10 text-xs text-white/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Links */}
                  <h1 className="text-xl mt-2 font-light text-white">
                    Related Links
                  </h1>
                  {contentDetail.relatedLinks &&
                  contentDetail.relatedLinks.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {contentDetail.relatedLinks.map((link, i) => (
                        <li key={i}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="list-disc" />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-white/30 text-sm mt-10">
              {activeContentId
                ? "Loading details..."
                : "Select content to view details"}
            </div>
          )}
        </div>

        {/* AI Help Button */}
        <button
          className="absolute lg:left-5 bottom-5 right-6 lg:bottom-6 z-9 bg-(--custom-accentColor) text-white rounded-full w-16 h-16 shadow-xl font-bold text-3xl border-none cursor-pointer flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/30 group"
          aria-label="AI Help"
        >
          <span className="sr-only">Ask Ai</span>
          <AiIcon />
          <span className="absolute right-full lg:left-full translate-x-1/2 group-hover:-translate-x-2 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs rounded px-3 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-lg">
            Ai help?
          </span>
        </button>
      </div>
    </div>
  );
};

export default ClassInfoPanel;
