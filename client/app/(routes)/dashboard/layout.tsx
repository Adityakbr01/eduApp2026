"use client";

import React from "react";

/**
 * Dashboard Layout
 * 
 * This layout is used for all dashboard pages (Admin, Instructor, etc.)
 * It does NOT include the main navbar since dashboard pages have their own
 * sidebar navigation system.
 * 
 * Key differences from marketing pages:
 * - No fixed navbar offset needed
 * - No padding-top for navbar
 * - Full viewport height for dashboard chrome
 * - Separate scroll handling within dashboard components
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout min-h-screen">
      {children}
    </div>
  );
}
