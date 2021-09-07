import React, { useContext, useEffect, useState } from 'react';
import { NFTicketAdminContext } from "../hardhat/SymfoniContext";

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
        name: "test coin",
        symbol: "TTC",
        payees: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
        shares: [1],
    });
    const [settings, setSettings] = useState<Settings>({
        ticketType: 0,
        maxSupply: 100,
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
            const tx = await admin.instance.addNFTicket(baseSettings, settings, {value: 1e14})
            console.log("addNFTicket tx", tx)
            await tx.wait()
            setClientList(await admin.instance.getClientList())
        }
    }

    return (
        <div>
            <button onClick={() => addNFTicket()}>create template</button>
            {clientList.map((addr)=>{
                return <p key={addr}>{addr}</p>
            })}
        </div>
    )
}