import React, { useEffect, useState,useContext } from 'react'
import { RouteComponentProps } from 'react-router';
import { Container, Paper,Button } from '@material-ui/core'
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
    useEffect(() => {
        const connectToContract =  () => {
            if (!blindBox.factory) return
            const contract = blindBox.factory.attach(address);
            setBlindBoxContract(contract);
            const reveal = contract.startInde;
            if(!reveal){
                setIsReveal(false);
            }
            
        };
        connectToContract();
    }, [blindBox, address]);
    const handleSetReveal = async () =>{
        await blindboxContract?.setStartingIndex();
    }
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Container>
                <Paper>
                    This is a dashboard page: {address}
                    <br/>
                    <Button disabled={isReveal} onClick={handleSetReveal} variant='contained'>Reveal</Button>

                </Paper>
            </Container>
        </div>
    )
}

export default DashboardPage
