const contract = artifacts.require("Diploma.sol");

module.exports = function(deployer, network) {
  deployer.deploy(contract);
};