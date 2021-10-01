import React, { useContext, useEffect, useState } from 'react';
import { CurrentAddressContext, NoobFriendlyTokenAdminContext } from "../hardhat/SymfoniContext";
import { NFTTemplateCard } from "../components/NFTTemplateCard";
import { TextField, Button, Box, InputLabel, Select, FormControl,Paper, Typography, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NFTTypeArray } from "../components/NFTTypeArray";
import {ContractReceipt} from "ethers";
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: 500,
    },
    filled: {
        borderRadius: 5,
        marginRight: theme.spacing(1),
        width: 190,
        height: 50,
        paddingBottom: 10,
    },
    tmpList: {
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 30,
        width: 950,
        gap: 20,
        overflowX: "scroll"
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

const AdminPage: React.FC<Props> = () => {
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
        setBaseSettings({ ...baseSettings, [e.target.name]: e.target.value })
    }
    const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) =>{
        const name = e.target.name as keyof typeof baseSettings;
        setBaseSettings({ ...baseSettings, [name]: e.target.value })
    }
    return (
        <div style={{minHeight: '100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
            <Paper>
                <Typography variant="h5">Noob Friendly Token</Typography>
                <form
                    onSubmit={(e: React.SyntheticEvent) => {
                        e.preventDefault()
                        genNFTContract()
                    }}
                    className={classes.root}
                >
                    <Box style={{display:'flex',flexDirection:'row',padding:'20px',gap:20}}>
                    <Box>
                    <TextField value={baseSettings.name} name="name" variant="filled" label="name" className={classes.filled} onChange={handleChange}
                    />
                    </Box>
                    <Box>
                    <TextField  value={baseSettings.symbol} name="symbol" variant="filled" label="symbol" className={classes.filled} onChange={handleChange}/>
                    </Box>
                    <Box>
                    <FormControl variant="filled" className={classes.filled}>
                        <InputLabel htmlFor="ticket-type">ticket type</InputLabel>
                        <Select
                            id="ticket-type"
                            name="typeOfNFT"
                            value={baseSettings.typeOfNFT}
                            onChange={handleSelectChange}
                        >
                            <MenuItem aria-label="None" value='' />
                            {NFTTypeArray.map((typeName, idx)=>
                                <MenuItem key={idx} value={idx}>{typeName}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    </Box>
                    <Box>
                    <TextField  value={baseSettings.maxSupply} name="maxSupply" variant="filled" label="max supply" className={classes.filled} onChange={handleChange}/>
                    </Box>
                    <Box style={{display:'flex',justifyContent:'center'}}>
                    <Button variant="contained" color="primary" type="submit">create</Button>
                    </Box>
                    </Box>
                </form>
            <Box display="flex" flexDirection="row" className={classes.tmpList}>
                {contractList.map((addr) => {
                    return <NFTTemplateCard
                        key={addr}
                        templateAddress={addr}
                    />
                })}
            </Box>
            </Paper>
        </div>
    )
}

export default AdminPage;