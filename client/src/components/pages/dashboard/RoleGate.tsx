"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { checkRole } from "@/lib/utils/permissions";
import type { ReactNode } from "react";
import { Role } from "@/validators/auth.schema";

export type RoleGateProps = {
    allowed: Role[];
    children: ReactNode;
    redirectPath?: string;
    showFallback?: boolean;
};

const formatRoleLabel = (role: Role) => role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

function RoleGate({ allowed, children, redirectPath = "/", showFallback = true }: RoleGateProps) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const hasAccess = useMemo(() => {
        if (!user) return false;
        return allowed.some((role) => checkRole(user, role));
    }, [allowed, user]);

    useEffect(() => {
        if (!user) return;
        if (hasAccess) return;
        if (showFallback) return;
        router.replace(redirectPath);
    }, [user, hasAccess, showFallback, redirectPath, router]);

    if (!user) {
        return (
            <FallbackCard
                icon={ShieldAlert}
                title="Sign in required"
                description="Please sign in to access this dashboard."
                actionLabel="Go to sign in"
                onAction={() => router.replace("/signin")}
            />
        );
    }

    if (!hasAccess) {
        if (!showFallback) {
            return null;
        }
        return (
            <FallbackCard
                icon={ShieldCheck}
                title="Access restricted"
                description={`This dashboard is limited to: ${allowed.map(formatRoleLabel).join(", ")}.`}
                actionLabel="Go home"
                onAction={() => router.replace(redirectPath)}
            />
        );
    }

    return <>{children}</>;
}

export default RoleGate;

type FallbackCardProps = {
    icon: typeof ShieldAlert;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
};

function FallbackCard({ icon: Icon, title, description, actionLabel, onAction }: FallbackCardProps) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <Card className="w-full max-w-lg border-dashed">
                <CardHeader className="flex flex-row items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button onClick={onAction} className="mt-4">
                        {actionLabel}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
