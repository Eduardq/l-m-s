import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import getCourseById from "@/sanity/lib/courses/getCourseById";

import { checkCourseAccess } from "@/lib/auth";
import { getCourseProgress } from "@/sanity/lib/courses/getCourseProgress";
import { Sidebar } from "@/components/Sidebar";

interface DashboarViewProps {
  children: React.ReactNode;
  params: Promise<{
    courseId: string;
  }>;
}

export default async function DashboardViewLayout({
  children,
  params,
}: DashboarViewProps) {
  const user = await currentUser();
  const { courseId } = await params;

  if (!user?.id) {
    return redirect("/");
  }

  const authResult = await checkCourseAccess(user?.id || null, courseId);
  if (!authResult.isAuthorized || !user?.id) {
    return redirect(authResult.redirect!);
  }

  const [course, progress] = await Promise.all([
    getCourseById(courseId),
    getCourseProgress(user.id, courseId),
  ]);

  if (!course) {
    return redirect("/my-courses");
  }

  return (
    <div className="h-full">
      <Sidebar course={course} completedLessons={progress.completedLessons} />
      <main className="h-full lg:pt-[64px] pl-20 lg:pl-96">{children}</main>
    </div>
  );
}
