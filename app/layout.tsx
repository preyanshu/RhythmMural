"use client";

import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";

import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/utils/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ Create a QueryClient instance for React Query
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>  {/* ✅ Fix */}
            <RainbowKitProvider>
              <AuthContextProvider>
				{children}
				</AuthContextProvider>
              <ToastContainer />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
