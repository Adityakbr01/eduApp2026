

import HomePage2 from "@/components/pages/HomePage2";
import APP_info from "@/constants/app_info";

export const metadata = {
  title: `${APP_info.NAME}`,
  description: "Admin dashboard for managing the application.",
};


function Page() {
  return (
    <div className="min-h-screen min-w-screen h-[300vh]">
      <HomePage2 />
    </div>
  );
}

export default Page;