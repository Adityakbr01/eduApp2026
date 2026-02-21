import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLES } from '@/validators/auth.schema'
import React from 'react'

function UserPageHeader({ filterRole, setFilterRole }: { filterRole: string | null, setFilterRole: (role: string | null) => void }) {
    return (
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage roles, invites, and status</CardDescription>
            </div>

            <Select
                value={filterRole ?? undefined}
                onValueChange={(value) =>
                    setFilterRole(value === "all" ? null : value)
                }
            >
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Roles" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {Object.values(ROLES).map((role) => (
                        <SelectItem key={role} value={role}>
                            {role.replace("_", " ").toUpperCase()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardHeader>

    )
}

export default UserPageHeader

