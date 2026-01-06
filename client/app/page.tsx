

import HomePage from "@/components/pages/HomePage";
import APP_info from "@/constants/app_info";
import FakeUploaderTest from "@/lib/s3/FakeUploaderTest";

export const metadata = {
  title: `${APP_info.NAME}`,
  description: "Admin dashboard for managing the application.",
};


function Page() {
  return (
    <div className="min-h-screen min-w-screen h-screen">
      <FakeUploaderTest />
      <HomePage />
    </div>
  );
}

export default Page;