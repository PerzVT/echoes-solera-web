export const CONTENT = {
  heading: "AUTHENTICATION ERROR",
  body:
    "This code has already been claimed. If you do not know or have forgotten your log in and password and need to reset your account, please contact 9lives Innovation support with your current account details and player ID number.",
  highlight: "9lives Innovation",
} as const;

export const PALETTE = {
  bg: "#050208",
  p: "#B96CE6",
  pBright: "#E6B8FF",
  pDim: "#7a4fa0",
} as const;

// Boot sequence timings (ms from page mount).
// The dive scene fades in at 4600ms (awaken phase). Medallion ignite,
// text signal-lock, and idle settle must START after the scene is
// visible, otherwise the animations run while the parent is opacity:0
// and the medallions just pop in with no entrance.
export const BOOT = {
  igniteStart: 4800,
  textAt: 9200,
  textCommitAt: 10300,
  idleAt: 9600,
  commitAt: 11000,
} as const;
