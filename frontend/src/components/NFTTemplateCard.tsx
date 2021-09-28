import React, { useContext, useEffect, useState } from 'react';
import { SignerContext, ProviderContext } from "../hardhat/SymfoniContext";
import { NoobFriendlyTokenTemplate__factory } from "../hardhat/typechain/factories/NoobFriendlyTokenTemplate__factory";
import { NoobFriendlyTokenTemplate } from "../hardhat/typechain/NoobFriendlyTokenTemplate";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardHeader, CardMedia, CardContent, Typography, Box, CircularProgress, CardActionArea } from "@material-ui/core";
import { NFTTypeArray } from "./NFTTypeArray";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        width: 300,
    },
    media: {
        height: 300,
    },
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

const baycURI = "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/";

export const NFTTemplateCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const signer = useContext(SignerContext);
    const provider = useContext(ProviderContext);
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
        else if (provider[0]) {
            setTemplate(NoobFriendlyTokenTemplate__factory.connect(templateAddress, provider[0]))
            console.log("connect contract by provider")
        }
        else {
            console.log("no signer or provider")
        }
    }, [signer, provider, templateAddress])

    useEffect(() => {
        const updateImageURI = async () => {
            const randomNum = parseInt(templateAddress) % 10000
            fetch(`${baycURI}${randomNum}`)
                .then((res) => {
                    if (res.status === 404) throw Error("URI error: 404")
                    return res.json()
                })
                .then((metadata) => {
                    setImageURI("https://ipfs.io/ipfs" + metadata.image.slice(6))
                    console.log(randomNum)
                })
                .catch((err) => {
                    setImageURI("")
                    console.log(err)
                })
        }
        updateImageURI()
    }, [templateAddress])

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

    return (
        <div>
            <Card className={classes.root} style={{ borderRadius: 20 }} elevation={10} >
                <CardActionArea component={Link} to={`/${NFTTypeArray[templateInfo.typeOfNFT].toLowerCase()}`}>
                    <CardHeader
                        title={templateInfo.name}
                        subheader={templateInfo.symbol}
                    />
                    {imageURI !== "fetching" && imgLoaded ? (
                        <CardMedia
                            className={classes.media}
                            component="img"
                            image={imageURI}
                            alt="Not initialized"
                        />
                    ) : (
                        <Box className={classes.media} style={{ textAlign: 'center' }} >
                            <CircularProgress />
                        </Box>
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