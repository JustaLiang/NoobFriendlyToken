import { Box, Button, Checkbox, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import React, { useContext, useEffect, useState } from 'react';
import { NFTTemplateCard } from "../components/NFTTemplateCard";
import { CurrentAddressContext, NoobFriendlyTokenAdminContext } from "../hardhat/SymfoniContext";
const useStyles = makeStyles((theme) => ({
    filled: {
        borderRadius: 5,
        marginRight: theme.spacing(1),
        width: 190,
        height: 50,
        paddingBottom: 10,
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
    const [checked, setChecked] = useState(false);
    const [contractList, setContractList] = useState<string[]>([]);
    const [baseSettings, setBaseSettings] = useState<BaseSettings>({
        name: "",
        symbol: "",
        payees: [account[0]],
        shares: [1],
        typeOfNFT: -1,
        maxSupply: 0,
    });
    const [splitterCount, setSplitterCount] = useState(1);
    const [paymentAddress, setPaymentAddress] = useState<string[]>([account[0]]);
    const [paymentShares, setPaymentShares] = useState<number[]>([1]);
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
        let baseSettingsInput = baseSettings;
        if (checked) {
            baseSettingsInput = {
                ...baseSettings,
                payees: paymentAddress,
                shares: paymentShares
            }
        }
        const fee = await admin.instance.slottingFee(baseSettingsInput.typeOfNFT)
            .then((fee) => { return fee })
            .catch(() => { return null })
        if (fee) {
            const tx = await admin.instance.genNFTContract(baseSettingsInput, { value: fee })
            await tx.wait();
            setChecked(false);
            setBaseSettings({
                name: "",
                symbol: "",
                payees: [account[0]],
                shares: [1],
                typeOfNFT: -1,
                maxSupply: 0,
            });
            setPaymentAddress([account[0]]);
            setPaymentShares([1]);
            setContractList(await admin.instance.getContractList())
        }

    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBaseSettings({ ...baseSettings, [e.target.name]: e.target.value })
    }
    const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        const name = e.target.name as keyof typeof baseSettings;
        setBaseSettings({ ...baseSettings, [name]: e.target.value })
    }
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        let tempAddress = paymentAddress;
        tempAddress[index] = e.target.value;
        setPaymentAddress([...tempAddress]);
    }
    const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        let tempShares = paymentShares;
        tempShares[index] = +e.target.value;
        setPaymentShares([...tempShares]);
    }
    const handleAdd = () => {
        setSplitterCount(splitterCount + 1);
        setPaymentAddress(paymentAddress.concat([""]));
        setPaymentShares(paymentShares.concat([0]));
    }
    const handleDelete = (index: number) => {
        setPaymentAddress(paymentAddress.slice(0, index).concat(paymentAddress.slice(index + 1)));
        setPaymentShares(paymentShares.slice(0, index).concat(paymentShares.slice(index + 1)));
        setSplitterCount(splitterCount - 1);
    }
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',marginTop:'30px'  }}>
            <Paper>
                <Container maxWidth="md">
                    <Typography variant="h5" style={{padding:'20px',fontWeight:'bold'}}>Create Smart Contract</Typography>
                    <form
                        onSubmit={(e: React.SyntheticEvent) => {
                            e.preventDefault()
                            genNFTContract()
                        }}
                    >
                        <Box style={{ display: 'flex', flexDirection: "column" }}>
                            <Box style={{ display: 'flex', flexDirection: 'row', padding: '20px', gap: 20, flexWrap: 'wrap' }}>
                                <Box>
                                    <TextField value={baseSettings.name} name="name" variant="filled" label="name" className={classes.filled} onChange={handleChange}
                                    />
                                </Box>
                                <Box>
                                    <TextField value={baseSettings.symbol} name="symbol" variant="filled" label="symbol" className={classes.filled} onChange={handleChange} />
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
                                            {/* <MenuItem aria-label="None" value='' /> */}
                                            {/* {NFTTypeArray.map((typeName, idx) =>
                                                <MenuItem key={idx} value={idx}>{typeName}</MenuItem>
                                            )} */}
                                            <MenuItem key={1} value={1}>Blindbox</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box>
                                    <TextField value={baseSettings.maxSupply} name="maxSupply" variant="filled" label="max supply" className={classes.filled} onChange={handleChange} />
                                </Box>
                                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button variant="contained" style={{backgroundColor:'#0666dc',color:'#fff'}} type="submit">create</Button>
                                </Box>
                            </Box>
                            <Box style={{ display: 'flex', paddingLeft: '10px', paddingBottom: '10px' }}>
                                <Typography>
                                    <Checkbox checked={checked} onChange={() => { setChecked(!checked) }} />
                                    Add Payment Splitter
                                </Typography>
                            </Box>
                            {checked ?
                                <Grid container spacing={3} style={{ display: 'flex', paddingLeft: '20px' }}>
                                    {Array.from(Array(splitterCount).keys()).map((item, index) =>
                                        <>
                                            <Grid item md={6} style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                                                <Typography>{index + 1}.</Typography>
                                                <TextField variant="outlined" value={paymentAddress[index]} label="address" placeholder="Address..." onChange={(e) => handleAddressChange(e, index)} />
                                                <TextField variant="outlined" value={paymentShares[index]} label="shares" placeholder="Shares..." onChange={(e) => handleSharesChange(e, index)} />
                                            </Grid>
                                            {index > 0 ?
                                                <IconButton onClick={() => { handleDelete(index) }}><ClearIcon /></IconButton>
                                                : <></>
                                            }
                                            <Grid item md={5}></Grid>

                                        </>
                                    )
                                    }
                                    <Grid item md={2}><IconButton onClick={handleAdd}><AddIcon /></IconButton></Grid>
                                </Grid> : <></>
                            }
                        </Box>
                    </form>
                    <Grid container spacing={3} style={{ marginBottom: '30px', padding: '20px' }}>
                        {contractList.map((addr) => (
                            <Grid item md={4}>
                                <NFTTemplateCard
                                    key={addr}
                                    templateAddress={addr}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Paper>
        </div>
    )
}

export default AdminPage;