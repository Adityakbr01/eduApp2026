import LessonDetailFooter from "@/components/Batch/Contents/LessonDetailFooter";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <LessonDetailFooter />
    </div>
  );
}

export default Layout;
