import { CampaignPriority } from "@/services/campaigns";
import { ArrowRight, TrendingUp, Zap } from "lucide-react";


// Priority configuration
const priorityConfig: Record<CampaignPriority, { color: string; bg: string; icon: React.ReactNode }> = {
    [CampaignPriority.LOW]: {
        color: "text-slate-500",
        bg: "bg-slate-100 dark:bg-slate-800",
        icon: <ArrowRight className="h-3 w-3" />,
    },
    [CampaignPriority.NORMAL]: {
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900",
        icon: <TrendingUp className="h-3 w-3" />,
    },
    [CampaignPriority.HIGH]: {
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900",
        icon: <Zap className="h-3 w-3" />,
    },
};

export default priorityConfig;