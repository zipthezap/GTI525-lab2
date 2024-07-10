import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/*
        <h1>CSV.js Data</h1>
        <pre>{JSON.stringify(stationData[0], null, 2)}</pre>
        <pre>{JSON.stringify(stationInven, null, 2)}</pre>
*/
reportWebVitals();
