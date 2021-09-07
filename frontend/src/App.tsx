import React from 'react';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
// import { Greeter } from './components/Greeter';
import { NFTicketAdmin } from './components/NFTicketAdmin';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Symfoni autoInit={true} >
          <NFTicketAdmin/>
        </Symfoni>
      </header>
    </div>
  );
}

export default App;
