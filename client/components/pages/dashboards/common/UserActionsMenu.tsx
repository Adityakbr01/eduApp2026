"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usersMutations } from "@/services/users/index";
import { CheckCircle, MoreVertical, ShieldBan, Trash2, User } from "lucide-react";
import type { UserRow } from "./types";
import { useState } from "react";
import UserProfileModal from "./Users/UserProfileModel/UserProfileModal";
import { useEffectivePermissions } from "@/store/myPermission";
import { CheckPermission } from "@/lib/utils/permissions";
import app_permissions from "@/constants/permissions";
import toast from "react-hot-toast";


type UserActionsMenuProps = {
    user: UserRow;
    onView?: () => void;

};

export function UserActionsMenu({ user, onView }: UserActionsMenuProps) {
    const approveMutation = usersMutations.useApproveUser();
    const banMutation = usersMutations.useBanUser();
    const deleteMutation = usersMutations.useDeleteUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const effectivePermissions = useEffectivePermissions();

    const CanManageUser = CheckPermission({
        carrier: effectivePermissions,
        requirement: app_permissions.MANAGE_USER,
    });

    const CanDeleteUser = CheckPermission({
        carrier: effectivePermissions,
        requirement: app_permissions.DELETE_USER,
    });

    const handleApprove = () => {
        if (!CanManageUser) {
            toast.error("You do not have permission to approve users.");
            return;
        }
        approveMutation.mutate({ userId: user.id },);
    };

    const handleBanToggle = () => {
        if (!CanManageUser) {
            toast.error("You do not have permission to ban/unban users.");
            return;
        }
        banMutation.mutate({ userId: user.id });
    };

    const handleDelete = () => {
        if (!CanDeleteUser) {
            toast.error("You do not have permission to delete users.");
            return
        }
        deleteMutation.mutate(user.id);
    };

    const normalizedStatus = user.status.label.toLowerCase();
    const isPendingApproval = normalizedStatus === "pending approval";
    const isBanned = normalizedStatus === "banned";
    const banActionLabel = isBanned ? "Unban User" : "Ban User";
    const banActionDescription = isBanned
        ? "User will regain access immediately."
        : "User will be blocked from signing in until you unban them.";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                    >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40 bg-background">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem
                        onClick={() => {
                            onView?.();
                            setIsProfileOpen(true);
                        }}
                    >
                        <User className="mr-2 h-4 w-4" />
                        User Profile
                    </DropdownMenuItem>

                    {isPendingApproval && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    disabled={approveMutation.isPending || !CanManageUser}
                                    onSelect={(event) => event.preventDefault()}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {approveMutation.isPending ? "Approving..." : "Approve"}
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Approve user?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will grant the user full access immediately.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={approveMutation.isPending}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleApprove}
                                        disabled={approveMutation.isPending || !CanManageUser}
                                    >
                                        {approveMutation.isPending ? "Approving..." : "Confirm"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                className=""
                                disabled={banMutation.isPending || !CanManageUser}
                                onSelect={(event) => event.preventDefault()}
                            >
                                <ShieldBan className="mr-2 h-4 w-4" />
                                {banMutation.isPending ? "Processing..." : banActionLabel}
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{banActionLabel}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {banMutation.isPending ? "Please wait..." : banActionDescription}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={banMutation.isPending}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleBanToggle}
                                    disabled={banMutation.isPending}
                                >
                                    {banMutation.isPending ? "Processing..." : banActionLabel}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <DropdownMenuSeparator />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                disabled={deleteMutation.isPending || !CanDeleteUser}
                                onSelect={(event) => event.preventDefault()}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action is permanent and removes the user and their sessions.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>


                </DropdownMenuContent>
            </DropdownMenu>

            <UserProfileModal
                open={isProfileOpen}
                onOpenChange={setIsProfileOpen}
                user={user}
            />
        </>
    );
}
