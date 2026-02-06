import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#BF532B1A] rounded-[20px] p-6 sm:p-8 min-h-[600px] animate-pulse relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#BF532B]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 mb-10 relative z-10">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72 opacity-60" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="space-y-12 relative z-10">

        {/* Profile Photo Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-[30px] h-[30px] rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <Skeleton className="w-32 h-32 rounded-2xl" />

            {/* Text */}
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-72 opacity-50" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-[30px] h-[30px] rounded-lg" />
            <Skeleton className="h-5 w-48" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 opacity-60" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            ))}

            {/* Date */}
            <div className="space-y-2 sm:col-span-2">
              <Skeleton className="h-4 w-32 opacity-60" />
              <Skeleton className="h-12 rounded-xl" />
            </div>

            {/* Bio */}
            <div className="space-y-2 sm:col-span-2">
              <Skeleton className="h-4 w-20 opacity-60" />
              <Skeleton className="h-[120px] rounded-xl" />
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-[30px] h-[30px] rounded-lg" />
            <Skeleton className="h-5 w-56" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`space-y-2 ${i === 2 ? "sm:col-span-2" : ""}`}
              >
                <Skeleton className="h-4 w-24 opacity-60" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
