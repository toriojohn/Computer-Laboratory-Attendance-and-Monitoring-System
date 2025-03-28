
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface AddAdminProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void; // Corrected type for setOpen
}

const FormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Admin name is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type FormData = z.infer<typeof FormSchema>;

export const AddAdmin = ({open, setOpen, fetch} : AddAdminProps) => {
  const { register, handleSubmit, formState: {errors} } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const [loading, setLoading] = useState(false);


  const addNewAdmin = async (data: FormData) => {
    setLoading(true);
    const newAdmin = {id: data.id, name: data.name, pass: data.password}
    try {
      const response = await axios.post("https://comlab-backend.vercel.app/api/admin/addAdmin", newAdmin);
      console.log(response.data)
      setOpen(false);
      toast.success("New admin has been created.")
      setLoading(false);
      fetch();
    } catch (error) {
      console.error("Error adding data", error)
      toast.error("Unknown error occured.")
      setOpen(false);
      setLoading(false);
    }
    
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}><Plus strokeWidth={3}/>Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add</DialogTitle>
          <DialogDescription>
          Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
             ID
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="id" 
                className="col-span-3" 
                type="text"
                {...register("id")}
                placeholder="ID"
              />
              {errors.id && <span className="text-red-500 text-xs font-geist">{errors.id.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="password" 
                className="col-span-3" 
                type="password"
                {...register("password")}
                
              />
              {errors.password && <span className="text-red-500 text-xs font-geist">{errors.password.message}</span>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          <Button onClick={handleSubmit(addNewAdmin)}> 
            {loading ? ( 
              <>
                Submitting
                <Loader2 className="animate-spin"/>
              </>
            ):(
              <>
                Submit
              </>
            )} 
          </Button>
        </DialogFooter>
      </DialogContent>
  </Dialog>
  )
}
