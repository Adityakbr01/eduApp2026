import { type ReactNode } from "react";

export type InfoItem = {
  label: string;
  value: ReactNode;
};

type UserInfoTabProps = {
  panelRef: (node: HTMLDivElement | null) => void;
  displayName?: string | null;
  infoItems: InfoItem[];
};

const UserInfoTab = ({
  panelRef,
  displayName,
  infoItems,
}: UserInfoTabProps) => {
  console.log("infoItems", infoItems);

  return (
    <div
      ref={panelRef}
      className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-4"
    >
      <div>
        <p className="text-sm text-muted-foreground">Display Name</p>
        <p className="text-lg font-semibold text-foreground">
          {displayName || "—"}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-input/60 bg-background/80 p-3 text-sm shadow-sm"
          >
            <p className="text-muted-foreground">{item.label}</p>
            <Content value={item.value} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Content = ({ value }: { value: ReactNode }) => {
  if (typeof value === "string" || typeof value === "number") {
    return <p className="font-medium text-foreground">{value}</p>;
  }
  return <div className="font-medium text-foreground">{value}</div>;
};

export default UserInfoTab;
