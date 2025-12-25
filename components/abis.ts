export const POOL_ABI = [
  { type: "function", name: "rateWad", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "quote", stateMutability: "view", inputs: [{ name: "avaxAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "deposit", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "depositedAvax", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

export const ERC20_ABI = [
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;
