import React, { useState, useCallback, useContext, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Paper, Typography, Button, Container, Grid, TextField, CircularProgress } from '@material-ui/core'
import { create } from 'ipfs-http-client';
import LinearProgressWith from './LinearProgressWithLabel';
import { NFTBlindboxContext } from '../hardhat/SymfoniContext';
import { NFTBlindbox } from '../hardhat/typechain/NFTBlindbox';
import { ethers } from "ethers";


interface initStruct {
    baseURI: string
    maxPurchase: string
    tokenPrice: string
    saleStart: string
    revealTimeStamp:string
}
interface Props {
    address: string
}
const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

const ImageCmp = (a: File, b: File) => {
    return parseInt(a.name.slice(0, -4)) - parseInt(b.name.slice(0, -4))
}
const JsonCmp = (a: File, b: File) => {
    return parseInt(a.name.slice(0, -5)) - parseInt(b.name.slice(0, -5))
}

const steps = [
    'Fill in your contract setting',
    'Upload image and metadata',
];


const InitStepBlindBox: React.FC<Props> = ({ address }) => {

    const blindBox = useContext(NFTBlindboxContext);
    const [blindboxContract, setBlindBoxContract] = useState<NFTBlindbox>();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [jsonList, setJsonList] = useState<File[]>();
    const [imageList, setImageList] = useState<File[]>();
    const [imageListSize,setImageListSize] = useState<number>();
    const [count, setCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [initData, setInitData] = useState<initStruct>({
        baseURI: "",
        maxPurchase: "",
        tokenPrice: "",
        saleStart: "",
        revealTimeStamp:""
    });
    const addCount = useCallback(() => {
        setCount(count => count + 1);
    }, [setCount]);

    useEffect(() => {
        const connectToContract = async () => {
            if (!blindBox.factory) return
            const contract = blindBox.factory.attach(address);
            setBlindBoxContract(contract);
        };
        connectToContract();
    }, [blindBox, address]);

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

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        setInitData({
            ...initData,
            [e.target.name]: e.target.value
        })


    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var temp = Object.values(e.target.files);
        temp = temp.filter((file) => (file.name.slice(-3) === "png" || file.name.slice(-3) === "jpg" || file.name.slice(-3) === "svg" || file.name.slice(-3) === "gif"));
        temp.sort(ImageCmp);
        let tempSize = 0;
        for(let file of temp){
            tempSize += file.size/1000000;
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
        if (!imageList || !jsonList ||!imageListSize) return;
        let imageIPFSList = [];
        const addImageOptions = {
            pin: true,
            enableShardingExperiment:true,
        }

        setLoading(true);
        let uploadCount = Math.floor(imageListSize/100) + 1;
        let uploadPerTime = Math.floor(imageList.length/uploadCount);

        for (let i = 0;i < uploadCount;++i){
            let tempList = imageList.slice(i*uploadPerTime,(i+1)*uploadPerTime);
            for await (const result of client.addAll(tempList, addImageOptions)) {
                imageIPFSList.push("ipfs://" + result.path);
            }
        }
       
        console.log(imageIPFSList);
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
            enableShardingExperiment:true,
            progress: (prog: number) => {
                addCount();
            }
        }
        let count = 0;
        for await (const result of client.addAll(uploadMetaDataList, addMetaDataOptions)) {
            count += 1;
            console.log(result);
            if (count === uploadMetaDataList.length + 1) {
                setInitData({ ...initData, baseURI: 'ipfs://' + result.cid['_baseCache'].get("z") + '/' });
            }
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setLoading(false);

    }

    const handleInitConfirm = () => {
        if ( !initData?.maxPurchase || !initData?.saleStart || !initData?.tokenPrice|| !initData?.revealTimeStamp ) return;
        if (!blindboxContract) return;
        blindboxContract?.initialize(initData.baseURI, +initData.maxPurchase, ethers.utils.parseEther(initData.tokenPrice), new Date(initData.saleStart).valueOf() / 1000,new Date(initData.revealTimeStamp).valueOf() / 1000);
    }
    const progress = Math.min(count / totalCount * 100, 100);
    console.log("10*10**18", 10 * 10 ** 18);
    return (
        <Container>
            <Paper>
                    <Box style={{ width: '100%' }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {activeStep === steps.length ? (
                                <Box>
                                    <Typography >All steps completed</Typography>

                                    <Grid container spacing={10} style={{ padding: '24px' }}>
                                        <Grid item md={3}></Grid>
                                        <Grid item md={3}><Typography>Max Purchase: </Typography></Grid>
                                        <Grid item md={3}><Typography>{initData?.maxPurchase}</Typography></Grid>
                                        <Grid item md={3}></Grid>

                                        <Grid item md={3}></Grid>
                                        <Grid item md={3}><Typography>Token Price:</Typography> </Grid>
                                        <Grid item md={3}><Typography>{initData?.tokenPrice}</Typography></Grid>
                                        <Grid item md={3}></Grid>

                                        <Grid item md={3}></Grid>
                                        <Grid item md={3}><Typography>Sale Start Time: </Typography> </Grid>
                                        <Grid item md={3}><Typography>{initData?.saleStart}</Typography> </Grid>
                                        <Grid item md={3}></Grid>

                                        <Grid item md={3}></Grid>
                                        <Grid item md={3}><Typography>Reveal Time: </Typography> </Grid>
                                        <Grid item md={3}><Typography>{initData?.revealTimeStamp}</Typography> </Grid>
                                        <Grid item md={3}></Grid>

                                        <Grid item md={3}></Grid>
                                        <Grid item md={3}><Typography>Base URI:</Typography>  </Grid>
                                        <Grid item md={3} ><Typography style={{ wordBreak: 'break-word' }}>{initData?.baseURI}</Typography> </Grid>
                                        <Grid item md={3}></Grid>

                                        <Grid item md={3}></Grid>
                                        <Grid item md={3}></Grid>
                                        <Grid item md={3} style={{ display: "flex", justifyContent: 'flex-end', gap: '20px' }}>
                                            <Button onClick={handleReset}>Reset</Button>
                                            <Button onClick={handleInitConfirm} variant='contained' color="primary" disabled={!initData?.maxPurchase || !initData?.saleStart || !initData?.tokenPrice || !initData?.revealTimeStamp}>Confirm</Button>


                                        </Grid>
                                        <Grid item md={3}></Grid>


                                    </Grid>
                                </Box>
                            ) : (
                                <>
                                    <Box >
                                        <Grid container spacing={10} style={{ padding: '24px' }}>
                                            {
                                                activeStep === 0 ?
                                                    <>
                                                        <Grid item md={3}>
                                                        </Grid>
                                                        <Grid item md={3}>
                                                            <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Max purchase per time</Typography>
                                                            <TextField name="maxPurchase" value={initData?.maxPurchase} variant="outlined" placeholder="Amount..." style={{ width: '100%' }} onChange={handleChange} />
                                                        </Grid>
                                                        <Grid item md={3}>
                                                            <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Token Price</Typography>
                                                            <TextField name="tokenPrice" value={initData?.tokenPrice} variant="outlined" placeholder="ETH" style={{ width: '100%' }} onChange={handleChange} />
                                                        </Grid>
                                                        <Grid item md={3}>
                                                        </Grid>
                                                        <Grid item md={3}>
                                                        </Grid>
                                                        <Grid item md={3}>
                                                            <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Sale Start Time</Typography>
                                                            <TextField name="saleStart" value={initData?.saleStart} variant="outlined" type="datetime-local" style={{ width: '100%' }} onChange={handleChange} />
                                                        </Grid>
                                                         <Grid item md={3}>
                                                            <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Reveal Time</Typography>
                                                            <TextField name="revealTimeStamp" value={initData?.revealTimeStamp} variant="outlined" type="datetime-local" style={{ width: '100%' }} onChange={handleChange} />
                                                        </Grid>

                                                    </>

                                                    :
                                                    <>
                                                        <Grid item md={3}>
                                                        </Grid>
                                                        <Grid item md={3} style={{ textAlign: 'start' }}>
                                                            <Typography style={{ fontWeight: 'bold', marginBottom: 30 }}>Upload Image Folder</Typography>
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
                                                        </Grid>
                                                        <Grid item md={3} style={{ borderLeft: '1px solid #d0caca' }}>
                                                            <Typography style={{ fontWeight: 'bold', marginBottom: 30 }}>Upload BaseURI</Typography>
                                                            <TextField disabled={initData?.baseURI !== ""} name="baseURI" value={initData?.baseURI} variant="outlined" style={{ width: '100%' }} placeholder="ipfs://" onChange={handleChange} />
                                                        </Grid>
                                                        <Grid item md={3}>
                                                        </Grid>
                                                        <Grid item md={3}>
                                                        </Grid>
                                                        <Grid item md={3} style={{ textAlign: 'start' }}>
                                                            <Typography style={{ fontWeight: 'bold', marginBottom: 30 }}>Upload Metadata Folder</Typography>
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
                                                        </Grid>
                                                        <Grid item md={1} style={{ borderLeft: '1px solid #d0caca' }}>
                                                        </Grid>

                                                    </>


                                            }
                                        </Grid>
                                        {loading ?
                                            <Grid container style={{ padding: '24px' }}>
                                                <Grid item md={3}></Grid>
                                                <Grid item md={6}>
                                                    <LinearProgressWith value={progress} />
                                                </Grid>
                                            </Grid> : <></>
                                        }

                                        <Grid container spacing={10} style={{ padding: '24px' }}>
                                            <Grid item md={3}>
                                            </Grid>
                                            <Grid item md={3}>
                                            </Grid>
                                            <Grid item md={3} style={{ display: "flex", justifyContent: 'flex-end', gap: '20px' }}>
                                                <Button
                                                    disabled={activeStep === 0}
                                                    onClick={handleBack}
                                                >
                                                    Back
                                                </Button>
                                                {
                                                    activeStep === steps.length - 1 ?
                                                        ((initData?.baseURI || !imageList?.length || !jsonList?.length)?
                                                            <Button variant="contained" color="primary" onClick={handleNext}>
                                                                Next
                                                            </Button>
                                                            :
                                                            <Button variant="contained" color="primary" disabled={loading} onClick={handleIPFSUpload}>
                                                                {loading ?
                                                                    <CircularProgress size={20} /> : <></>
                                                                }
                                                                Finish
                                                            </Button>
                                                        ) :
                                                        <Button variant="contained" color="primary" onClick={handleNext}>
                                                            Next
                                                        </Button>

                                                }
                                            </Grid>
                                            <Grid item md={3}>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box> 
                    
            </Paper >
        </Container >
    )
}

export default InitStepBlindBox
