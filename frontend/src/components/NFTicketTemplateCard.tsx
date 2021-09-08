import React, { useContext, useEffect, useState } from 'react';
import { SignerContext, ProviderContext } from "../hardhat/SymfoniContext";
import { NFTicketTemplate__factory } from "../hardhat/typechain/factories/NFTicketTemplate__factory";
import { NFTicketTemplate } from "../hardhat/typechain/NFTicketTemplate";

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
    const signer = useContext(SignerContext)
    const provider = useContext(ProviderContext)
    const [template, setTemplate] = useState<NFTicketTemplate>()
    const [templateInfo, setTemplateInfo] = useState<TemplateInfo>({
        name: "name",
        symbol: "symbol",
        ticketType: 0,
        maxSupply: 0,
    })
    useEffect(() => {
            if (signer[0]) {
                setTemplate(NFTicketTemplate__factory.connect(props.templateAddress, signer[0]))
                console.log("connect contract by signer")
            }
            else if (provider[0]) {
                setTemplate(NFTicketTemplate__factory.connect(props.templateAddress, provider[0]))
                console.log("connect contract by signer")
            }
            else {
                console.log("no signer or provider")
            }
    }, [signer, provider, props])

    useEffect(() => {
        const reloadTemplate = async () => {
            if (template) {
                const settings = await template.settings()
                setTemplateInfo({
                    name: await template.name(),
                    symbol: await template.symbol(),
                    ticketType: settings.ticketType,
                    maxSupply: settings.maxSupply,
                })
            }
        }
        reloadTemplate()
    }, [template])

    return (
        <div>
            {templateInfo.name} | {templateInfo.symbol} | {templateInfo.ticketType} | {templateInfo.maxSupply}
        </div>
    )
}