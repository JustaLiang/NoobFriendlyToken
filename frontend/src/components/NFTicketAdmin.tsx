import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import React, { useContext, useEffect, useState } from 'react';
import { CurrentAddressContext, NFTicketAdminContext } from "../hardhat/SymfoniContext";
import { NFTicketTemplateCard } from "./NFTicketTemplateCard";
import { TextField, Button, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        maxHeight: 580,
    },
    filled: {
        background: '#FFF1E6',
        borderRadius: 5,
        marginRight: theme.spacing(1),
    },
    tmpList: {
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 30,
        width: 950,
        gap: 20,
        overflowX: "scroll",
        border: '0.5px solid rgba(0, 0, 0, 0.125)',
    }
}));

interface Props { }

interface BaseSettings {
    name: string,
    symbol: string,
    payees: string[],
    shares: number[],
    ticketType: number,
    maxSupply: number,
}

export const NFTicketAdmin: React.FC<Props> = () => {
    const classes = useStyles();
    const admin = useContext(NFTicketAdminContext);
    const account = useContext(CurrentAddressContext);
    const [templateList, setTemplateList] = useState<string[]>([]);
    const [baseSettings, setBaseSettings] = useState<BaseSettings>({
        name: "Good Game Easy",
        symbol: "GGEZ",
        payees: [account[0]],
        shares: [1],
        ticketType: 0,
        maxSupply: 0,
    });
    useEffect(() => {
        const checkAdminContract = async () => {
            if (!admin.instance) return
            console.log("NFTicketAdmin is deployed at ", admin.instance.address)
            setTemplateList(await admin.instance.getTemplateList())
        };
        checkAdminContract();
    }, [admin])

    const addNFTicket = async () => {
        if (!admin.instance) throw Error("Admin instance not ready")
        if (admin.instance) {
            const fee = await admin.instance.slottingFee(baseSettings.ticketType)
                .then((fee) => { return fee })
                .catch(() => { return null })
            if (isBigNumberish(fee)) {
                const totalFee = fee.mul(baseSettings.maxSupply)
                const tx = await admin.instance.addNFTicket(baseSettings, { value: totalFee })
                console.log("[NFTicketAdmin.addNFTicket]: ", tx)
                await tx.wait()
                setTemplateList(await admin.instance.getTemplateList())
            }
        }
    }

    return (
        <div>
            <Box>
            <form
                onSubmit={(e: React.SyntheticEvent) => {
                    e.preventDefault()
                    addNFTicket()
                }}
                className={classes.root}
                autoComplete="off"
            >
                <TextField label="name" variant="filled" className={classes.filled} onChange={(e) =>
                    { setBaseSettings({ ...baseSettings, name: e.target.value }) }}
                />
                <TextField label="symbol" variant="filled" className={classes.filled} onChange={(e) =>
                    { setBaseSettings({ ...baseSettings, symbol: e.target.value }) }}
                />
                <TextField label="ticket type" variant="filled" className={classes.filled} onChange={(e) =>
                    { setBaseSettings({ ...baseSettings, ticketType: parseInt(e.target.value) }) }}
                />
                <TextField label="max supply" variant="filled" className={classes.filled} onChange={(e) =>
                    { setBaseSettings({ ...baseSettings, maxSupply: parseInt(e.target.value) }) }}
                />
                <Button variant="contained" type="submit">create album</Button>
            </form>
            </Box>
            <Box display="flex" flexDirection="row" className={classes.tmpList}>
                {templateList.map((addr) => {
                    return <NFTicketTemplateCard
                        key={addr}
                        templateAddress={addr}
                    />
                })}
            </Box>
        </div>
    )
}