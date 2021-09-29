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
    console.log("Admin deployed at:", adminContract.address);

    //--- deploy ticket generator and link to admin (index: 0)
    const ticketIndex = 0;
    const ticketGenerator = await deploy("NFTTicketGenerator", {
        from: deployer,
        args: [adminContract.address, 5e12],
    });
    await execute(
        "NoobFriendlyTokenAdmin",
        { from: deployer },
        "updateGenerator",
        ticketIndex, ticketGenerator.address
    );

    //--- deploy blindbox generator and link to admin (index: 1)
    const blindboxIndex = 1;
    const blindboxGenerator = await deploy("NFTBlindboxGenerator", {
        from: deployer,
        args: [adminContract.address, 1e11],
    });
    await execute(
        "NoobFriendlyTokenAdmin",
        { from: deployer },
        "updateGenerator",
        blindboxIndex, blindboxGenerator.address
    );
};


