import React from 'react';
// import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Dashboard from './Dashboard';
import Login from './Login';
// import Preferences from '../Preferences/Preferences';
import useToken from './useToken';

function App() {

  const { token, setToken } = useToken();

  if (!token) {
    return <div className="App">
      <Login setToken={setToken} />
    </div>
  }

  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;