import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Music, User, DollarSign, Clock, Palette, Loader } from "lucide-react";
import { getContestDetails, voteOnSubmission } from "@/utils/contractUtils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";


interface Submission {
  0: string; // This could represent the submitter's address or name
  1: string; // This could represent some other data, like submission title or description
  2: string; // This might be the theme or type of the submission
  3: string; // This could represent a URL or metadata related to the submission
}


const TodayPage = () => {
  const { walletSdk, userAddr } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [totalFunds, setTotalFunds] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [voters, setVoters] = useState<string[]>([]); 

  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const contestDetails = await getContestDetails(walletSdk);
      console.log(contestDetails);

      const blockTimestamp = parseInt(contestDetails[3]) * 1000; // Convert to milliseconds
      const contestEndTime = blockTimestamp + 24 * 60 * 60 * 1000; // Add 24 hours

      setSubmissions(contestDetails[0]);
      setTotalVotes(parseInt(contestDetails[1]));
      setTotalFunds(parseInt(contestDetails[2]));
      setVoters(contestDetails[4]);
      setEndTime(contestEndTime);
      setIsLoading(false); // Set loading to false after data is loaded
    } catch (error) {
      console.error("Error loading contest data:", error);
      setError("Error loading contest data: "+error);
      setIsLoading(false); // Even in case of error, stop loading
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      const now = Date.now();
      setTimeRemaining(Math.max(0, endTime - now));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const handleVote = async (submissionIndex: number) => {
    if (voters.includes(userAddr)) {
      // If the user has already voted, show an error toast
      toast.error("You can only vote once per Mural contest.");
      return; // Exit the function early if the user has already voted
    }

    try {
      const tx = await voteOnSubmission(walletSdk, submissionIndex);
      
      // Add the user's address to the voters list
      setVoters((prevVoters) => [...prevVoters, userAddr]);

      toast.success(`Voted for submission ${submissionIndex + 1}`);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Error voting, please try again.");
    }
  };

  // Format time remaining as HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-gray-200 p-6 w-full max-w-[24rem] mx-auto">

  {/* Error Section */}
  {!isLoading && error && (
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

  {/* Contest Details */}
  {!isLoading && (
    <div className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-400">
        <Music className="inline" /> Today's Music Mural
      </h1>
      <div className="space-y-3">
        <p className="text-lg flex items-center gap-2">
          <Palette className="text-purple-500" />
          Theme:{" "}
          <span className="text-gray-300">
            {submissions.length !== 0 ? submissions[0][2] : "Open"}
          </span>
        </p>
        <p className="text-lg flex items-center gap-2">
          <Clock className="text-purple-500" />
          Ends in:{" "}
          <span className="font-semibold text-purple-400">
            {formatTime(timeRemaining)}
          </span>
        </p>
        <p className="text-lg flex items-center gap-2">
          <User className="text-purple-500" />
          Total Submissions:{" "}
          <span className="font-semibold text-gray-300">
            {submissions.length}
          </span>
        </p>
        <p className="text-lg flex items-center gap-2">
          <Music className="text-purple-500" />
          Total Votes:{" "}
          <span className="font-semibold text-gray-300">{totalVotes}</span>
        </p>
        <p className="text-lg flex items-center gap-2">
          <DollarSign className="text-purple-500" />
          Total Funds:{" "}
          <span className="font-semibold text-gray-300">
          {(Math.round(parseFloat(ethers.formatEther(BigInt(totalFunds || 0))) * 1000) / 1000).toFixed(3)} tBNB
          </span>
        </p>
      </div>
    </div>
  )}

  {/* Submissions Section */}
  {isLoading ? (
    <div className="flex justify-center items-center py-6 min-h-[70vh]">
      <Loader className="animate-spin text-purple-400" size={32} />
    </div>
  ) : submissions.length === 0 ? (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border border-gray-700">
      <h2 className="text-2xl font-bold text-gray-300 mb-4">No Submissions Yet!</h2>
      <p className="text-lg text-gray-400">
        Submit your track and be the first to set the theme!
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {submissions.map((submission, index) => (
        <div
          key={index}
          className="bg-gray-800 bg-opacity-75 p-4 rounded-lg shadow-md transition-transform hover:scale-105 border border-gray-700"
        >
          <h2 className="text-xl font-bold text-purple-400 mb-2"   onClick={() => alert(JSON.stringify(submission))}>
            Submission {index + 1}
          </h2>
          <p className="text-sm text-gray-400 mb-2">
  <strong>Submitter:</strong>{" "}
  <span className="block break-words">{submission[0]}</span>
</p>

          <div className="w-full mb-4 bg-gray-700 rounded-lg overflow-hidden"
        
          >

            
            <audio
              controls
              className="w-full"
              src={
                submission[1] 
              }
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
          {
  voters.includes(userAddr) ? (
    <span className="text-gray-500">Already Voted</span>
  ) : (
    <button
      className="bg-purple-800 text-gray-100 py-2 px-4 rounded-md shadow-md hover:bg-purple-700 transition"
      onClick={() => handleVote(index)}
    >
      Vote
    </button>
  )
}

        </div>
      ))}
    </div>
  )}

  <ToastContainer />
</div>


  );
};

export default TodayPage;
