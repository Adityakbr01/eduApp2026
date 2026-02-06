"use client";

import { Calendar, BookOpen, SquarePen, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Batch {
  id: string;
  title: string;
  image: string;
  batchCode: string;
  startDate: string;
  status: "paid" | "free" | "enrolled";
}

interface ProfileBatchesTabProps {
  onEdit: () => void;
  onLogout: () => void;
}

// Mock data - replace with actual data from API
const mockBatches: Batch[] = [
  {
    id: "1",
    title: "2.0 Job Ready AI Powered Cohort",
    image:
      "https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621",
    batchCode: "2J-01",
    startDate: "Sep 15, 2025",
    status: "paid",
  },
];

export default function ProfileBatchesTab({
  onEdit,
  onLogout,
}: ProfileBatchesTabProps) {
  return (
    <div className="bg-[#111111] border border-[#BF532B1A] rounded-[20px] p-6 sm:p-8 h-full min-h-[600px] shadow-[0_0_50px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BF532B]/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 relative z-10 w-full">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-manrope font-medium text-white mb-2 tracking-tight">
            Your Batches
          </h1>
          <p className="text-white/40 text-[13px] font-manrope font-light tracking-wide">
            View your enrolled and purchased batches
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-white/10 text-white/90 rounded-xl transition-all text-xs font-manrope font-medium tracking-wide group"
          >
            <SquarePen
              size={14}
              className="text-white/50 group-hover:text-white transition-colors"
            />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1F120D] hover:bg-[#2A1810] border border-[#BF532B]/30 text-[#BF532B] rounded-xl transition-all text-xs font-manrope font-bold"
          >
            <LogOut size={14} strokeWidth={2.5} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 relative z-10 pb-4">
        {mockBatches.length > 0 ? (
          mockBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
            <div className="w-[60px] h-[60px] rounded-[20px] bg-[#BF532B]/10 border border-[#BF532B]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_-10px_rgba(191,83,43,0.2)]">
              <BookOpen size={24} className="text-[#BF532B]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-manrope font-bold text-white mb-2">
              No batches yet
            </h3>
            <p className="text-white/40 text-sm font-manrope max-w-sm mb-8 leading-relaxed">
              You haven&apos;t enrolled in any batches yet. Explore our courses
              and start your learning journey!
            </p>
            <Link
              href="/courses"
              className="px-8 py-3 bg-[#BF532B] hover:bg-[#A64522] text-white font-manrope font-bold text-sm rounded-xl transition-all shadow-[0_4px_12px_rgba(191,83,43,0.3)]"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function BatchCard({ batch }: { batch: Batch }) {
  const getStatusBadge = (status: Batch["status"]) => {
    const styles = {
      paid: "bg-[#00C27C] text-black",
      free: "bg-[#3B82F6] text-white",
      enrolled: "bg-[#BF532B] text-white",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-manrope font-bold capitalize whitespace-nowrap flex items-center gap-1.5 ${styles[status]}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-black/40 border-[0.5px] border-black/20" />
        {status}
      </span>
    );
  };

  return (
    <div className="group bg-[#0A0A0A] border border-white/5 rounded-[20px] p-4 flex flex-col hover:border-[#BF532B]/30 transition-all duration-300 relative overflow-hidden">
      {/* Image */}
      <div className="relative mb-4 overflow-hidden rounded-xl bg-[#111] aspect-video">
        <Image
          alt={batch.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          src={batch.image}
          width={400}
          height={225}
        />
        <div className="absolute top-3 right-3">{getStatusBadge(batch.status)}</div>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col relative z-10">
        <h4 className="font-manrope font-medium text-white text-[15px] leading-snug line-clamp-2 mb-3 h-[42px]">
          {batch.title}
        </h4>

        <div className="space-y-3 mb-6">
          <div>
            <p className="text-white/30 text-[11px] font-manrope font-medium mb-0.5">
              Batch
            </p>
            <p className="text-[#BF532B] text-[12px] font-manrope font-medium">
              {batch.batchCode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#161616] border border-white/5 flex items-center justify-center text-[#BF532B]">
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-manrope font-medium leading-none mb-1">
                Starts on
              </p>
              <p className="text-white/90 text-[12px] font-manrope font-medium leading-none">
                {batch.startDate}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Link
            href={`/course/${batch.id}`}
            className="w-full py-3 rounded-lg cursor-pointer font-manrope font-bold text-[13px] flex items-center justify-center gap-2 bg-[#BF532B] hover:bg-[#E35B25] text-white transition-all duration-300 group/btn shadow-[0_4px_15px_-4px_rgba(191,83,43,0.3)] hover:shadow-[0_4px_20px_-4px_rgba(191,83,43,0.5)]"
          >
            <BookOpen
              size={16}
              className="transition-transform group-hover/btn:scale-110"
            />
            Go to Course
          </Link>
        </div>
      </div>
    </div>
  );
}
