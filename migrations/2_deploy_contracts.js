const Splitter = artifacts.require("Splitter");
const UserCRUD = artifacts.require("UserCRUD");
const HitchensUnorderedKeySet = artifacts.require("HitchensUnorderedKeySet");
const HitchensUnorderedKeySetLib = artifacts.require("HitchensUnorderedKeySetLib");



module.exports = function(deployer) {
  deployer.deploy(HitchensUnorderedKeySetLib);
  deployer.link(HitchensUnorderedKeySetLib, HitchensUnorderedKeySet);	
  deployer.deploy(HitchensUnorderedKeySet);
  deployer.deploy(UserCRUD);
  deployer.link(HitchensUnorderedKeySet, UserCRUD);
  deployer.deploy(Splitter);
  deployer.link(UserCRUD, Splitter);
};
