import { Module } from "@/services/classroom";

const getStatusBadge = (
  section: Module,
  isCompleted: boolean,
  completedItems: number,
  totalItems: number,
) => {
  if (section.isLocked) return null;
  if (isCompleted) {
    return (
      <span className="inline-flex items-center justify-center text-[11px] font-semibold px-2.5 py-1 rounded-md bg-(--custom-successColor)/15 text-(--custom-successColor) border border-(--custom-successColor)/30 ml-3 whitespace-nowrap">
        Completed
      </span>
    );
  }
  if (completedItems > 0 && completedItems < totalItems) {
    return (
      <span className="inline-flex items-center justify-center text-[11px]  font-semibold px-2.5 py-1 rounded-md bg-(--custom-accentColor) text-white border border-primary/30 ml-3 whitespace-nowrap">
        In Progress
      </span>
    );
  }
  return null;
};

export default getStatusBadge;
