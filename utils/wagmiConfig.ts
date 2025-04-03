import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// 🌟 Get your project ID from WalletConnect Cloud
const projectId = 'YOUR_PROJECT_ID';

// ✅ Use RainbowKit's recommended `getDefaultConfig`
export const wagmiConfig = getDefaultConfig({
  appName: 'Your DApp',
  projectId,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false, // Optional: Disable SSR for Next.js
});
