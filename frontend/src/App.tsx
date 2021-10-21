import React from 'react';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
import AdminPage from './pages/AdminPage';
import SettingPage from './pages/SettingPage';
import OpenseaPage from './pages/OpenseaPage';
import DashboardPage from './pages/DashboardPage'
import LoadingPage from './pages/LoadingPage'
import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';
function App() {

  return (
    <div className="App">
      <Router>
        <Switch>
          <Symfoni autoInit={true} loadingComponent={<LoadingPage/>}>
            <Route exact path='/' component={AdminPage} />
            <Route exact path='/market' component={OpenseaPage} />
            <Route exact path='/:NFTType/:address/setup' component={SettingPage} />
            <Route exact path='/:NFTType/:address/dashboard' component={DashboardPage} />
          </Symfoni>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
