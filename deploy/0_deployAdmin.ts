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
        args: [
            [
                "0x98d0EFf29037C2F60054ED9F01f297aDb1875732",
                "0x1BA85548aFFb8053b3520115fB2D1C437a5fbAaf",
                "0xb4DC6768F24FE285B88547DBb180888835c2d2F6",
            ],
            [
                4,
                4,
                2,
            ]
        ],
    });
};
