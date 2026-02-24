import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetAccessRequests } from "@/services/liveStream/queries";
import { useProcessAccessRequest } from "@/services/liveStream/mutations";
import {
  LiveStreamAccessStatus,
  ILiveStreamAccessRequest,
} from "@/services/liveStream/types";

function LiveAccessPage() {
  const [page] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LiveStreamAccessStatus | "">(
    "",
  );

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const { data, isLoading } = useGetAccessRequests(page, 10, statusFilter);
  const { mutate: processRequest, isPending: isProcessing } =
    useProcessAccessRequest();

  const requests = data?.data?.requests || [];

  const handleProcess = (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    if (status === "approved") {
      setSelectedRequestId(requestId);
      setConfirmOpen(true);
      return;
    }
    processRequest({ requestId, status });
  };

  const handleConfirmApproval = () => {
    if (selectedRequestId) {
      processRequest({ requestId: selectedRequestId, status: "approved" });
      setConfirmOpen(false);
      setSelectedRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-500/10 text-blue-500 border-none">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Manual VdoCipher Provisioning</AlertTitle>
        <AlertDescription>
          VdoCipher does not support API-based user creation. When instructors
          request live streaming access, you must manually add them in your
          VdoCipher Dashboard under <b>Config &gt; Users</b> with the
          &quot;Uploader&quot;, &quot;Viewer&quot; , &quot;LiveModerator&quot;
          Whatever need role. Once added, you can mark their request as Approved
          here.
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        {(["", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status || "All"}
          </Button>
        ))}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instructor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead>Processed By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading requests...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No access requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request: ILiveStreamAccessRequest) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <div className="font-medium">
                      {request.instructorId.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.instructorId.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        request.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40"
                          : request.status === "pending"
                            ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                            : "bg-rose-500/20 text-rose-500 border-rose-500/40"
                      }
                    >
                      {request.status === "pending" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {request.status === "approved" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {request.status === "rejected" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      <span className="capitalize">{request.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(request.createdAt), "PPp")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {request.processedBy?.name || "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-emerald-500 hover:bg-emerald-600"
                          disabled={isProcessing}
                          onClick={() => handleProcess(request._id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isProcessing}
                          onClick={() => handleProcess(request._id, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approval Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Livestream Approval</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                <strong>Important:</strong> VdoCipher does not provide an API to
                add users automatically.
              </span>
              <span className="block">
                Before approving this request, please ensure you have added this
                instructor&apos;s email address to your VdoCipher Dashboard
                under <strong>Config &gt; Users</strong> with an appropriate
                role (e.g., Uploader/Viewer/LiveModerator).
              </span>
              <span className="block">
                VdoCipher will email them their login credentials directly once
                added.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRequestId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApproval}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Yes, I&apos;ve added them
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default LiveAccessPage;
