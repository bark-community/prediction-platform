"use client";
import { useState, useEffect } from "react";
import { BankSnapshot, UserAccountSnapshot } from "@/lib/marginfi-utils";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiskTier } from "@mrgnlabs/marginfi-client-v2";
import { formatPercentage } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/loading-spinner";

// interface Data {
//   banksShaped: BankSnapshot[];
//   userAccountsShaped: UserAccountSnapshot[];
// }

const dummyData: BankSnapshot[] = [
  {
    tokenSymbol: "BLZE",
    tokenPrice: 1.82,
    tokenName: "Blaze",
    bankAddress: "6Fk3bzhqmUqupk6sN5CbfYMdafvyzDdqDNHW5CsJzq8K",
    lendingRate: 0.08327364146415393,
    borrowingRate: 6.030457675365639,
    totalDepositsNative: "750883416689270166.023857919346652885004",
    totalBorrowsNative: "61287412279775759.415009829494114065708",
    totalDeposits: 750883416.6892701,
    totalBorrows: 61287412.27977576,
    totalDepositsUsdValue: 1053459.3982783784,
    totalBorrowsUsdValue: 86217.51345745844,
    riskTier: "Isolated" as RiskTier,
  },
  {
    tokenSymbol: "RENDER",
    tokenPrice: 1.82,
    tokenName: "Render Token",
    bankAddress: "EbuSnXdFz1R4VPdaJ96KQQQmeYgZTHSzpNW94Tw1PE3H",
    lendingRate: 0.000937377902475624,
    borrowingRate: 5.109328587199132,
    totalDepositsNative: "48192699983673.9942611258980575466140103",
    totalBorrowsNative: "417333845744.40937463091464099266953396",
    totalDeposits: 481926.99983673997,
    totalBorrows: 4173.338457444093,
    totalDepositsUsdValue: 6396568.0086644655,
    totalBorrowsUsdValue: 55434.64764398824,
    riskTier: "Isolated" as RiskTier,
  },
  {
    tokenSymbol: "bSOL",
    tokenPrice: 1.82,
    tokenName: "BlazeStake Staked SOL (bSOL)",
    bankAddress: "6hS9i46WyTq1KXcoa2Chas2Txh9TJAVr6n1t3tnrE23K",
    lendingRate: 0.1198062286516877,
    borrowingRate: 6.235993192980865,
    totalDepositsNative: "399852357470989.592665824171088383042756",
    totalBorrowsNative: "39145726101501.692711625808038021932922",
    totalDeposits: 399852.3574709896,
    totalBorrows: 39145.72610150169,
    totalDepositsUsdValue: 85708961.3991947,
    totalBorrowsUsdValue: 8444764.248287894,
    riskTier: "Collateral" as RiskTier,
  },
  {
    tokenSymbol: "wstETH",
    tokenPrice: 1.82,
    tokenName: "Lido Wrapped Staked ETH",
    bankAddress: "9g3Tug2WbDwekghbPn2u3V84tvikAMBZiFbPUfkjwKNH",
    lendingRate: 0.00019778373537858242,
    borrowingRate: 5.0502194171188135,
    totalDepositsNative: "14687404821.249592800688361259411122277",
    totalBorrowsNative: "58423200.7215955360561915367680491265136",
    totalDeposits: 146.87404821249592,
    totalBorrows: 0.5842320072159554,
    totalDepositsUsdValue: 612254.3839720436,
    totalBorrowsUsdValue: 2439.794028119078,
    riskTier: "Isolated" as RiskTier,
  },
  {
    tokenSymbol: "USDC",
    tokenPrice: 1.82,
    tokenName: "USD Coin",
    bankAddress: "2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB",
    lendingRate: 10.870296344280453,
    borrowingRate: 17.894757254134976,
    totalDepositsNative: "100612841269693.9233330642985632893921962",
    totalBorrowsNative: "85664917367391.6943107154963547905720718",
    totalDeposits: 100612841.26969393,
    totalBorrows: 85664917.36739169,
    totalDepositsUsdValue: 100613836.33069408,
    totalBorrowsUsdValue: 92718622.14253138,
    riskTier: "Collateral" as RiskTier,
  },
];

const columns: ColumnDef<BankSnapshot>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "tokenSymbol",
    header: "Asset",
    cell: ({ row }) => row.getValue("tokenSymbol"),
  },
  {
    accessorKey: "tokenPrice",
    header: "Total Deposits",
    cell: ({ row }) => {
      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(row.getValue("tokenPrice"));

      return formatted;
    },
  },
  {
    accessorKey: "lendingRate",
    header: ({ column }) => {
      return (
        <Button className="pl-0" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Lend APY
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatPercentage(row.getValue("lendingRate")),
  },
  {
    accessorKey: "borrowingRate",
    header: ({ column }) => {
      return (
        <Button className="pl-0" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Borrow APY
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatPercentage(row.getValue("borrowingRate")),
  },
  {
    accessorKey: "totalBorrowsUsdValue",
    header: "Total Borrrows",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalBorrowsUsdValue"));

      // Format the amount as a dollar amount without decimal places
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);

      return formatted;
    },
  },
  {
    accessorKey: "totalDepositsUsdValue",
    header: "Total Deposits",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalDepositsUsdValue"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);

      return formatted;
    },
  },
  {
    header: "Utilization",
    cell: ({ row }) => ((row.original.totalBorrows / row.original.totalDeposits) * 100).toFixed(2) + "%",
  },
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const payment = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
  //             Copy payment ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>View customer</DropdownMenuItem>
  //           <DropdownMenuItem>View payment details</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];

export default function Pools() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // const [data, setData] = useState<Data | null>(dummyData);
  const [data, setData] = useState<BankSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/pools");
        const data = await response.json();
        if (response.ok) {
          setData(data);
        } else {
          setError(new Error(data.error));
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error("An unknown error occurred"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Accessing current page index and total page count
  const currentPage = table.getState().pagination.pageIndex + 1; // Adding 1 to make it human-readable (1-based instead of 0-based)
  const totalPages = table.getPageCount();

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter assets..."
          value={(table.getColumn("tokenSymbol")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("tokenSymbol")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div> */}
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}