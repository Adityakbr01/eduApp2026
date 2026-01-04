"use client";

import { useState, useEffect, useMemo } from "react";

export interface CountdownTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
}

interface UseCountdownOptions {
    onExpire?: () => void;
    autoStart?: boolean;
}

/**
 * Calculate time remaining from a target date
 */
export function calculateTimeRemaining(targetDate: Date | string | number): CountdownTime {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const difference = target - now;

    if (difference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isExpired: true,
        };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isExpired: false,
    };
}

/**
 * Format countdown time to string
 */
export function formatCountdown(time: CountdownTime, options?: {
    showDays?: boolean;
    showSeconds?: boolean;
    compact?: boolean;
}): string {
    const { showDays = true, showSeconds = true, compact = false } = options || {};

    if (time.isExpired) {
        return "Expired";
    }

    const parts: string[] = [];

    if (showDays && time.days > 0) {
        parts.push(compact ? `${time.days}d` : `${time.days} day${time.days !== 1 ? 's' : ''}`);
    }

    if (time.hours > 0 || time.days > 0) {
        parts.push(compact ? `${time.hours}h` : `${time.hours} hour${time.hours !== 1 ? 's' : ''}`);
    }

    if (time.minutes > 0 || time.hours > 0 || time.days > 0) {
        parts.push(compact ? `${time.minutes}m` : `${time.minutes} min${time.minutes !== 1 ? 's' : ''}`);
    }

    if (showSeconds) {
        parts.push(compact ? `${time.seconds}s` : `${time.seconds} sec${time.seconds !== 1 ? 's' : ''}`);
    }

    return parts.join(compact ? ' ' : ', ');
}

/**
 * Pad a number with leading zeros
 */
export function padZero(num: number, length: number = 2): string {
    return num.toString().padStart(length, '0');
}

/**
 * Format countdown as digital clock style (DD:HH:MM:SS)
 */
export function formatCountdownDigital(time: CountdownTime): string {
    if (time.isExpired) {
        return "00:00:00";
    }

    if (time.days > 0) {
        return `${padZero(time.days)}:${padZero(time.hours)}:${padZero(time.minutes)}:${padZero(time.seconds)}`;
    }

    return `${padZero(time.hours)}:${padZero(time.minutes)}:${padZero(time.seconds)}`;
}

/**
 * Custom hook for countdown timer
 */
export function useCountdown(
    targetDate: Date | string | number | null | undefined,
    options: UseCountdownOptions = {}
): CountdownTime & {
    formatted: string;
    digital: string;
    isUrgent: boolean;
} {
    const { onExpire, autoStart = true } = options;

    const [timeRemaining, setTimeRemaining] = useState<CountdownTime>(() => {
        if (!targetDate) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
        }
        return calculateTimeRemaining(targetDate);
    });

    const [hasExpired, setHasExpired] = useState(false);

    useEffect(() => {
        if (!targetDate || !autoStart) {
            return;
        }

        const updateCountdown = () => {
            const remaining = calculateTimeRemaining(targetDate);
            setTimeRemaining(remaining);

            if (remaining.isExpired && !hasExpired) {
                setHasExpired(true);
                onExpire?.();
            }
        };

        // Initial update
        updateCountdown();

        // Update every second
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [targetDate, autoStart, onExpire, hasExpired]);

    // Memoize formatted strings
    const formatted = useMemo(() => formatCountdown(timeRemaining, { compact: true }), [timeRemaining]);
    const digital = useMemo(() => formatCountdownDigital(timeRemaining), [timeRemaining]);

    // Is urgent when less than 24 hours remaining
    const isUrgent = useMemo(() => {
        return !timeRemaining.isExpired && timeRemaining.days === 0 && timeRemaining.totalSeconds > 0;
    }, [timeRemaining]);

    return {
        ...timeRemaining,
        formatted,
        digital,
        isUrgent,
    };
}

/**
 * Check if a discount is currently active
 */
export function isDiscountActive(
    discountPercentage?: number,
    discountExpiresAt?: string | Date | null
): boolean {
    if (!discountPercentage || discountPercentage <= 0) {
        return false;
    }

    if (!discountExpiresAt) {
        // No expiry date means discount is always active
        return true;
    }

    return new Date(discountExpiresAt) > new Date();
}

/**
 * Get discount status with countdown info
 */
export function getDiscountStatus(
    discountPercentage?: number,
    discountExpiresAt?: string | Date | null
): {
    isActive: boolean;
    hasExpiry: boolean;
    expiresAt: Date | null;
} {
    const isActive = isDiscountActive(discountPercentage, discountExpiresAt);
    const hasExpiry = !!discountExpiresAt;
    const expiresAt = discountExpiresAt ? new Date(discountExpiresAt) : null;

    return { isActive, hasExpiry, expiresAt };
}

export default useCountdown;
