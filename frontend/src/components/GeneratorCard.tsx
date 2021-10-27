import React, { useContext, useState, useEffect } from "react";
import { NoobFriendlyTokenAdminContext } from "../hardhat/SymfoniContext";
import { NoobFriendlyTokenGenerator__factory } from "../hardhat/typechain/factories/NoobFriendlyTokenGenerator__factory";
import { NoobFriendlyTokenGenerator } from "../hardhat/typechain/NoobFriendlyTokenGenerator";
import { ProviderContext, SignerContext } from "../hardhat/SymfoniContext";
import { Card, CardContent, Typography, Button } from "@material-ui/core";
import { BigNumber, utils, constants } from "ethers";

interface Props {
    typeIndex: number,
    typeName: string,
}

const GeneratorCard: React.FC<Props> = (props) => {
    
    const { typeIndex, typeName } = props;
    const adminContract = useContext(NoobFriendlyTokenAdminContext);
    const [genAddr, setGenAddr] = useState<string>(constants.AddressZero);
    const [generator, setGenerator] = useState<NoobFriendlyTokenGenerator>();
    const [signer,] = useContext(SignerContext);
    const [provider,] = useContext(ProviderContext);
    const [slottingFee, setSlottingFee] = useState<BigNumber>(BigNumber.from(0));
    const [slottingFeeText, setSlottingFeeText] = useState<string>("");

    useEffect(() => {
        const getGeneratorAddr = async () => {
            if (adminContract.instance) {
                setGenAddr(await adminContract.instance.typeToGenerator(typeIndex));
            }
        }
        getGeneratorAddr();
    }, [adminContract, typeIndex]);

    useEffect(() => {
        if (signer && genAddr !== constants.AddressZero) {
            setGenerator(NoobFriendlyTokenGenerator__factory.connect(genAddr, signer));
        }
        else if (provider && genAddr !== constants.AddressZero) {
            setGenerator(NoobFriendlyTokenGenerator__factory.connect(genAddr, provider));
        }
    }, [genAddr, signer, provider]);

    useEffect(() => {
        const getSlottingFee = async () => {
            if (generator) {
                setSlottingFee(await generator.slottingFee());
            }
        }
        getSlottingFee();
    }, [generator]);

    const onInputSlottingFee = (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value);
        if (e.target.value) {
            setSlottingFeeText(e.target.value);
        }
    }

    const onChangeSlottingFee = async () => {
        if (generator) {
            try {
                const newSlottingFee = utils.parseEther(slottingFeeText);
                const tx = await generator.updateSlottingFee(newSlottingFee);
                const receipt = await tx.wait();
                if (receipt.status) {
                    setSlottingFee(await generator.slottingFee());
                }
            }
            catch (err) {
                alert(err);
            }
        }
    }

    return <Card>
        <CardContent>
            <Typography variant='h6' align='left'>
                type: {typeName}
            </Typography>
            <Typography variant='h6' align='left'>
                slotting fee: {utils.formatEther(slottingFee)}
            </Typography>
            <Button onClick={onChangeSlottingFee}>
                change
            </Button>
            <input
                type="text"
                onChange={onInputSlottingFee}
            />
        </CardContent>
    </Card>
}

export default GeneratorCard;