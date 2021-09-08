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
    const [clientList, setClientList] = useState<string[]>([]);
    const [baseSettings, setBaseSettings] = useState<BaseSettings>({
        name: "Shit Coin",
        symbol: "SHI",
        payees: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
        shares: [1,1],
    });
    const [settings, setSettings] = useState<Settings>({
        ticketType: 0,
        maxSupply: 1000,
    });
    useEffect(() => {
        const checkAdminContract = async () => {
            if (!admin.instance) return
            console.log("NFTicketAdmin is deployed at ", admin.instance.address)
            setClientList(await admin.instance.getClientList())
        };
        checkAdminContract();
    }, [admin])

    const addNFTicket = async () => {
        if (!admin.instance) throw Error("Admin instance not ready")
        if (admin.instance) {
            const totalFee = (await admin.instance.slottingFee(settings.ticketType)).mul(settings.maxSupply)
            const tx = await admin.instance.addNFTicket(baseSettings, settings, { value: totalFee })
            console.log("addNFTicket tx", tx)
            await tx.wait()
            setClientList(await admin.instance.getClientList()) 
        }
    }

    return (
        <div>
            <button onClick={() => addNFTicket()}>create template</button>
            {clientList.map((addr)=>{
                return <NFTicketTemplateCard
                    key={addr}
                    templateAddress={addr}
                />
            })}
        </div>
    )
}