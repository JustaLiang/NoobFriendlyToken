import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import React, { useContext, useEffect, useState } from 'react';
import { NFTicketAdminContext } from "../hardhat/SymfoniContext";
import { NFTicketTemplateCard } from "./NFTicketTemplateCard";

interface Props { }

interface BaseSettings {
    name: string,
    symbol: string,
    payees: string[],
    shares: number[],
}

interface Settings {
    ticketType: number,
    maxSupply: number,
}

export const NFTicketAdmin: React.FC<Props> = () => {
    const admin = useContext(NFTicketAdminContext)
    const [templateList, setTemplateList] = useState<string[]>([]);
    const [baseSettings, setBaseSettings] = useState<BaseSettings>({
        name: "GGEZ Coin",
        symbol: "GGEZ",
        payees: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
        shares: [1,1],
    });
    const [settings, setSettings] = useState<Settings>({
        ticketType: 0,
        maxSupply: 10000,
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
            const fee = await admin.instance.slottingFee(settings.ticketType)
                        .then((fee)=> {return fee})
                        .catch(()=>{return null})
            if (isBigNumberish(fee)) {
                const totalFee = fee.mul(settings.maxSupply)
                const tx = await admin.instance.addNFTicket(baseSettings, settings, { value: totalFee })
                console.log("addNFTicket tx", tx)
                await tx.wait()
                setTemplateList(await admin.instance.getTemplateList()) 
            }
        }
    }

    return (
        <div>
            <button onClick={() => addNFTicket()}>create template</button>
            {templateList.map((addr)=>{
                return <NFTicketTemplateCard
                    key={addr}
                    templateAddress={addr}
                />
            })}
        </div>
    )
}