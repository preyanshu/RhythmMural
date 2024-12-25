import React, { useState, useEffect } from "react";
import { Trophy, Users, DollarSign, Calendar, Loader ,Music} from "lucide-react";

const PreviousPage = () => {
  const [contests, setContests] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy function to simulate data fetching
  const fetchContests = () => {
    setTimeout(() => {
      setContests([
        [
          "submitter",
          "/path/to/audio1.mp3",
          "theme",
          "prompt",
          "120", // votes as string
          "500", // payout as string
          "1708732800", // UNIX timestamp as string
          "50", // voterShare as string
        ],
        [
          "submitter2",
          "/path/to/audio2.mp3",
          "theme",
          "prompt2",
          "90", // votes as string
          "300", // payout as string
          "1708732800", // UNIX timestamp as string (same contest)
          "50", // voterShare as string
        ],
        [
          "submitter3",
          "/path/to/audio3.mp3",
          "theme",
          "prompt3",
          "150", // votes as string
          "400", // payout as string
          "1708732800", // UNIX timestamp as string (new contest)
          "40", // voterShare as string
        ],
      ]);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    fetchContests();
  }, []);

  // Helper function to convert UNIX timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp, 10) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group contests based on theme, timestamp, and voterShare
  const groupedContests = contests
    ? contests.reduce((acc, winner) => {
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
    <div className="w-[100vw] max-w-[24rem] bg-white min-h-screen p-4">
      <h1 className="text-xl font-bold mb-8 text-blue-600 mt-4 w-full text-center"> <Music className="inline " /> Here’s What Won Last Time</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-gray-600 w-8 h-8" />
        </div>
      ) : (
        groupedContests.map((contest, contestIndex) => (
          <div
            key={contestIndex}
            className="border border-gray-200 rounded-lg p-4 mb-6 shadow-sm"
          >
            <div className="flex items-center mb-2">
              <Trophy className="text-yellow-500 mr-2" />
              <h2 className="text-xl font-semibold">{contest.theme}</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Voter Share: <span className="font-medium">${contest.voterShare}</span>
            </p>
            <p className="text-gray-500 mb-4">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              {formatDate(contest.timestamp)}
            </p>

            {contest.winners.map((winner, winnerIndex) => (
              <div
                key={winnerIndex}
                className="bg-gray-50 p-3 rounded-lg mb-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">Winner {winnerIndex + 1}: {winner.submitter}</p>
                </div>
                <p className="text-gray-700 text-sm mb-2">
                  Prompt: <span className="italic">{winner.prompt}</span>
                </p>
                <div className="text-sm text-gray-600">
                  <audio controls className="w-full">
                    <source src={winner.musicUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Users className="text-purple-500 w-4 h-4" />
                    <p className="text-gray-700 text-sm">Votes: {winner.votes}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-green-500 w-4 h-4" />
                    <p className="text-gray-700 text-sm">Payout: {winner.payout} tBNB</p>
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
