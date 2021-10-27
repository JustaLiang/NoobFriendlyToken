import { Box, Button, Container, Grid, Link, Paper, TextField, Typography } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { CurrentAddressContext, NFTBlindboxContext, ProviderContext } from "../hardhat/SymfoniContext";
import { NFTBlindbox } from '../hardhat/typechain/NFTBlindbox';
interface MatchParams {
    NFTType: string
    address: string
}
interface Props extends RouteComponentProps<MatchParams> {
}


const MintPage: React.FC<Props> = (props) => {
    const address = props.match.params.address;
    const [currentAddress,] = useContext(CurrentAddressContext);
    const provider = useContext(ProviderContext)
    const blindBox = useContext(NFTBlindboxContext);
    const [blindboxContract, setBlindBoxContract] = useState<NFTBlindbox>();
    const [name, setName] = useState<string>();
    const [symbol, setSymbol] = useState<string>();
    const [balance, setBalance] = useState<number>();
    const [maxPurchase, setMaxPurchase] = useState<number>();
    const [mintAmount, setMintAmount] = useState<number>(0);
    const [tokenPrice, setTokenPrice] = useState<number>(0);
    const [totalSupply, setTotalSupply] = useState<number>(0);
    const [maxSupply, setMaxSupply] = useState<number>(0);
    const [saleStartTime, setSaleStartTime] = useState<number>(0);
    const [openSeaCollectionSlug, setOpenSeaCollectionSlug] = useState<string>();
    useEffect(() => {
        const connectToContract = async () => {
            if (!blindBox.factory || !provider || !currentAddress) return
            const contract = blindBox.factory.attach(address);
            const _balance = await contract.balanceOf(currentAddress);
            const _settings = await contract.settings();
            const _blindboxSettings = await contract.blindboxSettings();
            const _maxSupply = _settings.maxSupply;
            const _totalSupply = _settings.totalSupply;
            const _maxPurchase = _settings.maxPurchase;
            const _saleStart = _settings.startTimestamp;
            const _tokenPrice = _blindboxSettings.tokenPrice;
            setBlindBoxContract(contract);
            setName(await contract.name());
            setSymbol(await contract.symbol());
            setBalance(_balance.toNumber());
            setTotalSupply(_totalSupply);
            setMaxSupply(_maxSupply);
            setMaxPurchase(_maxPurchase);
            setTokenPrice(+ethers.utils.formatEther(_tokenPrice))
            setSaleStartTime(_saleStart.toNumber());
        }
        connectToContract()
    }, [blindBox, provider, address, currentAddress])
    useEffect(() => {
        const fetchData = async () => {
            fetch(`https://testnets-api.opensea.io/api/v1/asset_contract/${address}`, { method: 'GET' })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.collection) {
                        setOpenSeaCollectionSlug(`${data.collection.slug}`);
                    }})
    }
        fetchData();
}
    , [address])

const handleMint = async () => {
    if (!blindboxContract || !mintAmount) return;
    const tx = await blindboxContract.mintToken(mintAmount, { value: ethers.utils.parseEther((mintAmount * tokenPrice).toString()) })
    const receipt = await tx.wait();
    if(receipt.status) {
        setBalance((await blindboxContract.balanceOf(currentAddress)).toNumber());
        setTotalSupply((await blindboxContract.settings()).totalSupply);
    }

}
const timeDiff = saleStartTime*1000 - Date.now();

return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Container maxWidth='lg'>
            <Paper>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: '20px' }}>
                    <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Box style={{ display: 'flex', flexDirection: 'column' }}>
                            <Button style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.6em', verticalAlign: 'middle', backgroundColor: '#eef3fb' }}><AccountBalanceWalletIcon style={{ marginRight: '10px' }} /> {balance} {symbol} <span style={{ marginLeft: '10px', color: '#57627b', backgroundColor: '#ffff', fontSize: '0.5em' }}>{currentAddress.slice(0, 10) + '...' + currentAddress.slice(-10)}</span></Button>
                            {openSeaCollectionSlug?
                                <Link target='_blank' href={`https://testnets.opensea.io/collection/${openSeaCollectionSlug}`} style={{ fontSize: '0.5em' }}>➝ Browse collection on opensea</Link>
                            :<></>
                            }
                        </Box>
                    </Box>
                    <Box style={{ marginBottom: 40 }}>
                        <Typography variant="h4" style={{ marginBottom: 40, fontWeight: 'bold' }}> {name} Minting Page</Typography>
                        <Grid container>
                            <Grid item md={5} xs={12} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'start', border: '1px solid #dee6f1', borderRadius: 5 }}>
                                <Box >
                                    <Typography variant='h6' >Mint {symbol}</Typography>
                                </Box>
                                <Box style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                                    <p style={{ display: 'inline-flex', fontSize: '0.4em', padding: 5, backgroundColor: '#eef3fb', borderRadius: '5px', margin: 0 }}>max purchase: {maxPurchase}</p>
                                    <p style={{ display: 'inline-flex', fontSize: '0.4em', padding: 5, backgroundColor: '#eef3fb', borderRadius: '5px', margin: 0 }}>token price: {tokenPrice} ETH</p>

                                </Box>
                                <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, padding: '20px', backgroundColor: '#e9f5fe', borderRadius: '5px' }}>
                                    <TextField label='Amount' value={mintAmount} size="small" variant="outlined" type='number' onChange={(e) => { setMintAmount(+e.target.value) }} /><div style={{ fontSize: '0.75em', color: "#1273ea", padding: 5, borderRadius: 5, fontWeight: 400 }}>{(mintAmount * tokenPrice).toFixed(2)} ETH</div>
                                </Box>

                                <Button onClick={handleMint} style={{ textTransform: 'none', backgroundColor: "#0666dc", color: "#fff", borderRadius: 5 }}>Mint</Button>

                            </Grid>
                            <Grid item md={1}></Grid>
                            <Grid item md={6} style={{ padding: '20px 0px' }}>
                                <Grid container spacing={5}>
                                    <Grid item md={5} style={{ display: 'flex', flexDirection: 'column', textAlign: 'start', backgroundColor: '#f5f8fc', borderRadius: '5px' }}>
                                        <Typography style={{ color: '#57627b' }}>Current Circulate</Typography>
                                        <Box>
                                            <Typography variant="h4" style={{ color: '#1d273d' }}>{(totalSupply).toLocaleString()} <span style={{ fontSize: '0.75em', color: '#57627b' }}>{symbol}</span></Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item md={1}></Grid>
                                    <Grid item md={5} style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0666dc', textAlign: 'start', borderRadius: '5px' }}>
                                        <Typography style={{ color: '#c4e3fb' }}>Max Supply</Typography>
                                        <Box>
                                            <Typography variant="h4" style={{ color: "#fff" }}>{(maxSupply).toLocaleString()} <span style={{ fontSize: '0.75em', color: '#c4e3fb' }}>{symbol}</span></Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item md={11} style={{ marginTop: '20px', textAlign: 'start', backgroundColor: "#f5f8fc",borderRadius:'5px' }}>
                                        <Typography style={{ marginBottom: '10px', color: '#57627b' }}>{symbol} stats</Typography>
                                        <Grid container >
                                            <Grid item md={4}>
                                                <Typography style={{ fontSize: '0.4em', color: '#57627b' }}>{timeDiff > 0 ? "To Sale Start" : "Since Sale Started"}</Typography>
                                                <Typography style={{ color: '#1d273d' }}>{Math.abs(timeDiff / (1000 * 3600 * 24)).toFixed(1)} days</Typography>
                                            </Grid>
                                            <Grid item md={4}>
                                                <Typography style={{ fontSize: '0.4em', color: '#57627b' }}>Token Left</Typography>
                                                <Typography style={{ color: '#1d273d' }}>{maxSupply - totalSupply} {symbol}</Typography>
                                            </Grid>
                                            <Grid item md={4}>
                                                <Typography style={{ fontSize: '0.4em', color: '#57627b' }}>Sold Percentage</Typography>
                                                <Typography style={{ color: '#1d273d' }}>{((totalSupply / maxSupply) * 100).toFixed(2)} %</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Paper>
        </Container>
    </div>
)
}

export default MintPage
