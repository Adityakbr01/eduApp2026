import { CampaignStatus } from "@/services/campaigns";
import {
    Ban,
    CheckCircle2,
    Clock,
    Loader2,
    XCircle
} from "lucide-react";
// Status configuration
const statusConfig: Record<CampaignStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    [CampaignStatus.DRAFT]: {
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-100 dark:bg-slate-800",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Draft",
    },
    [CampaignStatus.SCHEDULED]: {
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Scheduled",
    },
    [CampaignStatus.PROCESSING]: {
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950",
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        label: "Sending",
    },
    [CampaignStatus.COMPLETED]: {
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        label: "Completed",
    },
    [CampaignStatus.FAILED]: {
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950",
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: "Failed",
    },
    [CampaignStatus.CANCELLED]: {
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-950",
        icon: <Ban className="h-3.5 w-3.5" />,
        label: "Cancelled",
    },
};

export default statusConfig;