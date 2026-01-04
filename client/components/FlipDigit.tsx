import FlipNumbers from "react-flip-numbers";
import { cn } from "@/lib/utils";

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
                "rounded-xl px-3 py-2 backdrop-blur-md",
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

export default FlipDigit;