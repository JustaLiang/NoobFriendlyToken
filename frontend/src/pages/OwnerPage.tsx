import React, { useContext, useEffect, useState } from 'react';
import { NoobFriendlyTokenAdminContext, ProviderContext, CurrentAddressContext } from "../hardhat/SymfoniContext";
import { ethers, BigNumberish } from "ethers";
import { IconButton } from "@material-ui/core";
import GeneratorCard from "../components/GeneratorCard";

type GeneratorType = {
    [key: number]: string
}

const generatorMap: GeneratorType = {
    0: "Ticket",
    1: "Blindbox",
    2: "Gallery",
}

const generatorTypes = [
    0, // Ticket
    1, // Blindbox
    2, // Gallery
]

interface Props { }

const OwnerPage: React.FC<Props> = () => {

    const adminContract = useContext(NoobFriendlyTokenAdminContext);
    const [provider,] = useContext(ProviderContext);
    const [account,] = useContext(CurrentAddressContext);
    const [noobBalance, setNoobBalance] = useState<BigNumberish>(0);

    useEffect(() => {
        const getNoobInfo = async () => {
            if (provider && adminContract.instance) {
                setNoobBalance(await provider.getBalance(adminContract.instance.address));
            }

        }
        getNoobInfo();
    }, [provider, adminContract]);

    const onWithdraw = async () => {
        if (adminContract.instance) {
            const tx = await adminContract.instance.release(account);
            const receipt = await tx.wait();
            if (receipt.status && provider) {
                setNoobBalance(await provider.getBalance(adminContract.instance.address))
            }
        }
    }

    return (<div>
        <h2>Noob Balance: {ethers.utils.formatEther(noobBalance)} ETH</h2>
        <IconButton onClick={onWithdraw}>withdraw</IconButton>
        { generatorTypes.map((typeIndex) => 
            <GeneratorCard
                key={typeIndex}
                typeIndex={typeIndex}
                typeName={generatorMap[typeIndex]}
            />) }
    </div>)
}

export default OwnerPage;