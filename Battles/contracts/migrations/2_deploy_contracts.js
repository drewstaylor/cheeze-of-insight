let Wizards=artifacts.require('WizardPresale.sol')
let Guild= artifacts.require('WizardGuild.sol')
let DuelSim=artifacts.require('ThreeAffinityDuelResolver.sol')
let Tournament=artifacts.require('BasicTournament.sol')
let S=artifacts.require('Simple.sol')
function deployContracts(deployer) {

    deployer.then(async () => {
        await deployer.deploy(DuelSim)
       
    })

}    
module.exports = deployContracts;