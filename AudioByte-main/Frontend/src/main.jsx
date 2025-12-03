// Frontend/src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify'; // <-- ADD THIS
import awsExports from './config/aws-exports'; // <-- ADD THIS

// Configure Amplify
Amplify.configure(awsExports); // <-- ADD THIS

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
