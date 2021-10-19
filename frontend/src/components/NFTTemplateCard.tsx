import { Box, Card, CardActionArea, CardContent, CardHeader, CardMedia, CircularProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { ProviderContext, SignerContext } from "../hardhat/SymfoniContext";
import { NoobFriendlyTokenTemplate__factory } from "../hardhat/typechain/factories/NoobFriendlyTokenTemplate__factory";
import { NoobFriendlyTokenTemplate } from "../hardhat/typechain/NoobFriendlyTokenTemplate";
import { NFTTypeArray } from "./NFTTypeArray";
const useStyles = makeStyles((theme) => ({
    media: {
        objectFit: 'contain',
        width: 'auto',
        height: 'auto',
        borderRadius: '5px',
        maxWidth: '100%',
        maxHeight: '100%',
    }
}))

interface Props {
    templateAddress: string
}

interface TemplateInfo {
    name: string,
    symbol: string,
    typeOfNFT: number,
    maxSupply: number,
}

export const NFTTemplateCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const signer = useContext(SignerContext);
    const provider = useContext(ProviderContext);
    const [isInit, setIsInit] = useState<Boolean>(false);
    const [imageURI, setImageURI] = useState<string>("fetching");
    const [imgLoaded, setImgLoaded] = useState<Boolean>(false);
    const [template, setTemplate] = useState<NoobFriendlyTokenTemplate>();
    const [templateInfo, setTemplateInfo] = useState<TemplateInfo>({
        name: "name",
        symbol: "symbol",
        typeOfNFT: 0,
        maxSupply: 0,
    });
    const { templateAddress } = props;
    console.log(templateAddress);
    useEffect(() => {
        if (signer[0]) {
            setTemplate(NoobFriendlyTokenTemplate__factory.connect(templateAddress, signer[0]))
            console.log("connect contract by signer")
        }
        else {
            console.log("no signer")
        }
    }, [signer, templateAddress])
    useEffect(() => {
        const getInit = async () => {
            if (template) {
                const init = await template.isInit();
                if (init) {
                    setIsInit(init);
                }
            }
        }
        getInit();
    }, [template])

    useEffect(() => {
        const updateImageURI = async () => {
            const baseURI = await template?.baseURI();
            if (baseURI) {
                fetch(`https://ipfs.io/ipfs/${baseURI?.slice(7)}0`)
                    .then((res) => {
                        if (res.status === 404) throw Error("URI error: 404");
                        return res.json();
                    })
                    .then((metadata) => {
                        const imgURI = "https://ipfs.io/ipfs/" + metadata.image.slice(7);
                        setImageURI(imgURI);
                    })
                    .catch((err) => {
                        setImageURI("");
                        console.log(err);
                    })
            }
            else {
                setImageURI("");
            }
        }
        updateImageURI()
    }, [template])

    useEffect(() => {
        if (imageURI) {
            fetch(imageURI)
                .then((res) => {
                    if (res.status !== 404)
                        setImgLoaded(true)
                })
        }
        else {
            setImgLoaded(true)
        }
    }, [imageURI])

    useEffect(() => {
        const reloadTemplate = async () => {
            if (template) {
                const templateInfo = await template.getBaseSettings()
                setTemplateInfo(templateInfo)
            }
        }
        reloadTemplate()
    }, [template])
    console.log(provider);
    console.log(signer);
    console.log("isinit:", isInit);
    return (
        <div>
            <Card
                style={{ borderRadius: 8, boxShadow: 'none', border: '1px solid rgb(229, 232, 235)', padding: '10px' }}
            >
                <CardActionArea component={Link} to={isInit?`/${NFTTypeArray[templateInfo.typeOfNFT].toLowerCase()}/${templateAddress}/dashboard`:`/${NFTTypeArray[templateInfo.typeOfNFT].toLowerCase()}/${templateAddress}/setup`}>
                    <CardHeader
                        title={templateInfo.name}
                        subheader={templateInfo.symbol}
                    />
                    {imageURI !== "fetching" && imageURI && imgLoaded ? (
                        <CardMedia
                            className={classes.media}
                            component="img"
                            image={imageURI}
                        />
                    ) : (
                        imageURI ?
                            <Box className={classes.media} style={{ textAlign: 'center' }} >
                                <CircularProgress />
                            </Box>
                            :
                            <CardMedia
                                className={classes.media}
                                component="img"
                                image={"https://getstamped.co.uk/wp-content/uploads/WebsiteAssets/Placeholder.jpg"}
                            />
                    )}

                    <CardContent>
                        <Typography variant='h6' align='left'>
                            NFT Type: {NFTTypeArray[templateInfo.typeOfNFT]}
                        </Typography>
                        <Typography variant='h6' align='left'>
                            Max Supply: {templateInfo.maxSupply}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </div>
    )
}