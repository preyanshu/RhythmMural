// utils/contractUtils.js
import { ethers } from 'ethers';

// Contract ABI and address
const contractABI =[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_interval",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "depositor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundsDeposited",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "performUpkeep",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "submitter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "musicUrl",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "theme",
				"type": "string"
			}
		],
		"name": "SubmissionAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_musicUrl",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_theme",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_prompt",
				"type": "string"
			}
		],
		"name": "submitMusic",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_submissionIndex",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "submissionIndex",
				"type": "uint256"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "VoterRewarded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "musicUrl",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "theme",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "votes",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "WinnerSelected",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "checkUpkeep",
		"outputs": [
			{
				"internalType": "bool",
				"name": "upkeepNeeded",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentTheme",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getSubmissions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "submitter",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "musicUrl",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "theme",
						"type": "string"
					}
				],
				"internalType": "struct MusicContest.SubmissionOverview[]",
				"name": "",
				"type": "tuple[]"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getWinners",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "submitter",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "musicUrl",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "theme",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "prompt",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "votes",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "payout",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "voterShare",
						"type": "uint256"
					}
				],
				"internalType": "struct MusicContest.Winner[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "interval",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastTimeStamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SUBMISSION_FEE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalFunds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const contractAddress = "0x320C41794259bFaF8370c857322FcD29633f6C5C";


function normalizeProxyData(data: any): any {
	return JSON.parse(
	  JSON.stringify(data, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
	);
  }
  
  // Function to create contract instance with signer
  function getContract(signer: ethers.Signer): ethers.Contract {
	return new ethers.Contract(contractAddress, contractABI, signer);
  }
  
  // Function to get the submission fee
  export async function getSubmissionFee(walletSdk: any): Promise<string> {
	const provider = new ethers.BrowserProvider(walletSdk.ethereum);
	const signer = await provider.getSigner();
	const contract = getContract(signer);
	const fee: any = await contract.SUBMISSION_FEE();
	return fee.toString();
  }
  
  // Function to submit music
  export async function submitMusic(
	walletSdk: any,
	musicUrl: string,
	theme: string,
	prompt: string
  ): Promise<void> {
	const provider = new ethers.BrowserProvider(walletSdk.ethereum);
	const signer = await provider.getSigner();
	const contract = getContract(signer);
	const submissionFee:any = await contract.SUBMISSION_FEE();
	const transaction = await contract.submitMusic(musicUrl, theme, prompt, {
	  value: submissionFee,
	});
	await transaction.wait();
  }
  
  // Function to fetch submissions
  export async function getContestDetails(walletSdk: any): Promise<any[]> {
	const provider = new ethers.BrowserProvider(walletSdk.ethereum);
	const signer = await provider.getSigner();
	const contract = getContract(signer);
	const submissions = await contract.getSubmissions();
	return normalizeProxyData(submissions);
  }
  
  // Function to fetch winners
  export async function getWinners(walletSdk: any): Promise<any[]> {
	const provider = new ethers.BrowserProvider(walletSdk.ethereum);
	const signer = await provider.getSigner();
	const contract = getContract(signer);
	const winners = await contract.getWinners();
	return normalizeProxyData(winners);
  }
  
  // Function to vote for a submission
  export async function voteOnSubmission(walletSdk: any, submissionIndex: number): Promise<void> {
	const provider = new ethers.BrowserProvider(walletSdk.ethereum);
	const signer = await provider.getSigner();
	const contract = getContract(signer);
	const transaction = await contract.vote(submissionIndex);
	await transaction.wait();
  }

  export async function getCurrentTheme(walletSdk: any): Promise<string> {
	const provider = new ethers.BrowserProvider(walletSdk.ethereum);
	const signer = await provider.getSigner();
	const contract = getContract(signer);
	const theme: any = await contract.currentTheme();
	return theme;
  }
