import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { avalancheFuji } from "wagmi/chains";
import { POOL_ABI, ERC20_ABI } from "@/components/abis";

const poolAddress = process.env.NEXT_PUBLIC_POOL_ADDRESS as `0x${string}`;
const avax0Address = process.env.NEXT_PUBLIC_AVAX0_ADDRESS as `0x${string}`;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [avaxIn, setAvaxIn] = useState("0.1");

  // Wallet AVAX balance
  const { data: avaxBal } = useBalance({ address });

  // Read pool rate
  const { data: rateWad } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: "rateWad",
  });

  // Quote output
  const avaxAmountWei = useMemo(() => {
    try { return parseEther(avaxIn || "0"); } catch { return 0n; }
  }, [avaxIn]);

  const { data: quoteOut } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: "quote",
    args: [avaxAmountWei],
  });

  // AVAX0 decimals & user balance
  const { data: avax0Decimals } = useReadContract({
    address: avax0Address,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  const { data: avax0Symbol } = useReadContract({
    address: avax0Address,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  const { data: avax0Bal } = useReadContract({
    address: avax0Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : ["0x0000000000000000000000000000000000000000"],
    query: { enabled: Boolean(address) },
  });

  // Pool AVAX0 balance
  const { data: poolAvax0Bal } = useReadContract({
    address: avax0Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [poolAddress],
  });

  // User deposited AVAX (from contract storage)
  const { data: userDeposited } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: "depositedAvax",
    args: address ? [address] : ["0x0000000000000000000000000000000000000000"],
    query: { enabled: Boolean(address) },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function onDeposit() {
    if (!isConnected) return;
    await writeContractAsync({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: "deposit",
      value: avaxAmountWei,
      account: address,
      chain: avalancheFuji,
    });
  }

  return (
    <div className="container">
      <div className="hero">
        <div>
          <div className="title">AVAX - AVAX0 Bonding Pool</div>
          <div className="subtitle">Fuji test · Live quotes · Instant mint</div>
        </div>
        <ConnectButton />
      </div>

      <div className="card">
        <h3>Status</h3>
        <div className="grid-2">
          <div className="stat">
            <div className="label">Pool Address</div>
            <div className="value">{poolAddress}</div>
          </div>
          <div className="stat">
            <div className="label">AVAX0 Token</div>
            <div className="value">{avax0Address}</div>
          </div>
        </div>
        <div className="grid" style={{ marginTop: 12 }}>
          <div className="stat">
            <div className="label">Your AVAX</div>
            <div className="value">
              {avaxBal ? `${avaxBal.formatted} ${avaxBal.symbol}` : "-"}
            </div>
          </div>
          <div className="stat">
            <div className="label">Your {avax0Symbol ?? "AVAX0"}</div>
            <div className="value">
              {avax0Bal !== undefined ? `${formatEther(avax0Bal)} ${avax0Symbol ?? ""}` : "-"}
            </div>
          </div>
          <div className="stat">
            <div className="label">Your Deposited AVAX</div>
            <div className="value">
              {userDeposited !== undefined ? `${formatEther(userDeposited)} AVAX` : "-"}
            </div>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="stat">
            <div className="label">Pool AVAX0 Balance</div>
            <div className="value">
              {poolAvax0Bal !== undefined ? `${formatEther(poolAvax0Bal)} ${avax0Symbol ?? ""}` : "-"}
            </div>
          </div>
          <div className="stat">
            <div className="label">Rate (Wad)</div>
            <div className="value">{rateWad !== undefined ? rateWad.toString() : "-"}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Deposit</h3>
        <div className="row">
          <input
            className="input"
            value={avaxIn}
            onChange={(e) => setAvaxIn(e.target.value)}
          />
          <button className="button" onClick={onDeposit} disabled={!isConnected || isPending}>
            {isPending ? "Depositing..." : "Deposit AVAX"}
          </button>
        </div>
        <div className="quote">
          Quote: {quoteOut !== undefined ? `${formatEther(quoteOut)} ${avax0Symbol ?? "AVAX0"}` : "-"}
        </div>
      </div>

      <div className="card">
        <h3>Notes</h3>
        <ul className="note">
          <li>This is a test for Fuji only.</li>
          <li>Deposits are <b>non-refundable</b> by design.</li>
          <li>If the pool AVAX0 balance is low, deposits will revert.</li>
        </ul>
      </div>
    </div>
  );
}
