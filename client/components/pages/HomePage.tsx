"use client";
import { Button } from "@/components/ui/button";
import { useGetCurrentUser } from "@/services/auth";
import { useLogout } from "@/services/auth/mutations";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";

function HomePage() {
    const { user, hydrated, isLoggedIn } = useAuthStore();
    console.log("HomePage render:", { user, hydrated, isLoggedIn });
    const logOut = useLogout()
    const { data } = useGetCurrentUser()
    console.log("useGetCurrentUser result:", data);


    if (!hydrated) return <div>Checking session...</div>;

    return <div>
        {user && (<div>Welcome, User ID: {user.userId}, Role ID {user.roleId?._id}
            <Button onClick={() => {
                logOut.mutate();
            }}>Logout</Button>
        </div>)}

        <div className="space-x-9">
            <Link href="/profile">Go to Profile</Link>
            <Link href="/signin">Go to SignIn</Link>
            <Link href="/signup/newStudent">Go to SignUp</Link>
            <Link href="/signup/newInstructor">Go to SignUp</Link>
            <Link href="/signup/newSupport">Go to SignUp</Link>
            <Link href="/signup/newManager">Go to SignUp</Link>
            <Link href="/signup/newAdmin">Go to SignUp</Link>

            {/* Dashboard */}
            <Link href="/dashboard/admin">Go to Admin Dashboard</Link>
        </div>

    </div>;


}

export default HomePage;