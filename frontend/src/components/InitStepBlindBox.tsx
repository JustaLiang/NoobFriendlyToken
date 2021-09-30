import React, { useState, useCallback, useContext, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Paper, Typography, Button, Container, Grid, TextField, Input } from '@material-ui/core'
import { create } from 'ipfs-http-client';
import LinearProgressWith from './LinearProgressWithLabel';
import { NFTBlindboxContext } from '../hardhat/SymfoniContext';
import { NFTBlindbox } from '../hardhat/typechain/NFTBlindbox';

interface initStruct {
    baseURI: string
    maxPurchase: string
    tokenPrice: string
    saleStart: string
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
    const [jsonList, setJsonList] = useState<File[]>();
    const [imageList, setImageList] = useState<File[]>();
    const [initData, setInitData] = useState<initStruct>({
        baseURI: "",
        maxPurchase: "",
        tokenPrice: "",
        saleStart: ""
    });

    useEffect(() => {
        const connectToContract = async () => {
            if (!blindBox.factory) return
            const contract = blindBox.factory.attach(address);
            setBlindBoxContract(contract);
            console.log(await contract.baseURI());
        };
        connectToContract();
    }, [blindBox])

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
        console.log("temp unsorted: ", temp);
        temp.sort(ImageCmp);
        console.log('temp sorted: ', temp);
        setImageList(temp);
    }
    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var temp = Object.values(e.target.files);
        temp = temp.filter((file) => file.name.slice(-4) === "json");
        console.log("temp unsorted: ", temp);
        temp.sort(JsonCmp);
        console.log("temp: ", await temp[0].text());
        var a = JSON.stringify(temp[0]);
        console.log("Json: ", a);
        console.log('temp sorted: ', temp);
        setJsonList(temp);
    }

    const handleIPFSUpload = async () => {
        if (!imageList || !jsonList) return;
        let imageIPFSList = [];
        const addImageOptions = {
            pin: true,
        }
        for await (const result of client.addAll(imageList, addImageOptions)) {
            imageIPFSList.push("ipfs://" + result.path);
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
        }
        let count = 0;
        for await (const result of client.addAll(uploadMetaDataList, addMetaDataOptions)) {
            count += 1;
            console.log(result);
            if (count === uploadMetaDataList.length + 1) {
                setInitData({ ...initData, baseURI: 'ipfs://' + result.cid['_baseCache'].get("z") +'/'});
            }
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);

    }

    const handleInitConfirm = () => {
        if(!initData?.baseURI||!initData?.maxPurchase||!initData?.saleStart||!initData?.tokenPrice) return;
        if(!blindboxContract) return;
        const initParam = {
            baseURI: initData.baseURI,
            maxPurchase:+initData.maxPurchase,
            tokenPrice:+initData.tokenPrice,
            saleStart: new Date(initData.saleStart).valueOf()
        }
        blindboxContract?.initialize(initData.baseURI,+initData.maxPurchase,+initData.tokenPrice,new Date(initData.saleStart).valueOf());
        
    }
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
                                    <Grid item md={3}><Typography>Base URI:</Typography>  </Grid>
                                    <Grid item md={3} ><Typography style={{ wordBreak: 'break-word' }}>{initData?.baseURI}</Typography> </Grid>
                                    <Grid item md={3}></Grid>

                                    <Grid item md={3}></Grid>
                                    <Grid item md={3}></Grid>
                                    <Grid item md={3} style={{ display: "flex", justifyContent: 'flex-end', gap: '20px' }}>
                                        <Button onClick={handleReset}>Reset</Button>
                                        <Button onClick={handleInitConfirm} variant='contained' color="primary" disabled={!initData?.baseURI||!initData?.maxPurchase||!initData?.saleStart||!initData?.tokenPrice}>Confirm</Button>


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
                                                        <TextField name="saleStart" value={initData?.saleStart} variant="outlined" type="date" style={{ width: '100%' }} onChange={handleChange} />
                                                    </Grid>

                                                </>

                                                :
                                                <>
                                                    <Grid item md={3}>
                                                    </Grid>
                                                    <Grid item md={6}>
                                                        <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Upload Image Folder</Typography>
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
                                                    <Grid item md={3}>
                                                    </Grid>
                                                    <Grid item md={3}>
                                                    </Grid>
                                                    <Grid item md={6}>
                                                        <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Upload Metadata Folder</Typography>
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
                                                </>


                                        }
                                    </Grid>
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
                                                    (initData?.baseURI ?
                                                        <Button variant="contained" color="primary" onClick={handleNext}>
                                                            Next
                                                        </Button>
                                                        :
                                                        <Button variant="contained" color="primary" onClick={handleIPFSUpload}>
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
        </Container>
    )
}

export default InitStepBlindBox
