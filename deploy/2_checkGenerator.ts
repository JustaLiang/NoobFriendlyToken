import { deployEnable } from "../control/DeployEnable"; 

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { get, read } = deployments;

    //--- check type 0: ticket
    if (deployEnable[0]) {
        const ticketGenerater = await get("NFTTicketGenerator");
        const ticketAddress = await read(
            "NoobFriendlyTokenAdmin",
            "typeToGenerator",  0);
        console.log("0 - Ticket:",
            ticketAddress === ticketGenerater.address ?
            "success" : "error");
    }

    //--- check type 1: blindbox
    if (deployEnable[1]) {
        const blindboxGenerater = await get("NFTBlindboxGenerator");
        const blindboxAddress = await read(
            "NoobFriendlyTokenAdmin",
            "typeToGenerator",  1);
        console.log("1 - Blindbox:",
            blindboxAddress === blindboxGenerater.address ?
            "success" : "error");
    }

    //--- check type 2: gallery
    if (deployEnable[2]) {
        const galleryGenerater = await get("NFTGalleryGenerator");
        const galleryAddress = await read(
            "NoobFriendlyTokenAdmin",
            "typeToGenerator",  2);
        console.log("2 - Gallery:",
            galleryAddress === galleryGenerater.address ?
            "success" : "error");
    }
};
