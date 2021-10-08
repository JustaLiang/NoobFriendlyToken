import React from "react";
import { AppBar, Toolbar, Container, Box, Button, Typography } from "@mui/material";

const Header: React.FC<Props> = () => {
    return (
        <>
        <AppBar sx={{boxShadow:'none'}}>
            <Toolbar sx={{backgroundColor:"#fff"}} >
                <Container maxWidth="lg" sx={{ display: 'flex',justifyContent:"space-between",color:'#0070f3' }}>
                    <Box sx={{ display: 'flex',justifyContent:'center',alignItems:'center'}}>
                        <Typography sx={{color:'#0070f3',fontWeight:'bold'}}>
                            NoobFriendlyToken
                        </Typography>
                    </Box>
                    <Box>
                        <Button variant='contained' sx={{
                            backgroundColor:"#0070f3",
                            textTransform:"none",
                        "&:hover":{
                            backgroundColor:"#fff",
                            color:'#0070f3',
                            border:'0.5px solid #0070f3'
                        }}
                        }>
                            Create
                        </Button>
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
        </>
    )
}

export default Header;