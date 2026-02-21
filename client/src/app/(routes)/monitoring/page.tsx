import MonitoringPage from "@/features/monitoring/pages/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring",
  description: "Monitoring",
};
function page() {
  return (
    <div>
      <MonitoringPage />
    </div>
  );
}

export default page;
