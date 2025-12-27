import HomePage from "@/components/pages/Home/HomePage";
import APP_info from "@/lib/constants/app_info";
export const metadata = {
  title: `${APP_info.NAME}`,
  description: "Admin dashboard for managing the application.",
};


export default function Page() {

  return (
    <div className="min-h-screen min-w-screen h-screen">
      <HomePage />
    </div>
  );
}
