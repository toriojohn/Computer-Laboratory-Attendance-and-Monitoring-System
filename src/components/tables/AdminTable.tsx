"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ArrowUpDown, Loader2, MoreHorizontal, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DeleteModal from "../DeleteModal"
import axios from "axios"
import { Skeleton } from "../ui/skeleton"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { AddAdmin } from "../AddAdmin"

export type AdminList = {
  _id: string,
  id: string,
  name: string,
  password: string,
}

const FormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
})

type FormData = z.infer<typeof FormSchema>;

export function AdminTable() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [currentLab, setCurrentLab] = React.useState<AdminList | null>(null);


  const columns: ColumnDef<AdminList>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs pl-0 bg-transparent"
            >
              ID
              <ArrowUpDown />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs pl-0 bg-transparent"
            >
              Name
              <ArrowUpDown />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        // const payment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {/* <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditClick(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState<AdminList[]>([])
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [editMode, setEditMode] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  const fetchList = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/admin/getAdmins");
      setList(response.data);
      console.log(response.data);
      setLoadingTable(false);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  React.useEffect(() => {
    fetchList();
  }, []);

  const handleEditClick = (lab: AdminList) => {
    setCurrentLab(lab);
    setEditMode(true);
    // Pre-fill the form with the lab's current values, including _id
    reset({
      id: lab.id,
      name: lab.name,
    });
    setOpenEdit(true); // Open the dialog
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (currentLab && editMode) {
        // Update existing lab
        await axios.post(`https://comlab-backend.vercel.app/api/admin/editAdmin/${currentLab._id}`, {
          id: data.id,
          name: data.name,
        });

        fetchList(); // Refresh the list
        setOpenEdit(false); // Close dialog
        setEditMode(false);
        toast.success("Admin updated successfully")
      }
    } catch (error) {
      console.error("Error updating lab", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async () => {
    setOpenDelete(true);
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const adminId = row.original._id; // Access the user's _id
        await axios.delete(`https://comlab-backend.vercel.app/api/admin/deleteAdmin/${adminId}`);
        console.log(`Deleted com with ID: ${adminId}`);
      }
      toast.info(`${selectedRows.length} Data/s has been deleted.`);

      fetchList();
      setRowSelection({});
      setLoading(false);
      setOpenDelete(false);
    } catch (error) {
      console.error("Error deleting a data", error);
      setOpenDelete(false);
      toast.error("Unknown error has occured");
    }
  }


  const table = useReactTable({
    data: list,
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
  })

  return (
    <>
      {loadingTable ? (
        <div className="w-full">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
            <div className="flex items-center py-4 font-geist justify-between">
              <div className="w-1/2 flex gap-2">
                <Skeleton className="w-[30%] h-10" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-10" />
              </div>
            </div>
            <div className="rounded-md border font-geist">
              <Skeleton className="h-96 w-full"></Skeleton>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4 font-geist">
              <Skeleton className="h-10 w-20"></Skeleton>
              <div className="space-x-2 flex">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex items-center justify-between py-4">
            <div>
              <Input
                placeholder="Search by name"
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div>
              <div className="flex gap-2">
                {Object.keys(rowSelection).length !== 0 && (
                  <DeleteModal
                    title={`Delete (${Object.keys(rowSelection).length})`}
                    description={`Are you sure you want to delete ${Object.keys(rowSelection).length} data(s)?`}
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onClick={deleteAdmin}
                    loading={loading}
                  />
                )}
                <AddAdmin open={open} setOpen={setOpen} fetch={fetchList} />
              </div>

            </div>

          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    // onClick={() => handleRowClick(row.getValue("name"))}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="sm:max-w-[425px] font-geist">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Admin" : "Add Admin"}</DialogTitle>
                <DialogDescription>
                  {editMode ? "Make changes to the admin details." : "Add a new admin."} Click submit when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject_code" className="text-right">
                    ID
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="id"
                      className="col-span-3"
                      type="text"
                      {...register("id")}
                      placeholder="Code"
                    />
                    {errors.id && <span className="text-red-500 text-xs font-geist">{errors.id.message}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Name
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="name"
                      className="col-span-3"
                      type="text"
                      {...register("name")}
                      placeholder="Name"
                    />
                    {errors.name && <span className="text-red-500 text-xs font-geist">{errors.name.message}</span>}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex items-center">
                <Button onClick={handleSubmit(onSubmit)}>
                  {loading ? (
                    <>
                      Submitting
                      <Loader2 className="ml-2 animate-spin" />
                    </>
                  ) : (
                    <>
                      Submit
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  )
}