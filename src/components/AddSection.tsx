
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

interface AddSectionProps {
    fetch: () => void;
    open: boolean;
    setOpen: (open: boolean) => void; // Corrected type for setOpen
}

const FormSchema = z.object({
    yearlevel: z.string().min(1, { message: "Year level is required" }),
    section: z.string().min(1, { message: "Subject name is required" }),
})

type FormData = z.infer<typeof FormSchema>;

export const AddSection = ({ open, setOpen, fetch }: AddSectionProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(FormSchema),
    })
    const [loading, setLoading] = useState(false);


    const addNewSection = async (data: FormData) => {
        setLoading(true);
        const combinedSection = data.yearlevel + '' + data.section
        const newSection = { section: combinedSection }
        try {
            const response = await axios.post("https://comlab-backend.vercel.app/api/acads/addSection", newSection);
            console.log(response.data)
            setOpen(false);
            toast.success("New Data has been created.")
            setLoading(false);
            fetch();
        } catch (error) {
            console.error("Error adding data", error)
            setOpen(false);
        }

    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}><Plus strokeWidth={3} />Add</Button>
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
                        <Label htmlFor="yearlevel" className="text-right">
                            Year Level
                        </Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="yearlevel"
                                className="col-span-3"
                                type="text"
                                {...register("yearlevel")}
                                placeholder="Year Level"
                            />
                            {errors.yearlevel && <span className="text-red-500 text-xs font-geist">{errors.yearlevel.message}</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="section" className="text-right">
                            Section
                        </Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="section"
                                className="col-span-3"
                                type="text"
                                {...register("section")}
                                placeholder="Section"
                            />
                            {errors.section && <span className="text-red-500 text-xs font-geist">{errors.section.message}</span>}
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex items-center">
                    <Button onClick={handleSubmit(addNewSection)}>
                        {loading ? (
                            <>
                                Submitting
                                <Loader2 className="animate-spin" />
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
    )
}
