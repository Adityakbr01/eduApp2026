"use client";

import FlipNumbers from "react-flip-numbers";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";
import { Clock, Flame, Timer } from "lucide-react";

/* =========================================================
   Types
========================================================= */
interface CountdownTimerProps {
    targetDate: Date | string | number | null | undefined;
    onExpire?: () => void;
    variant?: "default" | "compact" | "digital" | "badge" | "card" | "flip";
    showIcon?: boolean;
    showLabel?: boolean;
    label?: string;
    urgentLabel?: string;
    expiredLabel?: string;
    className?: string;
}

/* =========================================================
   Main Component
========================================================= */
export function CountdownTimer({
    targetDate,
    onExpire,
    variant = "flip",
    showIcon = true,
    showLabel = true,
    label = "Offer ends in:",
    urgentLabel = "Hurry! Offer ends in:",
    expiredLabel = "Offer expired",
    className,
}: CountdownTimerProps) {
    const countdown = useCountdown(targetDate, { onExpire });

    if (!targetDate) return null;

    if (countdown.isExpired) {
        return (
            <div className={cn("text-sm text-muted-foreground", className)}>
                {expiredLabel}
            </div>
        );
    }

    /* =========================================================
       COMPACT
    ========================================================= */
    if (variant === "compact") {
        return (
            <span
                className={cn(
                    "font-mono text-sm",
                    countdown.isUrgent && "text-red-500 font-semibold",
                    className
                )}
            >
                {countdown.formatted}
            </span>
        );
    }

    /* =========================================================
       DIGITAL
    ========================================================= */
    if (variant === "digital") {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                {showIcon && <Timer className="size-4" />}
                <span
                    className={cn(
                        "font-mono text-lg font-bold tracking-wider",
                        countdown.isUrgent && "text-red-500"
                    )}
                >
                    {countdown.digital}
                </span>
            </div>
        );
    }

    /* =========================================================
       BADGE
    ========================================================= */
    if (variant === "badge") {
        return (
            <div
                className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                    countdown.isUrgent
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    className
                )}
            >
                {showIcon &&
                    (countdown.isUrgent ? (
                        <Flame className="size-3 animate-pulse" />
                    ) : (
                        <Clock className="size-3" />
                    ))}
                <span className="font-mono">{countdown.formatted}</span>
            </div>
        );
    }

    /* =========================================================
       CARD
    ========================================================= */
    if (variant === "card") {
        return (
            <div className={cn("space-y-2", className)}>
                {showLabel && (
                    <p
                        className={cn(
                            "text-sm font-medium flex items-center gap-1.5",
                            countdown.isUrgent && "text-red-500"
                        )}
                    >
                        {countdown.isUrgent && (
                            <Flame className="size-4 animate-pulse" />
                        )}
                        {countdown.isUrgent ? urgentLabel : label}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    {countdown.days > 0 && (
                        <TimeBox value={countdown.days} label="Days" isUrgent={countdown.isUrgent} />
                    )}
                    <TimeBox value={countdown.hours} label="Hours" isUrgent={countdown.isUrgent} />
                    <TimeBox value={countdown.minutes} label="Mins" isUrgent={countdown.isUrgent} />
                    <TimeBox value={countdown.seconds} label="Secs" isUrgent={countdown.isUrgent} />
                </div>
            </div>
        );
    }

    /* =========================================================
       🔥 FLIP / SLIDER (BEST UI)
    ========================================================= */
    if (variant === "flip") {
        return (
            <div className={cn("space-y-2", className)}>
                {showLabel && (
                    <p
                        className={cn(
                            "text-sm font-medium flex items-center gap-1.5",
                            countdown.isUrgent && "text-red-500"
                        )}
                    >
                        {countdown.isUrgent && (
                            <Flame className="size-4 animate-pulse" />
                        )}
                        {countdown.isUrgent ? urgentLabel : label}
                    </p>
                )}

                <div className="flex items-center gap-3">
                    {countdown.days > 0 && (
                        <FlipUnit
                            label="Days"
                            value={countdown.days}
                            isUrgent={countdown.isUrgent}
                        />
                    )}
                    <FlipUnit label="Hours" value={countdown.hours} isUrgent={countdown.isUrgent} />
                    <FlipUnit label="Mins" value={countdown.minutes} isUrgent={countdown.isUrgent} />
                    <FlipUnit label="Secs" value={countdown.seconds} isUrgent={countdown.isUrgent} />
                </div>
            </div>
        );
    }

    /* =========================================================
       DEFAULT
    ========================================================= */
    return (
        <div
            className={cn(
                "flex items-center gap-2 text-sm",
                countdown.isUrgent && "text-red-500",
                className
            )}
        >
            {showIcon &&
                (countdown.isUrgent ? (
                    <Flame className="size-4 animate-pulse" />
                ) : (
                    <Clock className="size-4" />
                ))}
            {showLabel && (
                <span className="text-muted-foreground">
                    {countdown.isUrgent ? urgentLabel : label}
                </span>
            )}
            <span
                className={cn(
                    "font-mono font-medium",
                    countdown.isUrgent && "font-bold"
                )}
            >
                {countdown.formatted}
            </span>
        </div>
    );
}

/* =========================================================
   Flip UI Components
========================================================= */
function FlipUnit({
    value,
    label,
    isUrgent,
}: {
    value: number;
    label: string;
    isUrgent: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-1">
            <FlipDigit value={value} isUrgent={isUrgent} />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
        </div>
    );
}

function FlipDigit({
    value,
    isUrgent,
}: {
    value: number;
    isUrgent: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-xl px-3 py-2 backdrop-blur-md shadow-sm",
                isUrgent
                    ? "bg-red-500/10 ring-1 ring-red-500/40"
                    : "bg-black/5 dark:bg-white/5"
            )}
        >
            <FlipNumbers
                height={36}
                width={24}
                color={isUrgent ? "#ef4444" : "#ffffff"}
                background="transparent"
                play
                perspective={600}
                numbers={value.toString().padStart(2, "0")}
            />
        </div>
    );
}

/* =========================================================
   Card Time Box
========================================================= */
function TimeBox({
    value,
    label,
    isUrgent,
}: {
    value: number;
    label: string;
    isUrgent: boolean;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center min-w-12 p-2 rounded-lg",
                isUrgent
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-muted"
            )}
        >
            <span
                className={cn(
                    "text-lg font-bold font-mono",
                    isUrgent && "text-red-600 dark:text-red-400"
                )}
            >
                {value.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase text-muted-foreground">
                {label}
            </span>
        </div>
    );
}

export default CountdownTimer;
