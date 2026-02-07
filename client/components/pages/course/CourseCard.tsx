"use client";

import Image from "next/image";
import Link from "next/link";

import { ICourse } from "@/services/courses";
import { getS3PublicUrl } from "@/app/(routes)/dashboard/Instructor/courses/create/getS3PublicUrl";
import { TrafficLightDots } from "@/components/TrafficLightDots";


function CourseCard({ course }: { course: ICourse }) {
    // Get category name
    const categoryName =
        typeof course.category === "object" ? course.category.name : "";

    // Convert S3 key → public URL
    const coverImageUrl = getS3PublicUrl(course.thumbnail?.key || "");

    // Calculate discount percentage
    const hasDiscount = course.pricing?.discountPercentage &&
        course.pricing?.discountExpiresAt &&
        new Date(course.pricing.discountExpiresAt).getTime() > Date.now();

    const discountPercent = hasDiscount ? course.pricing?.discountPercentage : 0;

    // Calculate original price if there's a discount
    const currentPrice = course.pricing?.price || 0;
    const originalPrice = hasDiscount && discountPercent
        ? Math.round(currentPrice / (1 - discountPercent / 100))
        : null;

    // Check if course is live (you can adjust this based on your data model)
    const isLive = course.deliveryMode === "live" || course.deliveryMode === "Live";

    // Get tags from course
    const tags = course.tags?.slice(0, 3) || (categoryName ? [categoryName] : []);

    return (
        <div
            className="hover:-translate-y-3 duration-400 transition-transform p-4 px-5 sm:p-5 sm:px-8 rounded-xl border border-[#4E4A48]"
            style={{
                boxShadow: "rgba(255, 255, 255, 0.1) 0px 33.35px 67.61px 0px inset, rgba(0, 0, 0, 0.05) 0px 3.61px 6.31px 0px, rgba(0, 0, 0, 0.1) 0px 3.61px 3.61px 0px, rgba(0, 0, 0, 0.05) 0px 3.61px 3.61px 0px",
                backdropFilter: "blur(18.0293px)",
                willChange: "transform",
                contain: "layout style paint",
            }}
        >
            <Link
                href={`/course/${course.slug || course._id}`}
                className="flex flex-col h-full justify-between"
            >
                <div>
                    {/* Traffic Light Dots */}
                    <div className="mb-4 sm:mb-5">
                        <TrafficLightDots />
                    </div>

                    {/* Image Container */}
                    <div className="relative">
                        {/* Live Badge */}
                        {isLive && (
                            <h1 className="bg-white text-[#FF2222] flex items-center gap-1.5 sm:gap-2 w-max px-2 sm:px-3 py-0.5 rounded-md absolute right-2 sm:right-4 border-white shadow border-[0.67px] top-2 sm:top-4 uppercase font-manrope font-semibold text-sm sm:text-xl z-10">
                                <span className="h-1.5 sm:h-2 block rounded-full aspect-square bg-[#FF2222] animate-pulse" />
                                live
                            </h1>
                        )}

                        {/* Course Image */}
                        <div className="relative w-full h-48 sm:h-56 md:h-68 rounded-xl overflow-hidden">
                            {coverImageUrl ? (
                                <Image
                                    src={coverImageUrl}
                                    alt={course.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 400px"
                                    className="object-cover object-top transition-all duration-300 ease-in-out"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                                    <span className="text-muted-foreground">No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags & Title */}
                    <div className="mt-3 sm:mt-4">
                        <div className="mb-2 mt-4 sm:mt-6 flex gap-2 sm:gap-3 flex-wrap">
                            {tags.map((tag, index) => (
                                <h1
                                    key={index}
                                    className="border-[0.52px] font-manrope bg-[#130f0f] border-[#A7A5A5]/80 text-white/80 font-light px-3 sm:px-4 text-sm sm:text-[1rem] py-0.5 sm:py-1 rounded-full inline-block"
                                >
                                    {tag}
                                </h1>
                            ))}
                        </div>

                        <div className="mt-2 sm:mt-3 font-manrope font-medium text-xl sm:text-2xl md:text-3xl tracking-[0.5px] sm:tracking-[1px] w-full sm:w-[90%] leading-7 sm:leading-10">
                            {course.title}
                        </div>
                    </div>
                </div>

                {/* Price & CTA */}
                <div className="mt-4 sm:mt-6">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2 flex items-baseline font-manrope font-normal">
                            {course.pricing?.isFree ? (
                                <span className="text-(--custom-accentColor)">Free</span>
                            ) : (
                                <>
                                    Price{" "}
                                    <span className="text-(--custom-accentColor) ml-1">
                                        {course.pricing?.currency === "INR" ? "Rs." : course.pricing?.currency}
                                        {currentPrice.toFixed(0)}
                                    </span>
                                    {originalPrice && (
                                        <span className="text-grey-400 text-xs sm:text-base line-through ml-1">
                                            {course.pricing?.currency === "INR" ? "Rs." : course.pricing?.currency}
                                            {originalPrice}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {discountPercent ? (
                            <div className="text-xs sm:text-sm px-2 py-px bg-white rounded text-black">
                                {discountPercent}% OFF
                            </div>
                        ) : null}
                    </div>

                    {/* CTA Button */}
                    <button className="bg-black group hover:bg-linear-to-r hover:from-(--custom-accentColor) to-(--custom-accentColor)/50 border my-1 mt-3 sm:mt-4 py-2 sm:py-3 px-4 sm:px-6 border-[#4E4A48] rounded-xl sm:rounded-2xl w-max">
                        <div className="relative  overflow-hidden cursor-pointer group text-sm sm:text-lg w-fit">
                            <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                                Check Course <span className="ml-1 sm:ml-2">→</span>
                            </div>
                            <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                                Check Course <span className="ml-1 sm:ml-2">→</span>
                            </div>
                        </div>
                    </button>
                </div>
            </Link>
        </div>
    );
}

export default CourseCard;
