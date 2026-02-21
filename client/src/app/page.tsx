import type { Metadata } from "next";
import HomePage from "@/features/home/pages/HomePage";
import APP_info from "@/constants/app_info";

export const metadata: Metadata = {
  title: `${APP_info.NAME} – Learn, Build & Get Placed`,
  description:
    "Join a growing community of students preparing for real-world tech careers. Master coding with industry-ready courses, mentorship, and placement support at Sheryians.",
  openGraph: {
    title: `${APP_info.NAME} – Learn, Build & Get Placed`,
    description:
      "Transform into the developer recruiters are searching for. Industry-ready courses, 1-on-1 mentorship, and guaranteed placement support.",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen min-w-screen">
      <HomePage />
    </div>
  );
}
