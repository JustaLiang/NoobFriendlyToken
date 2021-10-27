import React from 'react'
import { AppBar, Toolbar,Button } from '@material-ui/core'
import { logo } from '../assets'
interface Props {

}

const NavBar: React.FC<Props> = () => {
    return (
        <AppBar position='relative' style={{backgroundColor:'#fff',boxShadow:'none'}}>
            <Toolbar>
                <Button href='/'>
                <img src={logo} alt='logo' height='60px' width='180px'/>
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar
