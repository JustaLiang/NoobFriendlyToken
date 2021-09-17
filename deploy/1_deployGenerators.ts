module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { deploy, get, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    //--- get admin contract
    const adminContract = await get("NoobFriendlyTokenAdmin");

    //--- deploy ticket generator and link to admin (index: 0)
    const ticketIndex = 0;
    const ticketGenerator = await deploy("NFTTicketGenerator", {
        from: deployer,
        args: [adminContract.address, 1e12],
    });
    await execute(
        "NoobFriendlyTokenAdmin",
        { from: deployer, log: true },
        "updateGenerator",
        ticketIndex, ticketGenerator.address
    );
};


