import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { BadConditionTable } from "@/components/tables/BadConditionTable"
import { ComputerManagementTable } from "@/components/tables/ComputerManagementTable"
import { GoodConditionTable } from "@/components/tables/GoodConditionTable"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"

export default function ComputerManagement() {
  const [totalGood, setTotalGood] = useState(0);
  const [totalBad, setTotalBad] = useState(0);
  const [show, setShow] = useState("Main")
  const [loading, setLoading] = useState(false);

  const fetchCondition = async() => {
    setLoading(true);
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/computerStat/getList")
      const conditions = response.data.com;

      const goodCount = conditions.filter((item: { condition: string }) => item.condition === 'Good').length;
      const badCount = conditions.filter((item: { condition: string }) => item.condition === 'Bad').length;

      setTotalGood(goodCount);
      setTotalBad(badCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching conditions", error)
    }
  }

  useEffect(() => {
    fetchCondition();
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Computer Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {loading ? (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 w-full">
              <Skeleton className="rounded-xl h-40" />
              <Skeleton className="rounded-xl h-40" />
            </div>
          </div>
        ):(
          show === "Main" ? (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             <div className="grid auto-rows-min gap-4 md:grid-cols-2">
               <Card className="@container/card bg-green-50 cursor-pointer" onClick={() => {setShow("Good")}}>
                 <CardHeader className="relative">
                   <CardDescription>Good Condition</CardDescription>
                   <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalGood || "0"}</CardTitle>
                 </CardHeader>
                 <CardFooter className="flex-col items-start gap-1 text-sm">
                   <div className="text-muted-foreground">
                     Current total number of pc in good condition.
                   </div>
                 </CardFooter>
               </Card>
               <Card className="@container/card bg-red-50 cursor-pointer" onClick={() => {setShow("Bad")}}>
                 <CardHeader className="relative">
                   <CardDescription>Bad Condition</CardDescription>
                   <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalBad || "0"}</CardTitle>
                 </CardHeader>
                 <CardFooter className="flex-col items-start gap-1 text-sm">
                   <div className="text-muted-foreground">
                     Current total number of pc in bad condition.
                   </div>
                 </CardFooter>
               </Card>
             </div>
             <ComputerManagementTable />
   
           </div>
          ): show === "Good" ? (
            <div>
              <Button variant={"ghost"} onClick={() => {setShow("Main"), window.location.reload()}}><ChevronLeft /></Button>
              <GoodConditionTable />
            </div>
          ):(
            <div>
              <Button variant={"ghost"} onClick={() => {setShow("Main"), window.location.reload()}}><ChevronLeft /></Button>
              <BadConditionTable />
            </div>
          )
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
