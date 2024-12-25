import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import React from 'react'
import TodayPage from "./today_page"
import PromptPage from "./prompt_page"
import PreviousPage from "./previous_page"
import { ToastContainer } from "react-toastify"

const HomeScreen = () => {
  return (
    <Tabs defaultValue="today">
  <TabsList className="w-[100vw] max-w-[24rem] mt-5 ">
    <TabsTrigger value="today" className="w-[30%]">Today</TabsTrigger>
    <TabsTrigger value="generate" className="w-[30%]">Generate</TabsTrigger>
    <TabsTrigger value="previous" className="w-[30%]">Previous</TabsTrigger>
  </TabsList>
  <TabsContent value="today" ><TodayPage></TodayPage></TabsContent>
  <TabsContent value="generate"><PromptPage></PromptPage></TabsContent>
  <TabsContent value="previous"><PreviousPage></PreviousPage></TabsContent>
  <ToastContainer></ToastContainer>
</Tabs>


  )
}

export default HomeScreen