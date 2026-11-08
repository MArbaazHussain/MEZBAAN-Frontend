import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PackageProvider } from './context/PackageContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PackageProvider>
          <App />
        </PackageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
