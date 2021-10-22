import React, { useContext, useEffect, useState } from 'react';
import { GeneratorInterface } from "../hardhat/typechain/GeneratorInterface";
import { NoobFriendlyTokenAdminContext, ProviderContext, CurrentAddressContext } from "../hardhat/SymfoniContext";
import { ethers, BigNumberish } from "ethers";
import { IconButton } from "@material-ui/core";

interface Props { }

const OwnerPage: React.FC<Props> = () => {

    const adminContract = useContext(NoobFriendlyTokenAdminContext);
    const [provider,] = useContext(ProviderContext);
    const [account,] = useContext(CurrentAddressContext);
    const [adminBalance, setAdminBalance] = useState<BigNumberish>(0);

    useEffect(() => {
        const getAdminBalance = async () => {
            if (provider && adminContract.instance) {
                setAdminBalance(await provider.getBalance(adminContract.instance.address));
            }
        }
        getAdminBalance();
    }, [provider, adminContract]);

    const onWithdraw = async () => {
        if (adminContract.instance) {
            const tx = await adminContract.instance.release(account);
            const receipt = await tx.wait();
            if (receipt.status && provider) {
                setAdminBalance(await provider.getBalance(adminContract.instance.address))
            }
        }
    }

    return (<div>
        <h2>Admin Balance: {ethers.utils.formatEther(adminBalance)} ETH</h2>
        <IconButton onClick={onWithdraw}>withdraw</IconButton>
    </div>)
}

export default OwnerPage;