import React from 'react';
import { RouteComponentProps } from 'react-router';
import InitStepBlindBox from '../components/InitStepBlindBox';


interface MatchParams {
    NFTType: string
    address:string
}

interface Props extends RouteComponentProps<MatchParams> {
}
function SettingPage(props: Props) {
    const address = props.match.params.address;
    
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <InitStepBlindBox address={address}/>
        </div>
    );
}

export default SettingPage

