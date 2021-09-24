module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { get, read } = deployments;

    //--- check type 0: ticket
    const ticketGenerater = await get("NFTTicketGenerator");
    const ticketAddress = await read(
        "NoobFriendlyTokenAdmin",
        "typeToGenerator",  0);
    console.log("0 - Ticket:",
        ticketAddress === ticketGenerater.address ?
        "success" : "error");

    //--- check type 1: blindbox
    const blindboxGenerater = await get("NFTBlindboxGenerator");
    const blindboxAddress = await read(
        "NoobFriendlyTokenAdmin",
        "typeToGenerator",  1);
    console.log("1 - Blindbox:",
        blindboxAddress === blindboxGenerater.address ?
        "success" : "error");
};
