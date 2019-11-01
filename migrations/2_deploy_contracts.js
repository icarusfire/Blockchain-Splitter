const Splitter = artifacts.require("Splitter");
//const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  // deployer.deploy(HitchensUnorderedKeySetLib);
  // deployer.link(HitchensUnorderedKeySetLib, HitchensUnorderedKeySet);
  // deployer.deploy(HitchensUnorderedKeySet);
  // deployer.deploy(UserCRUD);
  // deployer.link(HitchensUnorderedKeySet, UserCRUD);
  //deployer.deploy(SafeMath);
  deployer.deploy(Splitter);
  //deployer.link(Splitter);
};
