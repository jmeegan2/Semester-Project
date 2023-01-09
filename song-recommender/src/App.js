
import './App.css';

import { useState, useEffect } from 'react';

export function useThisIsPlainJs() {  
  
}

function App() {
  function clickMe() {
    alert("You clicked me!");
  }

  
  return (
    <div className="App">
      
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
         <h1>Chatbot Song Recommender</h1>
        <div id="container" class="container">
        <div id="chat" class="chat">
            <div id="messages" class="messages"></div>
            <div id = "sameLine">
            <input id="input" type="text" placeholder="Say something..." autocomplete="off" autofocus="true"/>
          </div>
        </div>
    </div>
    </div>


  );
}

export default App;
