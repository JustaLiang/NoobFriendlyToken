import React from 'react'
import { AppBar, Toolbar, Typography } from '@material-ui/core';
interface Props {

}

const OpenseaPage: React.FC<Props> = () => {
    return (
        <div>
            <AppBar style={{ backgroundColor: '#fff' }}>
                <Toolbar>
                    <Typography style={{ color: 'blue' }}>NoobFriendlyToken</Typography>
                </Toolbar>
            </AppBar>
            <div style={{ height: '100vh' }}>
                <Toolbar />
                <iframe 
                    title="This is a embedded page"
                    src='https://testnets.opensea.io/collection/cheers3dondon-test-collection?embed=true'
                    width='100%'
                    height='100%'
                    frameBorder='0'
                    allowFullScreen>

                </iframe>
            </div>
        </div>
    )
}

export default OpenseaPage
