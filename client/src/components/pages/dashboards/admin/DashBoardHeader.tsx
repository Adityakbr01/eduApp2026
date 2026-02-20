import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Menu } from 'lucide-react';
import { adminUtils } from "@/components/pages/dashboards/common/utils";
import { user_roles } from '@/constants/roles';

interface Props {
    sectionTitle: string;
    activeSection: (typeof adminUtils.sidebarItems)[number];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onMenuClick?: () => void;
};

function DashBoardHeader({
    sectionTitle,
    activeSection,
    searchQuery,
    setSearchQuery,
    onMenuClick,
}: Props) {
    return (
        <header className="border-b bg-linear-to-r from-primary/5 via-background/80 to-background/80 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div>
                        <p className="text-sm text-primary font-semibold">🛡️ {user_roles.ADMIN.toUpperCase()} || {user_roles.MANAGER.toUpperCase()} Dashboard</p>
                        <h2 className="text-2xl font-bold tracking-tight text-primary">{sectionTitle}</h2>
                    </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    {activeSection.value === "users" && (
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 pl-10 pr-3 text-sm"
                            />
                        </div>

                    )}
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Invite user
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default DashBoardHeader