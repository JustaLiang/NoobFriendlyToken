import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { Toolbar } from '@mui/material'
interface Props {
    children: React.ReactNode
}
export default function Layout({ children }: Props) {
    return (
        <div>
            <Header />
            <Toolbar/>
            {children}
            {/* <Footer/> */}
        </div>
    )
}
