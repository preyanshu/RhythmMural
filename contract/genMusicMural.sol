// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

contract MusicContest is AutomationCompatibleInterface {
    
    uint256 public immutable interval;
    uint256 public lastTimeStamp;
    uint256 public totalFunds;
    uint256 public constant SUBMISSION_FEE = 2000000000000000;
    address public owner;

    struct Submission {
        address submitter;
        string musicUrl;
        string theme;
        string prompt;
        uint256 votes;
        address[] voters; 
    }

    struct Winner {
        address submitter;
        string musicUrl;
        string theme;
        string prompt;
        uint256 votes;
        uint256 payout;
        uint256 timestamp;
        uint256 voterShare;
    }

    struct SubmissionOverview {
        address submitter;
        string musicUrl;
        string theme;
     
    }

    Submission[] internal submissions;
    Winner[] internal winners;
    string public currentTheme;
    address[] private voters; // Array to store voter addresses

    /* Events */
    event SubmissionAdded(address indexed submitter, string musicUrl, string theme);
    event WinnerSelected(address indexed winner, string musicUrl, string theme, uint256 votes, uint256 payout);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event Voted(address indexed voter, uint256 indexed submissionIndex);
    event VoterRewarded(address indexed voter, uint256 reward);
    event NoWinnersDeclared(string message);
    event InsufficientFunds(string message);



    constructor(uint256 _interval) {
        interval = _interval;
        lastTimeStamp = block.timestamp;
        owner = msg.sender;
    }

    function submitMusic(string memory _musicUrl, string memory _theme, string memory _prompt) external payable {
        require(msg.value == SUBMISSION_FEE, "Submission fee is 0.02 native coin");
        totalFunds += msg.value;

        address[] memory addresses;

        if (bytes(currentTheme).length == 0 && bytes(_theme).length > 0) {
            currentTheme = _theme;
        }

        submissions.push(Submission(msg.sender, _musicUrl, _theme, _prompt, 0, addresses));
        emit SubmissionAdded(msg.sender, _musicUrl, currentTheme);
    }

    function vote(uint256 _submissionIndex) external {
        require(_submissionIndex < submissions.length, "Invalid submission index");
        require(!_hasVoted(msg.sender), "You have already voted");

        submissions[_submissionIndex].votes += 1;
        submissions[_submissionIndex].voters.push(msg.sender);
        voters.push(msg.sender); // Add voter to the voters array

        emit Voted(msg.sender, _submissionIndex);
    }

    /* Helper function to check if an address has already voted */
    function _hasVoted(address _voter) internal view returns (bool) {
        for (uint256 i = 0; i < voters.length; i++) {
            if (voters[i] == _voter) {
                return true;
            }
        }
        return false;
    }

    /* Chainlink Automation: Check if upkeep is needed */
    function checkUpkeep(bytes memory /* checkData */)
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval && submissions.length > 0;
        return (upkeepNeeded, "0x0");
    }

/* Chainlink Automation: Perform upkeep */

function performUpkeep(bytes calldata /* performData */) external override {
    (bool upkeepNeeded, ) = checkUpkeep("");
    if (!upkeepNeeded) {
        revert("Upkeep not needed");
    }

    // Call the internal function to process the contest
    this.processContest();
}

/* Internal function to process the contest */
function processContest() external {
    // Update the timestamp regardless of the outcome
    lastTimeStamp = block.timestamp;

    // If no submissions, declare no winners and return
    if (submissions.length == 0) {
        emit NoWinnersDeclared("No submissions available for processing");
        delete currentTheme;
        delete voters;
        totalFunds = 0 ; 
        return;
    }

    // Check if the contract has sufficient funds
    if (address(this).balance < totalFunds) {
        emit InsufficientFunds("Contract does not have enough balance to distribute rewards");
        delete submissions;
        delete currentTheme;
        delete voters;
        totalFunds = 0 ; 
        return;
    }

    uint256 numWinners = submissions.length > 3 ? 3 : submissions.length; // Max 3 winners or less, depending on submissions

    // Find the top submissions using a simplified sorting approach
    uint256[] memory indices = new uint256[](numWinners);
    uint256[] memory topVotes = new uint256[](numWinners);

    for (uint256 i = 0; i < submissions.length; i++) {
        uint256 minIndex = 0;
        for (uint256 k = 1; k < numWinners; k++) {
            if (topVotes[k] < topVotes[minIndex]) {
                minIndex = k;
            }
        }

        if (submissions[i].votes > topVotes[minIndex]) {
            topVotes[minIndex] = submissions[i].votes;
            indices[minIndex] = i;
        }
    }

    // Calculate total votes for the top winners
    uint256 totalWinnerVotes = 0;
    for (uint256 i = 0; i < numWinners; i++) {
        totalWinnerVotes += topVotes[i];
    }

    // Count total voters (number of voters in all submissions)
    uint256 totalVoters = 0;
    for (uint256 i = 0; i < numWinners; i++) {
        totalVoters += submissions[indices[i]].voters.length;
    }

    // Calculate owner, winner, and voter shares
    uint256 ownerShare = (totalFunds * 5) / 100; // 5% for owner
    uint256 remainingFunds = totalFunds - ownerShare;

    uint256 winnerShare;
    uint256 voterShare;

    if (totalVoters == 0) {
        // If no voters, allocate all remaining funds to the winners
        winnerShare = remainingFunds;
        voterShare = 0;
    } else {
        // Add weight to winners: Increase the winner share by a factor (e.g., 2x)
        uint256 totalWeight = (numWinners * 3) + totalVoters;  // Winner weight is 3x
        winnerShare = (remainingFunds * (numWinners * 3)) / totalWeight;
        voterShare = remainingFunds - winnerShare;
    }

    // Transfer 5% to the contract owner
    if (owner != address(0) && ownerShare > 0) {
        payable(owner).transfer(ownerShare);
    }

    // Distribute rewards among winners and voters
    for (uint256 i = 0; i < numWinners; i++) {
        uint256 index = indices[i];
        uint256 payout = totalWinnerVotes == 0 ? (winnerShare / numWinners) : (submissions[index].votes * winnerShare) / totalWinnerVotes;

        winners.push(
            Winner({
                submitter: submissions[index].submitter,
                musicUrl: submissions[index].musicUrl,
                theme: submissions[index].theme,
                prompt: submissions[index].prompt,
                votes: submissions[index].votes,
                payout: payout,
                timestamp: block.timestamp,
                voterShare: voterShare
            })
        );

        if (payout > 0 && submissions[index].submitter != address(0)) {
            payable(submissions[index].submitter).transfer(payout);
            emit WinnerSelected(
                submissions[index].submitter,
                submissions[index].musicUrl,
                submissions[index].theme,
                submissions[index].votes,
                payout
            );
        }

        // Handle voter rewards
        if (submissions[index].voters.length > 0) {
            uint256 voterReward = voterShare / submissions[index].voters.length;
            for (uint256 j = 0; j < submissions[index].voters.length; j++) {
                if (voterReward > 0 && submissions[index].voters[j] != address(0)) {
                    payable(submissions[index].voters[j]).transfer(voterReward);
                    emit VoterRewarded(submissions[index].voters[j], voterReward);
                }
            }
        }
    }

    // Clear submissions and theme
    delete submissions;
    delete voters;
    delete currentTheme;
    totalFunds = 0 ; 
}


    /* Get all submissions */
    function getSubmissions() external view returns (SubmissionOverview[] memory, uint256 ,uint256,uint256, address[] memory) {
    uint256 submissionCount = submissions.length;
    SubmissionOverview[] memory submissionOverviews = new SubmissionOverview[](submissionCount);

    uint256 totalVotes = 0;

    // Loop through submissions and calculate the votes for each submission
    for (uint256 i = 0; i < submissionCount; i++) {
        uint256 submissionVotes = submissions[i].voters.length;
        
        // Sum up the total votes for all submissions
        totalVotes += submissionVotes;

        // Assign the submission details to the SubmissionOverview array
        submissionOverviews[i] = SubmissionOverview({
            submitter: submissions[i].submitter,
            musicUrl: submissions[i].musicUrl,
            theme: submissions[i].theme
            
        });
    }

    // Return the array of submissions and the total votes
    return (submissionOverviews, totalVotes ,totalFunds , lastTimeStamp , voters );
}


    /* Get all winners */
    function getWinners() external view returns (Winner[] memory) {
        return winners;
    }

    function getCurrentTheme() external view returns (string memory){
        return currentTheme;
    }
}