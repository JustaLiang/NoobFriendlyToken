import React from 'react';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
import AdminPage from './pages/AdminPage';
import SettingPage from './pages/SettingPage';
import OpenseaPage from './pages/OpenseaPage';
import DashboardPage from './pages/DashboardPage';
import LoadingPage from './pages/LoadingPage';
import MintPage from './pages/MintPage';
import OwnerPage from './pages/OwnerPage';
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';

function App() {

  return (
    <div className="App">
      <NavBar/>
      <Router>
        <Switch>
          <Symfoni autoInit={true} loadingComponent={<LoadingPage/>}>
            <Route exact path='/' component={AdminPage} />
            <Route exact path='/market' component={OpenseaPage} />
            <Route exact path='/owner' component={OwnerPage} />
            <Route exact path='/:NFTType/:address/setup' component={SettingPage} />
            <Route exact path='/:NFTType/:address/dashboard' component={DashboardPage} />
            <Route exact path='/:NFTType/:address/mint' component={MintPage} />
          </Symfoni>
        </Switch>
      </Router>
      <Footer/>
    </div>
  );
}

export default App;
