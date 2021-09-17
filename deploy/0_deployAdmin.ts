module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    //--- deploy admin contract
    await deploy("NoobFriendlyTokenAdmin", {
        from: deployer,
        args: [[deployer], [1]],
    });
};
