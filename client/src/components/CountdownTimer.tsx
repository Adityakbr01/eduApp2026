"use client";

import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FlipNumbers from "react-flip-numbers";

interface CountdownTimerProps {
    targetDate: string | Date;
    variant?: "flip";
    showIcon?: boolean;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function getTimeLeft(target: Date): TimeLeft | null {
    const diff = target.getTime() - Date.now();

    if (diff <= 0) return null;

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export default function CountdownTimer({
    targetDate,
    showIcon = false,
}: CountdownTimerProps) {
    const target = useMemo(() => new Date(targetDate), [targetDate]);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
        getTimeLeft(target)
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(target));
        }, 1000);

        return () => clearInterval(timer);
    }, [target]);

    if (!timeLeft) {
        return (
            <div className="text-sm font-medium text-red-600">
                ⏰ Offer expired
            </div>
        );
    }

    const renderBlock = (value: number, label: string) => (
        <div className="flex flex-col items-center justify-center">
            <FlipNumbers
                height={24}
                width={16}
                play
                duration={0.6}
                numbers={String(value).padStart(2, "0")}
                color="currentColor"
            />

            <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
        </div>
    );

    return (
        <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
            {showIcon && <Clock className="h-4 w-4" />}

            <div className="flex items-center gap-2">
                {timeLeft.days > 0 && renderBlock(timeLeft.days, "Days")}
                {renderBlock(timeLeft.hours, "Hrs")}
                {renderBlock(timeLeft.minutes, "Min")}
                {renderBlock(timeLeft.seconds, "Sec")}
            </div>
        </div>
    );
}
