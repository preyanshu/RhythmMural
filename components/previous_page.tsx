import React, { useState, useEffect } from "react";
import { Trophy, Users, DollarSign, Calendar, Loader, Music } from "lucide-react";
import { get } from "http";
import { getWinners } from "@/utils/contractUtils";
import { useAuth } from "@/context/AuthContext";
import { ethers } from "ethers";

// Define types for each contest and winner structure
interface Winner {
  submitter: string;
  musicUrl: string;
  prompt: string;
  votes: string;
  payout: string;
}

interface Contest {
  theme: string;
  timestamp: string;
  voterShare: string;
  winners: Winner[];
}

const PreviousPage: React.FC = () => {
  const [contests, setContests] = useState<(string[])[]>([]); // Type the contests as an array of arrays or null
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { walletSdk } = useAuth();

  // Dummy function to simulate data fetching
  const fetchContests = async () => {
    try {
     
      setLoading(true); // Set loading to true before fetching
      const contests = await getWinners(walletSdk);
      setContests(contests);
    } catch (error) {
      console.error("Error fetching contests:", error);
      // Optionally set an error state or show a message to the user
      setError("Failed to fetch contests. Please try again.");
    } finally {
      setLoading(false); 
    }
  };
  

  useEffect(() => {
    fetchContests();
  }, []);

  // Helper function to convert UNIX timestamp to readable date
  const formatDate = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp, 10) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group contests based on theme, timestamp, and voterShare
  const groupedContests: Contest[] = contests && contests.length > 0 
  ? contests.reduce((acc: Contest[], winner: string[]) => {
      const [submitter, musicUrl, theme, prompt, votes, payout, timestamp, voterShare] = winner;

      const existingContest = acc.find(
        (contest) => contest.theme === theme && contest.timestamp === timestamp && contest.voterShare === voterShare
      );

      if (existingContest) {
        existingContest.winners.push({ submitter, musicUrl, prompt, votes, payout });
      } else {
        acc.push({
          theme,
          timestamp,
          voterShare,
          winners: [{ submitter, musicUrl, prompt, votes, payout }],
        });
      }

      return acc;
    }, [])
  : [];

  return (
    <div className="w-[100vw] max-w-[24rem]  min-h-screen p-4 bg-gradient-to-br from-black via-gray-900 to-purple-950 text-gray-200">
      <h1 className="text-xl font-bold mb-8 text-purple-400 mt-4 w-full text-center">
        <Music className="inline " /> Here’s What Won Last Time
      </h1>


      {/* Error Section */}


  {!loading && error && (
    <div className="bg-gray-800 text-gray-300 p-6 rounded-lg shadow-md mb-6 text-center border border-purple-800">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
      <p className="text-lg ">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-800 text-gray-100 font-semibold rounded-md hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>
  )}


  {!loading && groupedContests.length === 0 && !error && (
    <div className="bg-gray-800 text-gray-300 p-6 rounded-lg shadow-md mb-6 text-center border border-purple-800">
      <h2 className="text-2xl font-bold text-red-500 mb-4">No Contests Yet</h2>
      <p className="text-lg ">There are no contests to show yet. Check back later.</p>
    </div>
  )}


  {/* Contest Details */}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-purple-400 w-8 h-8" />
        </div>
      ) : (
        groupedContests.map((contest, contestIndex) => (
          <div key={contestIndex} className="border  border-purple-800 rounded-lg p-4 mb-6 shadow-sm bg-gray-800 text-gray-300">
            <div className="flex items-center mb-2">
              <Trophy className="text-yellow-500 mr-2" />
              <h2 className="text-xl font-semibold">{contest.theme}</h2>
            </div>
            <p className=" mb-4">
              Voter Share: <span className="font-medium">{(Math.round(parseFloat(ethers.formatEther(BigInt(contest.voterShare || 0))) * 1000) / 1000).toFixed(3)} tBNB</span>
            </p>
            <p className=" mb-4">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              {formatDate(contest.timestamp)}
            </p>

           {contestIndex===0 && <>
            <p className="text-sm mt-2  mb-3 font-medium">
               Rewards have already been sent to the winners and voters wallets.
            </p>
           </>}

            {contest.winners.map((winner, winnerIndex) => (
  <div key={winnerIndex} className="bg-purple-400 p-3 rounded-lg mb-3 shadow-sm text-black">
 
  <p className="font-small mb-2">
    Winner {winnerIndex + 1}: <br />
    <span className="break-words">{winner.submitter}</span>
  </p>


    <p className="text-gray-700 text-sm mb-2">
      Prompt:{" "}
      <span className="italic break-words">
        { winner.prompt }
      </span>
    </p>
    <div className="text-sm text-gray-600">
      <audio controls className="w-full">
        <source src={winner.musicUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        <Users className=" w-4 h-4 text-cyan-600" />
        <p className="text-gray-700 text-sm">Votes: {winner.votes}</p>
      </div>
      <div className="flex items-center gap-2">
        <DollarSign className="text-cyan-600 w-4 h-4" />
        <p className="text-gray-700 text-sm">Payout: {(Math.round(parseFloat(ethers.formatEther(BigInt(winner.payout || 0))) * 1000) / 1000).toFixed(3)} tBNB</p>
      </div>
    </div>
  
  </div>
))}
  
          </div>
        ))
      )}
    </div>
  );
};

export default PreviousPage;
