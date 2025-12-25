import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { avalancheFuji } from "wagmi/chains";
import { http } from "viem";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [config, setConfig] = useState<ReturnType<typeof getDefaultConfig> | null>(null);

  useEffect(() => {
    setConfig(
      getDefaultConfig({
        appName: "AVAX0 Bonding Pool Tester",
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        chains: [avalancheFuji],
        transports: {
          [avalancheFuji.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
        },
      })
    );
  }, []);

  if (!config) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
