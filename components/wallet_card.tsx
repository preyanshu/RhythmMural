import React from 'react'
import { useAuth } from '@/context/AuthContext';

const WalletCard = () => {
  const { userAddr, chainId, logIn, logOut } = useAuth();

  return (
    <div className="card">
				<h1 className="card-title">Connect UXUY Wallet</h1>
				<p className="card-subtitle">
					Connect your wallet to get started
				</p>

				{userAddr ? (
					<div className="space-y-4">
						<p className="connected-text">
							Address:{' '}
							<span className="connected-username">
								{userAddr.slice(0, 6)}...{userAddr.slice(-6)}
							</span>
						</p>
						{chainId && (
							<p className="connected-text">
								ChainId:{' '}
								<span className="connected-username">
									{chainId}
								</span>
							</p>
						)}
						<button
							onClick={logOut}
							className="button button-disconnect"
						>
							Disconnect Wallet
						</button>
					</div>
				) : (
					<button onClick={logIn} className="button button-connect">
						Connect Wallet
					</button>
				)}
			</div>
  )
}

export default WalletCard