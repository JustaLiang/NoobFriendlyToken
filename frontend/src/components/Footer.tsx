import React from 'react'
interface Props {

}

const Footer: React.FC<Props> = () => {
    return (
        <footer style={{ marginTop:'30px',paddingTop: '30px',borderTop:'1px solid #ffffff30' }}>
            <div style={{ display: 'flex', justifyContent: 'center',alignItems: 'center',fontSize:'0.5em',paddingBottom:'20px'}}>
                &#169; Noob Friendly Token 2021
            </div>
            
        </footer>
    )
}

export default Footer
