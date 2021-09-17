import React, { useContext, useEffect, useState } from 'react';
import { CurrentAddressContext, NoobFriendlyTokenAdminContext } from "../hardhat/SymfoniContext";
import { NFTTemplateCard } from "./NFTTemplateCard";
import { TextField, Button, Box, InputLabel, NativeSelect, FormControl } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NFTTypeArray } from "./NFTTypeArray";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: 500,
    },
    filled: {
        background: '#FFF1E6',
        borderRadius: 5,
        marginRight: theme.spacing(1),
        width: 190,
        height: 50,
        paddingBottom: 10,
    },
    button: {
        width: 190,
    },
    tmpList: {
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 30,
        width: 950,
        gap: 20,
        overflowX: "scroll",
        border: '0.5px solid rgba(0, 0, 0, 0.125)',
    }
}));

interface Props { }

interface BaseSettings {
    name: string,
    symbol: string,
    payees: string[],
    shares: number[],
    typeOfNFT: number,
    maxSupply: number,
}

export const AdminContract: React.FC<Props> = () => {
    const classes = useStyles();
    const admin = useContext(NoobFriendlyTokenAdminContext);
    const account = useContext(CurrentAddressContext);
    const [contractList, setContractList] = useState<string[]>([]);
    const [baseSettings, setBaseSettings] = useState<BaseSettings>({
        name: "",
        symbol: "",
        payees: [account[0]],
        shares: [1],
        typeOfNFT: -1,
        maxSupply: 0,
    });
    useEffect(() => {
        const checkAdminContract = async () => {
            if (!admin.instance) return
            console.log("AdminContract is deployed at ", admin.instance.address)
            setContractList(await admin.instance.getContractList())
        };
        checkAdminContract();
    }, [admin])

    const genNFTContract = async () => {
        if (!admin.instance) throw Error("Admin instance not ready");
        if (admin.instance) {
            const fee = await admin.instance.slottingFee(baseSettings.typeOfNFT)
                .then((fee) => { return fee })
                .catch(() => { return null })
            if (fee) {
                const totalFee = fee.mul(baseSettings.maxSupply)
                const tx = await admin.instance.genNFTContract(baseSettings, { value: totalFee })
                await tx.wait();
                setContractList(await admin.instance.getContractList())
            }
        }
    }

    return (
        <div>
            <Box>
                <form
                    onSubmit={(e: React.SyntheticEvent) => {
                        e.preventDefault()
                        genNFTContract()
                    }}
                    className={classes.root}
                >
                    <TextField label="name" className={classes.filled} onChange={(e) => {
                        setBaseSettings({ ...baseSettings, name: e.target.value }) }}
                    />
                    <TextField label="symbol" className={classes.filled} onChange={(e) => {
                        setBaseSettings({ ...baseSettings, symbol: e.target.value }) }}
                    />
                    <FormControl className={classes.filled}>
                        <InputLabel htmlFor="ticket-type">ticket type</InputLabel>
                        <NativeSelect
                            id="ticket-type"
                            value={baseSettings.typeOfNFT < 0 ? '' : baseSettings.typeOfNFT}
                            onChange={(e) => {
                                if(e.target.value)
                                    setBaseSettings({ ...baseSettings, typeOfNFT: parseInt(e.target.value) })}}
                        >
                            <option aria-label="None" value='' />
                            {NFTTypeArray.map((typeName, idx)=>
                                <option key={idx} value={idx}>{typeName}</option>
                            )}
                        </NativeSelect>
                    </FormControl>
                    <TextField label="max supply" className={classes.filled} onChange={(e) => {
                        setBaseSettings({ ...baseSettings, maxSupply: parseInt(e.target.value) }) }}
                    />
                    <Button variant="contained" className={classes.button} type="submit">create</Button>
                </form>
            </Box>
            <Box display="flex" flexDirection="row" className={classes.tmpList}>
                {contractList.map((addr) => {
                    return <NFTTemplateCard
                        key={addr}
                        templateAddress={addr}
                    />
                })}
            </Box>
        </div>
    )
}