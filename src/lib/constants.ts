export default {
  validatorUrl: process.env.REACT_APP_ARB_VALIDATOR_URL || "",
  distributionAddress:
    process.env.REACT_APP_DISTRIBUTION_CONTRACT_ADDRESS || "",
  tokenAddress: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || "",
};
