import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/modal.css'
import './styles/chips.css'
import './styles/input-bubble.css'
import './styles/ai-button.css'
import './styles/background.css'
import './styles/chat-screen.css'
import './styles/explain.css'
import './styles/feedback-filled.css'
import './styles/feedback.css'
import './styles/products-strip.css'
import './styles/tokens.css'
import './styles/connection-lost.css'
import './styles/loading.css'
import './styles/voice-chat.css'
import './styles/voice-products.css'
import './styles/voice-screen.css'

// Get configuration from the Liquid template
const config = (window as any).shoppingAgentConfig || {};

console.log('Shopping Agent: Starting React app with config:', config);

// Hide the fallback button when React loads
const fallbackElement = document.querySelector('.shopping-agent-fallback') as HTMLElement;
if (fallbackElement) {
  console.log('Shopping Agent: Hiding fallback button');
  fallbackElement.style.display = 'none';
} else {
  console.log('Shopping Agent: Fallback button not found');
}

const rootElement = document.getElementById('shopping-agent-root');
if (!rootElement) {
  console.error('Shopping Agent: Root element not found!');
} else {
  console.log('Shopping Agent: Mounting React app to root element');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App config={config} />
    </React.StrictMode>,
  )
}
