import React, { useContext, useEffect, useState } from 'react';
import { SignerContext, ProviderContext } from "../hardhat/SymfoniContext";
import { NFTicketTemplate__factory } from "../hardhat/typechain/factories/NFTicketTemplate__factory";
import { NFTicketTemplate } from "../hardhat/typechain/NFTicketTemplate";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardHeader, CardMedia, CardContent, Typography } from "@material-ui/core";

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

export const NFTicketTemplateCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const signer = useContext(SignerContext);
    const provider = useContext(ProviderContext);
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
                <CardMedia
                    className={classes.media}
                    component="img"
                    image="https://bafybeibnzhc7vp4hnfcocw7s2jej2tj5xqpwseyz3ifylismh47cr45rhm.ipfs.dweb.link/"
                    alt="Not initialize"
                />
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