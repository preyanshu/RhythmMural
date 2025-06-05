import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import React from 'react'
import TodayPage from "./today_page"
import PromptPage from "./prompt_page"
import PreviousPage from "./previous_page"
import { ToastContainer } from "react-toastify"

const HomeScreen = () => {

  const tabValues = ['today', 'generate', 'previous'];
  
  return (
    <Tabs defaultValue="today">
  <TabsList className="w-[100vw] max-w-[24rem] mt-5 bg-[#0F1522] text-gray-200 ">
  {tabValues.map((value) => (
      <TabsTrigger
        key={value}
        value={value}
        className="w-[30%] data-[state=active]:bg-purple-400"
      >
        {value.charAt(0).toUpperCase() + value.slice(1)} {/* Capitalizes the first letter */}
      </TabsTrigger>
    ))}
  </TabsList>
  <TabsContent value="today" ><TodayPage></TodayPage></TabsContent>
  <TabsContent value="generate"><PromptPage></PromptPage></TabsContent>
  <TabsContent value="previous"><PreviousPage></PreviousPage></TabsContent>
  <ToastContainer></ToastContainer>
</Tabs>


  )
}

export default HomeScreen