"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, CheckCircle, AlertCircle, Lock } from "lucide-react";

interface ModuleItem {
  id: string;
  title: string;
  type: "video" | "locked";
  completed?: boolean;
  overdue?: boolean;
  daysLate?: number;
  penalty?: number;
  deadline?: string;
  start?: string;
}

interface Module {
  id: string;
  title: string;
  completed: boolean;
  items: ModuleItem[];
}

interface BatchModulesProps {
  modules: Module[];
}

const BatchModules = ({ modules }: BatchModulesProps) => {
  const [activeTab, setActiveTab] = useState<"modules" | "announcements">(
    "modules",
  );
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : [],
  );

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-dark-card border border-white/5 rounded-2xl overflow-hidden relative">
      {/* Tabs Header */}
      <div
        className="
    flex items-center md:justify-start justify-center
    gap-1 md:gap-3
    border-b border-white/5
    bg-dark-extra-light
    px-2 sm:px-6
    h-14 sm:h-16
    shrink-0
  "
      >
        {/* Modules */}
        <button
          onClick={() => setActiveTab("modules")}
          className={`
      flex items-center gap-1.5 sm:gap-2
      px-2.5 sm:px-4
      py-1.5 sm:py-2
      rounded-lg
      text-[11px] sm:text-sm
      font-medium
      transition-all
      whitespace-nowrap
      ${
        activeTab === "modules"
          ? "text-primary bg-primary/10"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }
    `}
        >
          <svg
            width="14"
            height="16"
            viewBox="0 0 15 18"
            fill="none"
            className="stroke-current shrink-0"
          >
            <path
              d="M7.4735 8.9059L14.1289 4.80067M7.4735 8.9059L0.828125 4.80067M7.4735 8.9059V16.3895M14.1289 4.80067L7.4735 1.29688L0.828125 4.80067M14.1289 4.80067L14.1289 12.5389L7.4735 16.3895M0.828125 4.80067V12.5389L7.4735 16.3895"
              strokeWidth="1.5"
            />
          </svg>

          <span className="">All Modules</span>
        </button>

        {/* Announcements */}
        <button
          onClick={() => setActiveTab("announcements")}
          className={`
      flex items-center gap-1.5 sm:gap-2
      px-2.5 sm:px-4
      py-1.5 sm:py-2
      rounded-lg
      text-[11px] sm:text-sm
      font-medium
      transition-all
      whitespace-nowrap
      ${
        activeTab === "announcements"
          ? "text-primary bg-primary/10"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }
    `}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="">Announcements</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "modules" && (
          <div className="flex flex-col pb-20">
            {/* Live Class Static Item */}
            <div className="flex justify-between items-center px-6 py-6 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
              <h1 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                Live Class
              </h1>
              <button
                disabled
                className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold uppercase tracking-wider opacity-50 cursor-not-allowed"
              >
                Join Live
              </button>
            </div>

            {/* Modules Accordion */}
            {modules.map((module) => (
              <div
                key={module.id}
                className="border-b border-white/5 bg-[#171717]"
              >
                {/* Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex justify-between items-center px-6 py-5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-white/90">
                      {module.title}
                    </span>
                    {module.completed && (
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wide">
                        Completed
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedModules.includes(module.id) ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Content (Animated) */}
                <AnimatePresence initial={false}>
                  {expandedModules.includes(module.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden bg-dark-card"
                    >
                      <div className="flex flex-col gap-1 p-4 pt-0">
                        {module.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex gap-4 p-3 rounded-xl transition-all ${item.type === "locked" ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5 cursor-pointer group"}`}
                          >
                            {/* Icon State */}
                            <div className="mt-1 shrink-0">
                              {item.type === "locked" ? (
                                <div className="w-5 h-5 rounded-full border border-white/20 grid place-items-center">
                                  <div className="w-2 h-2 rounded-full bg-white/20" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-emerald-500/50 bg-emerald-500/10 grid place-items-center">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white/90 group-hover:text-primary transition-colors line-clamp-1">
                                {item.title}
                              </h4>

                              {item.overdue && (
                                <p className="text-xs text-red-400 font-medium">
                                  Overdue: {item.daysLate} days late -{" "}
                                  {item.penalty}% Penalty
                                </p>
                              )}
                              {item.deadline && (
                                <p className="text-xs text-white/40">
                                  Deadline: {item.deadline}
                                </p>
                              )}
                              {item.start && (
                                <p className="text-xs text-white/40">
                                  Start: {item.start}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {!module.completed && (
                          <div className="flex justify-end p-2">
                            <button className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]">
                              Resume Learning
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="flex flex-col items-center justify-center h-48 text-white/30 text-sm">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            No new announcements
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchModules;
