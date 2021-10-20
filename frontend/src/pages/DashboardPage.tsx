import { Box, Button, Container, Paper, TextField } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { NFTBlindboxContext } from '../hardhat/SymfoniContext';
import { NFTBlindbox } from '../hardhat/typechain/NFTBlindbox';
interface MatchParams {
    NFTType: string
    address: string
}
interface Props extends RouteComponentProps<MatchParams> {
}
const DashboardPage: React.FC<Props> = (props) => {
    const address = props.match.params.address;
    const blindBox = useContext(NFTBlindboxContext);
    const [isReveal, setIsReveal] = useState<boolean>(false);
    const [blindboxContract, setBlindBoxContract] = useState<NFTBlindbox>();
    const [baseURI, setBaseURI] = useState<string>();
    const [coverURI, setCoverURI] = useState<string>();
    const [withdrawAddress, setWithdrawAddress] = useState<string>();
    useEffect(() => {
        const connectToContract = async () => {
            if (!blindBox.factory) return
            const contract = blindBox.factory.attach(address);
            setBlindBoxContract(contract);
            // const reveal = await contract.startingIndex();
            // console.log(reveal)
            // if (!reveal.eq(0)) {
            //     setIsReveal(false);
            // }

        };
        connectToContract();
    }, [blindBox, address]);
    const handleBaseURIChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBaseURI(e.target.value);
    }
    const handleCoverURIChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCoverURI(e.target.value)
    }
    const handleWithdrawAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setWithdrawAddress(e.target.value)
    }
    const handleSetCoverURI = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!coverURI) return;
        await blindboxContract?.setCoverURI(coverURI);
    }
    const handleSetBaseURI = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!baseURI) return;
        await blindboxContract?.setBaseURI(baseURI);
    }
    const handleWithDraw = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!withdrawAddress) return;
        await blindboxContract?.release(withdrawAddress);
    }
    const handleSetReveal = async () => {
        await blindboxContract?.reveal();
    }
   

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Container>
                <Paper>
                    {address}
                    <br />
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Box >
                            <Button disabled={isReveal} onClick={handleSetReveal} variant='contained' style={{ textTransform: 'none' }}>Reveal</Button>
                        </Box>
                        <Box>
                            <form onSubmit={handleSetBaseURI}>
                                <TextField label="baseURI" variant="outlined" placeholder='ipfs://' size="small" style={{ width: '220px' }} value={baseURI} onChange={handleBaseURIChange} />
                                <Button variant='contained' style={{ textTransform: 'none' }} type="submit">Set base URI</Button>
                            </form>
                        </Box>
                        <Box>
                            <form onSubmit={handleSetCoverURI}>
                                <TextField label="coverURI" variant="outlined" placeholder='ipfs://' size="small" style={{ width: '220px' }} value={coverURI} onChange={handleCoverURIChange} />
                                <Button variant='contained' style={{ textTransform: 'none' }} type="submit">Set cover URI</Button>
                            </form>
                        </Box>
                        <Box>
                            <form onSubmit={handleWithDraw}>
                                <TextField label="address" variant="outlined" placeholder='0x' size="small" style={{ width: '220px' }} value={withdrawAddress} onChange={handleWithdrawAddressChange} />
                                <Button variant='contained' style={{ textTransform: 'none' }} type="submit">Withdraw</Button>
                            </form>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </div>
    )
}

export default DashboardPage
