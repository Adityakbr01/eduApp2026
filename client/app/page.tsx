import HomePage from "@/components/pages/homePage";
import APP_info from "@/constants/app_info";

export const metadata = {
  title: `${APP_info.NAME}`,
  description: "Admin dashboard for managing the application.",
};


function Page() {
  return (
    <div className="min-h-screen min-w-screen h-screen">
      <HomePage />
    </div>
  );
}

export default Page;