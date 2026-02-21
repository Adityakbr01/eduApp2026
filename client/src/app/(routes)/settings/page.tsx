import SettingsPage from "@/features/settings/pages/page";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account preferences and notification settings",
};

function page() {
  return <SettingsPage />;
}

export default page;
