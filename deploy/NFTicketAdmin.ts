module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { deploy, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
    const adminContract = await deploy("NFTicketAdmin", {
        from: deployer,
        // gas: 4000000,
        args: [[deployer], [1]],
    });
    const duplicateGenerator = await deploy("NFTicketDuplicateGenerator", {
        from: deployer,
        // gas: 4000000,
        args: [adminContract.address, 1e12],
    });
    
    await execute(
        "NFTicketAdmin", 
        {from: deployer, log: true},
        "updateTemplateType",
        0, duplicateGenerator.address
    );
};
