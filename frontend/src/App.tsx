import React from 'react';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
import  AdminPage from './pages/AdminPage';
import  SettingPage from './pages/SettingPage';

import { Route, Switch, BrowserRouter as Router, } from 'react-router-dom';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Switch>
            <Symfoni autoInit={true} loadingComponent={<h1>Loading...</h1>}>
            <Route exact path='/' component={AdminPage}/>
            <Route exact path='/:NFTType' component={SettingPage}/>
            </Symfoni>
          </Switch>
        </Router>
      </header>
    </div>
  );
}

export default App;
