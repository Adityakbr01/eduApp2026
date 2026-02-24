import StudentLiveStreamPage from "@/features/batch/Contents/components/liveStream/pages/StudentLiveStreamPage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Class | EduApp", //todo add real live Class title
  description: "Live Class",
};

function page() {
  return <StudentLiveStreamPage />;
}

export default page;
