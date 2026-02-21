"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface Log {
  _id: string;
  timestamp: string;
  service: string;
  level: string;
  message: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  traceId: string;
}

interface LogsTableProps {
  logs: Log[];
  loading: boolean;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const LogsTable: React.FC<LogsTableProps> = ({
  logs,
  loading,
  onSearch,
  onRefresh,
  page,
  totalPages,
  onPageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search could be added here, but for now we search on Enter/Click
  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Recent Logs</CardTitle>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[250px] h-9"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 hidden sm:flex"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Timestamp</TableHead>
                <TableHead className="w-[80px]">Level</TableHead>
                <TableHead className="w-[100px]">Service</TableHead>
                <TableHead className="min-w-[200px]">Request</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[80px]">Latency</TableHead>
                <TableHead className="min-w-[200px]">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Loading logs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No logs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log._id || Math.random()}
                    className="text-xs hover:bg-muted/50"
                  >
                    <TableCell className="font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.level === "error" ? "destructive" : "secondary"
                        }
                        className="uppercase text-[10px]"
                      >
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.service}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold bg-muted px-1 rounded">
                          {log.method}
                        </span>
                        <span
                          className="truncate max-w-[150px]"
                          title={log.path}
                        >
                          {log.path}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.statusCode >= 400 ? "destructive" : "outline"
                        }
                      >
                        {log.statusCode}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        log.latencyMs > 500 ? "text-yellow-600 font-bold" : ""
                      }
                    >
                      {log.latencyMs}ms
                    </TableCell>
                    <TableCell
                      className="max-w-[300px] truncate"
                      title={log.message}
                    >
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
