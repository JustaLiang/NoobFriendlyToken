import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { Box, Button, CircularProgress, Container, Grid, IconButton, Paper, Snackbar, SnackbarCloseReason, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Link } from '@material-ui/core';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import LinearProgressWith from '../components/LinearProgressWithLabel';
import { NFTBlindboxContext, ProviderContext } from '../hardhat/SymfoniContext';
import { NFTBlindbox } from '../hardhat/typechain/NFTBlindbox';

interface MatchParams {
    NFTType: string
    address: string
}
interface Props extends RouteComponentProps<MatchParams> {
}

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

const ImageCmp = (a: File, b: File) => {
    return parseInt(a.name.slice(0, -4)) - parseInt(b.name.slice(0, -4))
}
const JsonCmp = (a: File, b: File) => {
    return parseInt(a.name.slice(0, -5)) - parseInt(b.name.slice(0, -5))
}

const DashboardPage: React.FC<Props> = (props) => {
    const address = props.match.params.address;
    const nftType= props.match.params.NFTType;
    const history = useHistory();
    const [provider,] = useContext(ProviderContext);
    const blindBox = useContext(NFTBlindboxContext);
    const [ethValue, setEthValue] = useState<BigNumberish>(0);
    const [isReveal, setIsReveal] = useState<boolean>(false);
    const [blindboxContract, setBlindBoxContract] = useState<NFTBlindbox>();
    const [baseURI, setBaseURI] = useState<string>();
    const [coverURI, setCoverURI] = useState<string>();
    const [maxSupply, setMaxSupply] = useState<number>(0);
    const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0));
    const [withdrawAddress, setWithdrawAddress] = useState<string>();
    const [revealTime, setRevealTime] = useState<BigNumber>(BigNumber.from(0));
    const [startTime, setStartTime] = useState<BigNumber>(BigNumber.from(0));
    const [contractBaseURI, setContractBaseURI] = useState<string>();
    const [contractCoverURI, setContractCoverURI] = useState<string>();
    const [jsonList, setJsonList] = useState<File[]>();
    const [imageList, setImageList] = useState<File[]>();
    const [imageListSize, setImageListSize] = useState<number>();
    const [count, setCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [metaDataURI, setMetaDataURI] = useState<string>();
    const [snackOpen, setSnackOpen] = useState(false);
    const [reserveAmount, setReserveAmount] = useState<string>("");
    const [reserveInputError, setReserveInputError] = useState(false);
    const imageUploader = useCallback((node: HTMLInputElement) => {
        if (!node) return;
        node.setAttribute('webkitdirectory', '');
        node.setAttribute('directory', '');
        node.setAttribute('multiple', '');
    }, []);
    const jsonUploader = useCallback((node: HTMLInputElement) => {
        if (!node) return;
        node.setAttribute('webkitdirectory', '');
        node.setAttribute('directory', '');
        node.setAttribute('multiple', '');
    }, []);

    const addCount = useCallback(() => {
        setCount(count => count + 1);
    }, [setCount]);

    useEffect(() => {
        const connectToContract = async () => {
            if (!blindBox.factory || !provider) return
            const contract = blindBox.factory.attach(address);
            const contractFund = await provider.getBalance(address);
            const contractSettings = await contract.settings();
            const _maxSupply = contractSettings['maxSupply'];
            const _totalSupply = await contract.totalSupply();
            const _revealTime = await contract.revealTimestamp();
            const _startTime = contractSettings['startTimestamp'];
            const _coverURI = await contract.coverURI();
            const _baseURI = await contract.baseURI();
            setContractCoverURI(_coverURI);
            setContractBaseURI(_baseURI);
            setRevealTime(_revealTime);
            setStartTime(_startTime);
            setMaxSupply(_maxSupply);
            setTotalSupply(_totalSupply);
            setEthValue(contractFund);
            setBlindBoxContract(contract);
            setIsReveal(!(await contract.offsetId()).eq(0));
        };
        connectToContract();
    }, [blindBox, address, provider]);
    const handleBaseURIChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBaseURI(e.target.value);
    }
    const handleCoverURIChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCoverURI(e.target.value)
    }
    const handleWithdrawAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setWithdrawAddress(e.target.value)
    }
    const handleReserveAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (isNaN(parseInt(e.target.value))) {
            setReserveAmount(e.target.value)
            setReserveInputError(true);
            return;
        }
        setReserveAmount(e.target.value)
        setReserveInputError(false);

    }
    const handleSetCoverURI = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!coverURI || !blindboxContract) return;
        const tx = await blindboxContract.setCoverURI(coverURI);
        const receipt = await tx.wait();
        if (receipt.status) {
            setContractCoverURI(await blindboxContract.coverURI());
            setCoverURI("");
        }

    }
    const handleSetBaseURI = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!baseURI || !blindboxContract) return;
        const tx = await blindboxContract.setBaseURI(baseURI);
        const receipt = await tx.wait();
        if (receipt.status) {
            setContractBaseURI(await blindboxContract.baseURI());
            setBaseURI("");
        }
    }
    const handleReserve = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!reserveAmount || !blindboxContract) return;
        const tx = await blindboxContract.reserveNFT(reserveAmount);
        const receipt = await tx.wait();
        if (receipt.status) {
            setTotalSupply(await blindboxContract.totalSupply());
            setReserveAmount("");
        }
    }
    const handleWithDraw = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!withdrawAddress || !blindboxContract) return;
        const tx = await blindboxContract.release(withdrawAddress);
        const receipt = await tx.wait();
        if (receipt.status && provider) {
            setEthValue(await provider.getBalance(blindboxContract.address));
            setWithdrawAddress("");
        }
    }
    const handleSetReveal = async () => {
        if (!blindboxContract) return;
        const tx = await blindboxContract.reveal();
        const receipt = await tx.wait();
        if (receipt.status) {
            setIsReveal(!(await blindboxContract.offsetId()).eq(0));
        }

    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var temp = Object.values(e.target.files);
        temp = temp.filter((file) => (file.name.slice(-3) === "png" || file.name.slice(-3) === "jpg" || file.name.slice(-3) === "svg" || file.name.slice(-3) === "gif"));
        temp.sort(ImageCmp);
        let tempSize = 0;
        for (let file of temp) {
            tempSize += file.size / 1000000;
        }
        console.log(tempSize);
        setImageListSize(tempSize);
        setImageList(temp);
        setTotalCount(temp.length);
    }
    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var temp = Object.values(e.target.files);
        temp = temp.filter((file) => file.name.slice(-4) === "json");
        temp.sort(JsonCmp);
        setJsonList(temp);
    }

    const handleIPFSUpload = async () => {
        if (!imageList || !jsonList || !imageListSize) return;
        let imageIPFSList = [];
        const addImageOptions = {
            pin: true,
            enableShardingExperiment: true,
        }

        setLoading(true);
        let uploadCount = Math.floor(imageListSize / 100) + 1;
        let uploadPerTime = Math.floor(imageList.length / uploadCount);

        for (let i = 0; i < uploadCount; ++i) {
            let tempList = imageList.slice(i * uploadPerTime, (i + 1) * uploadPerTime);
            for await (const result of client.addAll(tempList, addImageOptions)) {
                imageIPFSList.push("ipfs://" + result.path);
            }
        }

        let metadataList = [];
        for (let i = 0; i < jsonList.length; ++i) {
            let jsonText = await jsonList[i].text();
            let jsonObject = JSON.parse(jsonText);
            jsonObject.image = imageIPFSList[i];
            metadataList.push(new File([JSON.stringify(jsonObject)], jsonList[i].name, { type: 'application/json' }))
        }
        const uploadMetaDataList = [];
        for (let i = 0; i < metadataList.length; ++i) {
            uploadMetaDataList.push({
                path: `${i}`,
                content: metadataList[i]
            })
        }
        const addMetaDataOptions = {
            pin: true,
            wrapWithDirectory: true,
            enableShardingExperiment: true,
            progress: (prog: number) => {
                addCount();
            }
        }
        let count = 0;
        for await (const result of client.addAll(uploadMetaDataList, addMetaDataOptions)) {
            count += 1;
            console.log(result);
            if (count === uploadMetaDataList.length + 1) {
                setMetaDataURI('ipfs://' + result.cid['_baseCache'].get("z") + '/');
            }
        }
        setLoading(false);
        setImageList([]);
        setImageListSize(0);
        setJsonList([]);
        setCount(0);
        setTotalCount(0);
    }
    const handleCopy = () => {
        if (!metaDataURI) return;
        navigator.clipboard.writeText(metaDataURI);
        setSnackOpen(true);
    }
    const handleBarClose = (event: React.SyntheticEvent<any>, reason: SnackbarCloseReason) => {
        event?.preventDefault();
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };
    const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
        event.preventDefault();
        setSnackOpen(false);
    }
    const progress = Math.min(count / totalCount * 100, 100);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Container maxWidth='lg'>
                <Snackbar open={snackOpen} autoHideDuration={1000} onClose={handleBarClose}>
                    <Alert onClose={handleAlertClose} severity="success">
                        Copy!
                    </Alert>
                </Snackbar>
                <Paper>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '0px 20px', textAlign: "start" }}>
                        <IconButton onClick={() => { history.push('/') }}><KeyboardBackspaceIcon /></IconButton>
                        <Link href={`/${nftType}/${address}/mint`} style={{textDecoration:'none',paddingTop:'10px'}}><Typography>➝ Go to Mint Page</Typography></Link>
                    </Box>
                    <Grid container>
                        <Grid item md={6} style={{ padding: '20px' }}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>

                                        <TableRow>
                                            <TableCell>
                                                <Typography style={{ fontWeight: 'bold' }}>Contract Overview</Typography>
                                            </TableCell>
                                            <TableCell>

                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Your Contract Address:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {address}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Ether Value: </Typography>
                                            </TableCell>
                                            <TableCell>
                                                $ {ethers.utils.formatEther(ethValue)} ETH
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>
                                                    Enter Your Address:
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <form onSubmit={handleWithDraw}>
                                                    <TextField label="address" variant="outlined" placeholder='0x' size="small" style={{ width: '220px', marginRight: "10px" }} value={withdrawAddress} onChange={handleWithdrawAddressChange} />
                                                    <Button variant='contained' style={{ textTransform: 'none' }} color="primary" type="submit">Withdraw</Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Sale State: </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {totalSupply.toNumber()}/{maxSupply} ({(totalSupply.toNumber() / maxSupply * 100).toFixed(2)})%
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TableContainer component={Paper} style={{ marginTop: '30px' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <Typography style={{ fontWeight: 'bold' }}>Upload Files</Typography>
                                            </TableCell>
                                            <TableCell>

                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Image:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography style={{ display: imageList?.length ? "" : "none" }}>Chosen {imageList?.length} file</Typography>
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                >
                                                    Upload Folder
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={imageUploader}
                                                        hidden
                                                        onChange={handleImageUpload}
                                                    />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Metadata: </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography style={{ display: jsonList?.length ? "" : "none" }}>Chosen {jsonList?.length} file</Typography>
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                >
                                                    Upload Folder
                                                    <input
                                                        type="file"
                                                        accept=".json"
                                                        ref={jsonUploader}
                                                        hidden
                                                        onChange={handleJsonUpload}
                                                    />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>URI: <IconButton onClick={handleCopy}><FilterNoneIcon style={{ fontSize: '15px' }} /></IconButton></Typography>
                                            </TableCell>
                                            <TableCell style={{ wordWrap: 'break-word' }}>
                                                {metaDataURI}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                {loading ?
                                                    <LinearProgressWith value={progress} /> : <></>
                                                }
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'end' }}>
                                                {loading ?
                                                    <CircularProgress size={20} /> : <></>
                                                }
                                                <Button variant='contained' style={{ textTransform: 'none', color: '#fff', backgroundColor: "#000" }} onClick={handleIPFSUpload} >Upload</Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item md={6} style={{ padding: '20px' }}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <Typography style={{ fontWeight: 'bold' }}>Contract Settings</Typography>
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'end' }}>
                                                <span style={{ fontStyle: 'italic', fontWeight: 100, fontSize: '10px', marginRight: '15px' }}>You can only reveal your collection after you set your base URI</span>
                                                {isReveal ?
                                                    <Button disabled={true} variant='contained' style={{ textTransform: 'none' }}>Reveal</Button> :
                                                    <Button onClick={handleSetReveal} variant='contained' style={{ textTransform: 'none', color: '#fff', backgroundColor: "#000" }}>Reveal</Button>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Start Time: </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(startTime.toNumber() * 1000).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Reveal Time: </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(revealTime.toNumber() * 1000).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Base URI:</Typography>
                                            </TableCell>
                                            <TableCell style={{ wordWrap: 'break-word' }}>
                                                {contractBaseURI}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography style={{ wordWrap: 'break-word' }}>Cover URI: </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {contractCoverURI}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Set Base URI: </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <form onSubmit={handleSetBaseURI}>
                                                    <TextField label="baseURI" variant="outlined" placeholder='ipfs://' size="small" style={{ width: '220px', marginRight: "10px" }} value={baseURI} onChange={handleBaseURIChange} />
                                                    <Button variant='contained' style={{ textTransform: 'none' }} color="primary" type="submit">Submit</Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Set Cover URI:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <form onSubmit={handleSetCoverURI}>
                                                    <TextField label="coverURI" variant="outlined" placeholder='ipfs://' size="small" style={{ width: '220px', marginRight: "10px" }} value={coverURI} onChange={handleCoverURIChange} />
                                                    <Button variant='contained' color="primary" style={{ textTransform: 'none' }} type="submit">Submit</Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography>Reserve:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <form onSubmit={handleReserve}>
                                                    <TextField label="reserve" variant="outlined" placeholder='amount' size="small" style={{ width: '220px', marginRight: "10px" }} value={reserveAmount} onChange={handleReserveAmountChange} error={reserveInputError} helperText={reserveInputError ? 'Please enter number' : ""} />
                                                    <Button variant='contained' color="primary" style={{ textTransform: 'none' }} type="submit">Submit</Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </div>
    )
}

export default DashboardPage
