"use client";
import LessonDetailPage from "@/components/pages/classroom/batch/lesson/LessonDetailPage";
import { useParams, useRouter } from "next/navigation";

function page() {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.batchId as string;
  const lessonId = params?.lessonId as string;

  console.log(batchId, lessonId);

  return <LessonDetailPage batchId={batchId} lessonId={lessonId} />;
}

export default page;
