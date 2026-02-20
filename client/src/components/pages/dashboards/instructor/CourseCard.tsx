import { ICourse, CourseStatus } from "@/services/courses";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { statusConfig } from "./utils";
import { getS3PublicUrl } from "@/app/(routes)/dashboard/Instructor/courses/create/getS3PublicUrl";
import { TrafficLightDots } from "@/components/TrafficLightDots";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: ICourse;
  submitCourseRequest: (
    id: string,
    type: CourseStatus.PUBLISHED | CourseStatus.UNPUBLISHED,
  ) => void;
  onDelete?: (id: string) => void;
}

export function CourseCard({
  course,
  submitCourseRequest,
  onDelete,
}: CourseCardProps) {
  const status =
    statusConfig[course.status] || statusConfig[CourseStatus.DRAFT];

  // ✅ Convert S3 key → Public URL
  const coverImageUrl = getS3PublicUrl(course.thumbnail?.key || "");

  // Get category name
  const categoryName =
    typeof course.category === "object" ? course.category.name : "";

  // Calculate discount percentage
  const hasDiscount =
    course.pricing?.discountPercentage &&
    course.pricing?.discountExpiresAt &&
    new Date(course.pricing.discountExpiresAt).getTime() > Date.now();

  const discountPercent = hasDiscount ? course.pricing?.discountPercentage : 0;

  // Calculate original price if there's a discount
  const currentPrice = course.pricing?.price || 0;
  const originalPrice =
    hasDiscount && discountPercent
      ? Math.round(currentPrice / (1 - discountPercent / 100))
      : null;

  // Additional tags from course or fallback to valid ones
  const tags = [categoryName, course.level, course.language]
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div
      className="hover:-translate-y-3 duration-400 transition-transform p-4 px-5 sm:p-5 sm:px-8 rounded-xl border border-[#4E4A48] relative group"
      style={{
        boxShadow:
          "rgba(255, 255, 255, 0.1) 0px 33.35px 67.61px 0px inset, rgba(0, 0, 0, 0.05) 0px 3.61px 6.31px 0px, rgba(0, 0, 0, 0.1) 0px 3.61px 3.61px 0px, rgba(0, 0, 0, 0.05) 0px 3.61px 3.61px 0px",
        backdropFilter: "blur(18.0293px)",
        willChange: "transform",
        contain: "layout style paint",
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Traffic Light Dots & Actions */}
          <div className="mb-4 sm:mb-5 flex items-center justify-between">
            <TrafficLightDots />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/Instructor/courses/${course._id}/edit`}
                  >
                    <Edit className="size-4 mr-2" />
                    Edit Course
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/Instructor/courses/${course._id}/curriculum`}
                  >
                    <BookOpen className="size-4 mr-2" />
                    Manage Curriculum
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {course.status === CourseStatus.DRAFT ||
                course.status === CourseStatus.REJECTED ? (
                  <DropdownMenuItem
                    onClick={() =>
                      submitCourseRequest(course._id, CourseStatus.PUBLISHED)
                    }
                  >
                    <Eye className="size-4 mr-2" />
                    Submit for Review
                  </DropdownMenuItem>
                ) : course.status === CourseStatus.PUBLISHED ? (
                  <DropdownMenuItem
                    onClick={() =>
                      submitCourseRequest(course._id, CourseStatus.UNPUBLISHED)
                    }
                  >
                    <EyeOff className="size-4 mr-2" />
                    Request Unpublish
                  </DropdownMenuItem>
                ) : course.status === CourseStatus.PENDING_REVIEW ? (
                  <DropdownMenuItem disabled>
                    <Clock className="size-4 mr-2" />
                    Pending Approval
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(course._id)}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image Container */}
          <div className="relative">
            {/* Status Badge */}
            <h1
              className={`flex items-center gap-1.5 sm:gap-2 w-max px-2 sm:px-3 py-0.5 rounded-md absolute right-2 sm:right-4 border-white shadow border-[0.67px] top-2 sm:top-4 uppercase font-manrope font-semibold text-sm sm:text-xs z-10 ${status.className} bg-white`}
            >
              <span
                className={`h-1.5 sm:h-2 block rounded-full aspect-square ${status.variant === "default" ? "bg-green-500" : status.variant === "destructive" ? "bg-red-500" : "bg-yellow-500"}`}
              />
              {status.label}
            </h1>

            {/* Course Image */}
            <div className="relative w-full h-48 sm:h-56 md:h-68 rounded-xl overflow-hidden bg-muted">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={course.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 400px"
                  className="object-cover object-top transition-all duration-300 ease-in-out hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a]">
                  <BookOpen className="size-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Tags & Title */}
          <div className="mt-3 sm:mt-4">
            <div className="mb-2 mt-4 sm:mt-6 flex gap-2 sm:gap-3 flex-wrap">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="border-[0.52px] font-manrope bg-[#130f0f] border-[#A7A5A5]/80 text-white/80 font-light px-3 sm:px-4 text-xs sm:text-sm py-0.5 sm:py-1 rounded-full inline-block capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="mt-2 sm:mt-3 font-manrope font-medium text-xl sm:text-2xl tracking-[0.5px] sm:tracking-[1px] w-full leading-7 sm:leading-9 line-clamp-2"
              title={course.title}
            >
              {course.title}
            </div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2 flex items-baseline font-manrope font-normal">
              {course.pricing?.isFree ? (
                <span className="text-(--custom-accentColor)">Free</span>
              ) : (
                <>
                  <span className="text-sm mr-1 font-light text-muted-foreground">
                    Price
                  </span>
                  <span className="text-(--custom-accentColor)">
                    {course.pricing?.currency === "INR"
                      ? "Rs."
                      : course.pricing?.currency}
                    {currentPrice.toFixed(0)}
                  </span>
                  {originalPrice && (
                    <span className="text-muted-foreground text-xs sm:text-sm line-through ml-2">
                      {course.pricing?.currency === "INR"
                        ? "Rs."
                        : course.pricing?.currency}
                      {originalPrice}
                    </span>
                  )}
                </>
              )}
            </div>

            {discountPercent ? (
              <div className="text-xs sm:text-sm px-2 py-px bg-white rounded text-black font-medium">
                {discountPercent}% OFF
              </div>
            ) : null}
          </div>

          {/* Manage Button */}
          <Link
            href={`/dashboard/Instructor/courses/${course._id}/edit`}
            className="block w-max"
          >
            <button className="bg-black group hover:bg-linear-to-r hover:from-(--custom-accentColor) to-(--custom-accentColor)/50 border my-1 mt-3 sm:mt-4 py-2 sm:py-3 px-4 sm:px-6 border-[#4E4A48] rounded-xl sm:rounded-2xl transition-all duration-300">
              <div className="relative overflow-hidden cursor-pointer group text-sm sm:text-lg w-fit text-white">
                <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                  Manage Course <span className="ml-1 sm:ml-2">→</span>
                </div>
                <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                  Manage Course <span className="ml-1 sm:ml-2">→</span>
                </div>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
