import { useParams, useLocation } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { AppSidebarTeacher } from "@/components/teacher/app-sidebar";

interface ComputerItem {
  _id: string;
  pc_id: string;
  comlabid: string;
  name: string;
  condition: string;
  status: string;
  date_added: string;
  updated_at: string;
  comment: string;
}

const FormSchema = z.object({
  pc_id: z.string().min(1, {message: "PC ID is required"}),
  name: z.string().min(1, {message: "Name is required"}),
  condition: z.string().optional(),
  status: z.string().optional(),
  comment: z.string().optional(),
})

type FormData = z.infer<typeof FormSchema>;

export default function ComDetails() {
  const { register, handleSubmit, formState: {errors}, reset } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  
  const { name } = useParams();
  const location = useLocation();
  const { room, id } = location.state || {};
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [list, setList] = useState<ComputerItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ComputerItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchList = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/computerStat/getList");
      setList(response.data.com);
      console.log("Response: ", response.data.com);
      setLoadingData(false);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = list.filter(item => item.comlabid === id);

  const handleEditClick = (item: ComputerItem) => {
    setSelectedItem(item);
    reset({
      pc_id: item.pc_id,
      name: item.name,
      condition: item.condition,
      status: item.status,
      comment: item.comment
    });
    setEditDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedItem) return;
    const editData = {
      pc_id: data.pc_id,
      name: data.name,
      condition: data.condition,
      status: data.status,
      comment: data.comment
    }
    try {
      setEditLoading(true);
      await axios.post(`https://comlab-backend.vercel.app/api/computerStat/editComputerSet/${selectedItem._id}`, editData);
      console.log(editData)
      
      fetchList();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating computer set", error)
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebarTeacher />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/teacher/comManagement">Computer Management</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h2 className="text-2xl font-semibold">Details for {name} - Total Set: {filteredList.length}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={name || ""} disabled placeholder="Name" />
            <Input value={room || ""} disabled placeholder="Room" />
          </div>
          <div className="flex flex-row justify-end gap-5">
            {loadingData ? ( 
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="w-full h-14"/>
                <Skeleton className="w-full h-14"/>
                <Skeleton className="w-full h-14"/>
                <Skeleton className="w-full h-14"/>
                <Skeleton className="w-full h-14"/>
                <Skeleton className="w-full h-14"/>
              </div>
            ):(
              <Accordion type="multiple" className="w-full">
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index + 1}`}>
                      <AccordionTrigger className="px-2">{item.name}</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col p-4 gap-2">
                          <span>PC ID: {item.pc_id}</span>
                          <span>Name: {item.name}</span>
                          <span>Condition: <Badge className={item.condition === "Good" ? "bg-green-200 text-green-800 hover:bg-green-200" : item.condition === "Fair" ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-200" : "bg-red-200 text-red-900 hover:bg-red-200"}>{item.condition}</Badge></span>
                          <span>Status: <Badge className={item.status === "Active" ? "bg-green-200 text-green-800 hover:bg-green-200" : "bg-red-500"}>{item.status}</Badge></span>
                          <span>Created at: {item.date_added}</span>
                          <span>Updated at: {item.updated_at}</span>
                          <div className="grid w-full gap-2">
                            <span>Comment: </span>
                            <Textarea placeholder="Type your message here." value={item.comment} disabled/>
                          </div>
                        </div>
                        <div className="w-full flex justify-end gap-2">
                          <Button 
                            className="font-geist bg-[#022c22] hover:bg-[#064e3b]" 
                            onClick={() => handleEditClick(item)}
                          >
                            <Pencil className="mr-2" />Edit
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-32"><p className="text-gray-500">No results found.</p></div>
                )}
              </Accordion>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Edit Dialog - Moved outside of the accordion loop */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Details</DialogTitle>
            <DialogDescription>Make changes. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pc_id" className="text-right">PC ID</Label>
                <div className="col-span-3 relative">
                  <Input id="pc_id" className="col-span-3" type="text" {...register("pc_id")} placeholder="PC ID" disabled/>
                  {errors.pc_id && <span className="text-red-500 text-xs font-geist">{errors.pc_id.message}</span>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <div className="col-span-3 relative">
                  <Input id="name" className="col-span-3" type="text" {...register("name")} placeholder="Name" disabled/>
                  {errors.name && <span className="text-red-500 text-xs font-geist">{errors.name.message}</span>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="condition" className="text-right">Condition</Label>
                <div className="col-span-3 font-geist text-[14px]">
                  <select id="condition" {...register("condition")} className="w-full p-2 border rounded-md font-geist bg-white">
                    <option value="Good">Good</option>
                    <option value="Bad">Bad</option>
                  </select>
                  {errors.condition && <p className="text-red-500 text-xs">{errors.condition.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <div className="col-span-3 font-geist text-[14px]">
                  <select id="status" {...register("status")} className="w-full p-2 border rounded-md font-geist bg-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs">{errors.status.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comment" className="text-right">Comment</Label>
                <div className="col-span-3 font-geist text-[14px]">
                  <Textarea id="comment" {...register('comment')} placeholder="Add a comment..." />
                </div>
              </div>
              {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button disabled={editLoading}>
                {editLoading ? (
                  <>Saving<Loader2 className="ml-2 h-4 w-4 animate-spin"/></>
                ) : (
                  <>Save changes</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
