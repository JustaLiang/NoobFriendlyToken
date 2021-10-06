import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Symfoni } from '../hardhat/SymfoniContext'
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Symfoni autoInit={true} loadingComponent={<h1>Loading...</h1>}>
      <Component {...pageProps} />
    </Symfoni>
  )
}
export default MyApp
