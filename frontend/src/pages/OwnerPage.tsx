import React, { useContext, useEffect, useState } from 'react';
import { NoobFriendlyTokenAdminContext, ProviderContext, CurrentAddressContext, SignerContext } from "../hardhat/SymfoniContext";
import { ethers, BigNumberish } from "ethers";
import { IconButton, Button } from "@material-ui/core";
import GeneratorCard from "../components/GeneratorCard";
import { IERC721Metadata__factory } from '../hardhat/typechain/factories/IERC721Metadata__factory';

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
    const [signer,] = useContext(SignerContext);
    const [provider,] = useContext(ProviderContext);
    const [account,] = useContext(CurrentAddressContext);
    const [noobBalance, setNoobBalance] = useState<BigNumberish>(0);
    const [checkAddr, setCheckAddr] = useState<string>("");
    const [tokenURI, setTokenURI] = useState<string>("");

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

    const onInputContractAddr = (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value);
        if (e.target.value) {
            setCheckAddr(e.target.value);
        }
    }

    const onCheckMint = async () => {
        if (checkAddr) {
            const connector = signer?signer:provider;
            if (connector) {
                const target = IERC721Metadata__factory.connect(checkAddr, connector);
                try {
                    setTokenURI(await target.tokenURI(0));
                }
                catch (err) {
                    console.log(err);
                    setTokenURI("token not exist");
                }
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
            />
        )}
        <input
            type="text"
            onChange={onInputContractAddr}
        />
        <Button onClick={onCheckMint}>
                check mint
        </Button>
        <p>{tokenURI}</p>
    </div>)
}

export default OwnerPage;