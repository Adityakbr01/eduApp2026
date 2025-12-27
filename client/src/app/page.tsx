import HomePage from "@/components/pages/Home/HomePage";
import APP_INFO from "@/lib/constants/APP_INFO";

export const metadata = {
  title: `${APP_INFO.NAME}`,
  description: "Admin dashboard for managing the application.",
};


export default function Page() {

  return (
    <div className="min-h-screen min-w-screen h-screen">
      <HomePage />
    </div>
  );
}
