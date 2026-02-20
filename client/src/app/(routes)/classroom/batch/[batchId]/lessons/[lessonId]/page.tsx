"use client";
import LessonDetailPage from "@/features/batch/Contents/LessonDetailPage";
import { useParams } from "next/navigation";

function page() {
  const params = useParams();
  const batchId = params?.batchId as string;
  const lessonId = params?.lessonId as string;
  return <LessonDetailPage batchId={batchId} lessonId={lessonId} />;
}

export default page;
