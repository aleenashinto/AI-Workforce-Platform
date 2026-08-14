import { render } from 'preact';
import { Widget } from './Widget';
import styles from './style.css?inline'; // Vite specific way to import css as string

// Initialize Widget
function initWidget() {
  const scriptTag = document.currentScript as HTMLScriptElement;
  
  // Read config from data attributes
  const config = {
    color: scriptTag?.getAttribute('data-color') || '#4F46E5', // Indigo-600
    position: scriptTag?.getAttribute('data-position') || 'bottom-right',
    greeting: scriptTag?.getAttribute('data-greeting') || 'Hi there! How can I help you today?',
    orgId: scriptTag?.getAttribute('data-org-id') || '',
  };

  // Create a container
  const container = document.createElement('div');
  container.id = 'ai-workforce-widget-root';
  document.body.appendChild(container);

  // Attach shadow DOM
  const shadow = container.attachShadow({ mode: 'open' });

  // Inject CSS
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  shadow.appendChild(styleSheet);

  // Render Preact App
  const appRoot = document.createElement('div');
  shadow.appendChild(appRoot);

  render(<Widget config={config} />, appRoot);
}

// Auto-init if not running in module mode
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    initWidget();
  } else {
    window.addEventListener('load', initWidget);
  }
}
