require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  const provider = await hre.ethers.getDefaultProvider();

  for (const account of accounts) {
    console.log(account.address);
    let balance = await provider.getBalance(account.address);
    let balanceInEth = hre.ethers.utils.formatEther(balance);
    console.log(`eth balance @${account.address}: ${balanceInEth} ETH`);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
};
