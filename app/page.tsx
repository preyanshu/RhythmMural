"use client";

import { useAuth } from "@/context/AuthContext";
import WalletCard from "@/components/wallet_card";
import { ethers } from "ethers";

import {
  getSubmissionFee,
  submitMusic,
  voteOnSubmission,
  getWinners,
} from "@/utils/contractUtils";
import HomeScreen from "@/components/home_screen";
import { use } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAccount } from '@wagmi/core';
import { wagmiConfig } from "@/utils/wagmiConfig";

export default function Home() {
  const account = getAccount(wagmiConfig);
  const { userAddr, walletSdk, chainId } = useAuth();
  console.log(userAddr, chainId);

  return (
    <div className="page-container">
      {!account.address ? (
        <div>
          {/* <WalletCard /> */}
          <ConnectButton />
        </div>
      ) : (
        <>
          <HomeScreen />
        </>
      )}
    </div>
  );
}
