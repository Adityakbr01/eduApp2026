"use client";

import { Card } from "@/components/ui/card";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import UserPageHeader from "./dashboards/common/Users/UserPageHeader";
import UserPageContent from "./dashboards/common/Users/UserPageContent";
import { UserRow } from "./dashboards/common/types";

/* ----------------------------- Types ----------------------------- */

type Pagination = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
};

export type UsersPageProps = {
    filterRole: string | null;
    setFilterRole: React.Dispatch<React.SetStateAction<string | null>>;

    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;

    limit: number;
    setLimit: (n: number) => void;

    pagination: Pagination;

    isLoadingUsers?: boolean;
    isUsersError?: boolean;
    usersError?: Error | null;

    rowsToRender?: UserRow[];
};

/* ---------------------------- Component --------------------------- */

function UsersPage(props: UsersPageProps) {
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    /* --------------------------- GSAP --------------------------- */
    useGSAP(
        () => {
            if (!tableBodyRef.current) return;

            const rows = tableBodyRef.current.querySelectorAll("tr");

            if (!rows.length) return;

            gsap.fromTo(
                rows,
                { opacity: 0, y: 18, filter: "blur(8px)" },
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.55,
                    stagger: 0.06,
                    ease: "power3.out",
                }
            );
        },
        { dependencies: [props.rowsToRender] }
    );

    /* ---------------------- Pagination math ---------------------- */
    const totalItems = props.pagination.total;
    const fromItem = totalItems
        ? (props.page - 1) * props.limit + 1
        : 0;
    const toItem = Math.min(props.page * props.limit, totalItems);

    /* ----------------------------- JSX ---------------------------- */
    return (
        <Card className="border-none bg-transparent shadow-none">
            <UserPageHeader
                filterRole={props.filterRole}
                setFilterRole={props.setFilterRole}
            />

            <UserPageContent
                tableBodyRef={tableBodyRef}
                rows={props.rowsToRender}
                pagination={props.pagination}
                isLoading={props.isLoadingUsers}
                isError={props.isUsersError}
                error={props.usersError}
                pageInfo={{ fromItem, toItem, totalItems }}
                limit={props.limit}
                setLimit={props.setLimit}
                onPrev={() =>
                    props.setPage((p) => Math.max(1, p - 1))
                }
                onNext={() =>
                    props.setPage((p) =>
                        Math.min(props.pagination.totalPages, p + 1)
                    )
                }
            />
        </Card>
    );
}

export default UsersPage;
