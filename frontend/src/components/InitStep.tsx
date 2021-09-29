import React, { useState,useCallback } from 'react'
import { Box, Stepper, Step, StepLabel, Paper, Typography, Button, Container, Grid, TextField, Input } from '@material-ui/core'
import { create } from 'ipfs-http-client';
import LinearProgressWith from './LinearProgressWithLabel';
const fs = require('fs');

interface Props {

}
const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

const ImageCmp = (a:File,b:File) => {
    return parseInt(a.name.slice(0,-4)) - parseInt(b.name.slice(0,-4))
}
const JsonCmp = (a:File,b:File) => {
    return parseInt(a.name.slice(0,-5)) - parseInt(b.name.slice(0,-5))
}

const steps = [
    'Fill in your contract setting',
    'Upload image and metadata',
];

function getStepContent(step: number) {
    switch (step) {
        case 0:
            return 'Select campaign settings...';
        case 1:
            return 'What is an ad group anyways?';
        case 2:
            return 'This is the bit I really care about!';
        default:
            return 'Unknown step';
    }
}

const InitStep: React.FC<Props> = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [jsonList, setJsonList] = useState<File[]>();
    const [imageList, setImageList] = useState<File[]>();
    const [baseUrl, setBaseUrl] = useState<string>();

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var temp = Object.values(e.target.files);
        temp = temp.filter((file)=>(file.name.slice(-3)==="png" ||file.name.slice(-3)==="jpg" || file.name.slice(-3)==="svg" ||file.name.slice(-3)==="gif"));
        console.log("temp unsorted: " ,temp);
        temp.sort(ImageCmp);
        console.log('temp sorted: ',temp);
        setImageList(temp);
    }
    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var temp = Object.values(e.target.files);
        temp = temp.filter((file)=>file.name.slice(-4)==="json");
        console.log("temp unsorted: " ,temp);
        temp.sort(JsonCmp);
        console.log("temp: ",await temp[0].text());
        var a = JSON.stringify(temp[0]);
        console.log("Json: ",a);
        console.log('temp sorted: ',temp);
        setJsonList(temp);
    }

    const handleIPFSUpload = async () =>{
        if(!imageList || !jsonList) return;
        let imageIPFSList = [];
        const addImageOptions = {
            pin: true,
        }
        for await (const result of client.addAll(imageList, addImageOptions)) {
            imageIPFSList.push("ipfs://"+result.path);
        }
        console.log(imageIPFSList);
        let metadataList = [];
        for (let i = 0; i < jsonList.length;++i)
        {
            let jsonText = await jsonList[i].text();
            let jsonObject = JSON.parse(jsonText);
            jsonObject.image = imageIPFSList[i];
            metadataList.push(new File([JSON.stringify(jsonObject)],jsonList[i].name,{type: 'application/json' }))
        }
        const uploadMetaDataList = [];
        for (let i = 0; i < metadataList.length;++i){
            uploadMetaDataList.push({
                path:`${i}`,
                content:metadataList[i]
            })
        }
        const addMetaDataOptions = {
            pin: true,
            wrapWithDirectory: true,
        }
        let count = 0;
        for await (const result of client.addAll(uploadMetaDataList, addMetaDataOptions)){
            count += 1;
            console.log(result);
            if (count === uploadMetaDataList.length+1){
                console.log(result.cid['_baseCache'].get("z"));
            }
        };

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
                                <Button onClick={handleReset}>Confirm</Button>
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
                                                        <TextField variant="outlined" placeholder="Amount..." style={{ width: '100%' }} />
                                                    </Grid>
                                                    <Grid item md={3}>
                                                        <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Token Price</Typography>
                                                        <TextField variant="outlined" placeholder="ETH" style={{ width: '100%' }} />
                                                    </Grid>
                                                    <Grid item md={3}>
                                                    </Grid>
                                                    <Grid item md={3}>
                                                    </Grid>
                                                    <Grid item md={3}>
                                                        <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Sale Start Time</Typography>
                                                        <TextField variant="outlined" type="date" style={{ width: '100%' }} />
                                                    </Grid>
                                                </>

                                                :
                                                <>
                                                    <Grid item md={3}>
                                                    </Grid>
                                                    <Grid item md={6}>
                                                    <Typography style={{ textAlign: 'start', fontWeight: 'bold', marginBottom: 30 }}>Upload Image Folder</Typography>
                                                        <Typography style={{display:imageList?.length?"":"none"}}>Chosen {imageList?.length} file</Typography>
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
                                                        <Typography style={{display:jsonList?.length?"":"none"}}>Chosen {jsonList?.length} file</Typography>
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
                                                    <Grid item md={3}>
                                                        <Button onClick={handleIPFSUpload}>IPFS Upload</Button>
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
                                            <Button variant="contained" color="primary" onClick={handleNext}>
                                                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                            </Button>
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

export default InitStep
