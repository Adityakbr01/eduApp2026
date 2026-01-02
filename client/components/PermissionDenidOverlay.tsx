import { Shield } from 'lucide-react'
import React from 'react'

function PermissionDeniedOverlay() {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-background/95 px-8 py-6 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <Shield className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-lg font-semibold text-destructive">Access Denied</p>
                <p className="max-w-xs text-center text-sm text-muted-foreground">
                    You don&apos;t have permission to view overview data. Please contact an administrator.
                </p>
            </div>
        </div>
    )
}

export default PermissionDeniedOverlay