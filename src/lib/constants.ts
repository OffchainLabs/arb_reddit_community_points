export default {
  validatorUrl: process.env.REACT_APP_ARB_VALIDATOR_URL || "http://127.0.0.1:8547",
  distributionAddress:
    process.env.REACT_APP_DISTRIBUTION_CONTRACT_ADDRESS || "0xD3d21714F1A7F1575B827C15528189EFF61B7F20",
  tokenAddress: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "0x6a1d27B150e2c4E117655B752ea484aCf062B807",
  networkId: process.env.REACT_APP_NETWORK_ID,
};
