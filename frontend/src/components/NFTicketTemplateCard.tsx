import React, { useContext, useEffect, useState } from 'react';
import { SignerContext, ProviderContext } from "../hardhat/SymfoniContext";
import { NFTicketTemplate__factory } from "../hardhat/typechain/factories/NFTicketTemplate__factory";
import { NFTicketTemplate } from "../hardhat/typechain/NFTicketTemplate";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardHeader, CardMedia, CardContent, Typography, Box, CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        width: 300,
    },
    media: {
        height: 300,
    },
    info: {
        fontWeight: 'bold',
    },
}))

interface Props {
    templateAddress: string
}

interface TemplateInfo {
    name: string,
    symbol: string,
    ticketType: number,
    maxSupply: number,
}

const baycURI = "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/";

export const NFTicketTemplateCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const signer = useContext(SignerContext);
    const provider = useContext(ProviderContext);
    const [imageURI, setImageURI] = useState<string>("loading");
    const [template, setTemplate] = useState<NFTicketTemplate>();
    const [templateInfo, setTemplateInfo] = useState<TemplateInfo>({
        name: "name",
        symbol: "symbol",
        ticketType: 0,
        maxSupply: 0,
    });
    const { templateAddress } = props;
    useEffect(() => {
        if (signer[0]) {
            setTemplate(NFTicketTemplate__factory.connect(templateAddress, signer[0]))
            console.log("connect contract by signer")
        }
        else if (provider[0]) {
            setTemplate(NFTicketTemplate__factory.connect(templateAddress, provider[0]))
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
                    console.log(err)
                    setImageURI("")
                })
        }
        updateImageURI()
    }, [imageURI, templateAddress])

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
                <CardHeader
                    title={templateInfo.name}
                    subheader={templateInfo.symbol}
                />
                {imageURI !== "loading"? (
                    <CardMedia
                        className={classes.media}
                        component="img"
                        image={imageURI}
                        alt="Not initialize"
                    />
                ):(
                    <Box className={classes.media} style={{ textAlign: 'center'}} >
                        <CircularProgress />
                    </Box>
                )}

                <CardContent>
                    <Typography variant='h6' className={classes.info}>
                        Ticket Type: {templateInfo.ticketType}
                    </Typography>
                    <Typography variant='h6' className={classes.info}>
                        Max Supply: {templateInfo.maxSupply}
                    </Typography>
                </CardContent>
            </Card>
        </div>
    )
}