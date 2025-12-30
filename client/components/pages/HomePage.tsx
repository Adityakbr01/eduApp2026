"use client";

import { Button } from "@/components/ui/button";
import links from "@/constants/links";
import { useGetCurrentUser } from "@/services/auth";
import { useLogout } from "@/services/auth/mutations";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";

function HomePage() {
    const { user, hydrated, isLoggedIn } = useAuthStore();
    const logout = useLogout();
    useGetCurrentUser(); // keeping it for session sync

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Checking session...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-3xl space-y-8">

                {/* Header Card */}
                <div className=" rounded-xl shadow p-6 space-y-3">
                    <h1 className="text-2xl font-semibold">
                        {isLoggedIn ? "Welcome 👋" : "Welcome to the App"}
                    </h1>

                    {user ? (
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>User ID: <span className="font-medium">{user.userId}</span></p>
                            <p>Role NAME: <span className="font-medium">{user.roleName}</span></p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            Please sign in or create an account to continue.
                        </p>
                    )}

                    {isLoggedIn && (
                        <Button
                            variant="destructive"
                            onClick={() => logout.mutate()}
                            className="mt-3"
                        >
                            Logout
                        </Button>
                    )}
                </div>

                {/* Navigation Card */}
                <div className=" rounded-xl shadow p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Navigation</h2>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/profile">Profile</Link>
                        </Button>

                        <Button asChild>
                            <Link href="/signin">Sign In</Link>
                        </Button>

                        <Button variant="secondary" asChild>
                            <Link href={links.DASHBOARD.ADMIN}>
                                Admin Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Signup Section */}
                <div className=" rounded-xl shadow p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Create Account</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/signup/newStudent">Student</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/signup/newInstructor">Instructor</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/signup/newSupport">Support</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/signup/newManager">Manager</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/signup/newAdmin">Admin</Link>
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default HomePage;
