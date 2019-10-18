const Splitter = artifacts.require("Splitter");
const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  // deployer.deploy(HitchensUnorderedKeySetLib);
  // deployer.link(HitchensUnorderedKeySetLib, HitchensUnorderedKeySet);
  // deployer.deploy(HitchensUnorderedKeySet);
  // deployer.deploy(UserCRUD);
  // deployer.link(HitchensUnorderedKeySet, UserCRUD);
  deployer.deploy(SafeMath);
  deployer.deploy(Splitter,"0x4ae6268E37A93332A64F7CB4c886b413968D982C","0xA0Ed27F3ce19F3f83EbE009400Ad369A813716B6","0xdF245DbCeBcb93C7CD115734F0EAdC295cdB2632");
  deployer.link(SafeMath, Splitter);
};
