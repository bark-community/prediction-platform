"use client";
import { useState } from "react";
import { useCluster } from "./cluster-data-access";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function ExplorerLink({ path, label, className }: { path: string; label: string; className?: string }) {
  const { getExplorerUrl } = useCluster();

  return (
    <a
      href={getExplorerUrl(path)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link hover:text-purple-500`}
    >
      {label}
    </a>
  );
}

export function ClusterUiSelect() {
  const [showStatusBar, setShowStatusBar] = useState<Checked>(false);
  const { clusters, setCluster, cluster } = useCluster();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{cluster.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {clusters.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.name}
            checked={item.name === cluster.name ? true : false}
            onCheckedChange={setShowStatusBar}
            onClick={() => setCluster(item)}
          >
            {item.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ClusterUiTable() {
  const { clusters, setCluster, deleteCluster } = useCluster();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Network</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clusters.map((item) => (
          <TableRow key={item.name} className={item?.active ? "bg-secondary" : ""}>
            <TableCell className="font-medium">
              <span className="text-lg">
                {item?.active ? (
                  item.name
                ) : (
                  <button
                    title="Select cluster"
                    className="link link-secondary text-purple-500 underline"
                    onClick={() => setCluster(item)}
                  >
                    {item.name}
                  </button>
                )}
              </span>
            </TableCell>
            <TableCell>{item.network ?? "custom"}</TableCell>
            <TableCell>{item.endpoint}</TableCell>
            <TableCell className="text-right">
              <button
                disabled={item?.active}
                className="btn btn-xs btn-default btn-outline"
                onClick={() => {
                  if (!window.confirm("Are you sure?")) return;
                  deleteCluster(item);
                }}
              >
                <Trash2 className="h-5 w-5 float-end" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}