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

// timings (ms) copied verbatim from the approved artifact's boot clock
export const BOOT = {
  bracketStart: 60,
  edgeStart: 360,
  igniteStart: 1240,
  compassStart: 1720,
  sonarStart: 1740,
  textAt: 2180,
  textCommitAt: 3300,
  idleAt: 3250,
  commitAt: 4500,
} as const;
