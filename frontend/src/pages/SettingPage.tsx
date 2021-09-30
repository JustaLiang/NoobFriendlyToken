import { create } from 'ipfs-http-client';
import React, { useCallback, useState} from 'react';
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
    const [count,setCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const addCount = useCallback(() => {
        console.log(count);
        setCount(count=>count+1);
       }, [setCount]);
   
        // const addOptions = {
        //     pin: true,
        //     rawLeaves:true,
        //     progress: (prog:number) => {
        //         console.log(prog);
        //         addCount();
        //     }
        // }
        
    // const progress = Math.min(count / totalCount * 100,100);
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <InitStepBlindBox address={address}/>
        </div>
    );
}

export default SettingPage

