import React from 'react'
import { CircularProgress } from '@material-ui/core';

interface Props {
    
}

const LoadingPage: React.FC<Props> = () => {
    return (
        <div style={{minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <CircularProgress/>
        </div>
    )
}

export default LoadingPage
