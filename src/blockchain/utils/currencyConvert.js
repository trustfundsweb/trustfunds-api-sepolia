// Convert ETH to Wei
function ethToWei(eth) {
  return eth * Math.pow(10, 18);
}

// Convert Wei to ETH
function weiToEth(wei) {
  return wei / Math.pow(10, 18);
}

module.exports = {
  ethToWei,
  weiToEth,
};
