import { useState, useCallback } from 'react';
import './App.css';

function App() {
  const [sharedPrompt, setSharedPrompt] = useState('');
  const [responses, setResponses] = useState({
    ollama: '',
    gemini: ''
  });
  const [loading, setLoading] = useState({
    ollama: false,
    gemini: false
  });
 
  const models = [
    { id: 'gemini', name: 'Gemini 3.1 Flash Lite', color: '#2ECC71' },
    { id: 'ollama', name: 'Ollama (Gemma 3)', color: '#E67E22' }
  ];

  const handlePromptChange = useCallback((value) => {
    setSharedPrompt(value);
  }, []);

  const fetchModelResponse = useCallback(async (model, prompt) => {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const response = await fetch(`http://localhost:8080/api/${model}/${encodedPrompt}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.text();
      return data;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!sharedPrompt.trim()) return;
    
    // Set all models to loading
    setLoading({
      ollama: true,
      gemini: true
    });
    
    // Initialize all responses as loading
    setResponses({
      ollama: 'Loading...',
      gemini: 'Loading...'
    });
    
    // Process each model independently
    models.forEach(model => {
      fetchModelResponse(model.id, sharedPrompt)
        .then(response => {
          // Update this specific model's response
          setResponses(prev => ({
            ...prev,
            [model.id]: response
          }));

          // Set this model's loading state to false
          setLoading(prev => ({
            ...prev,
            [model.id]: false
          }));
        })
        .catch(error => {
          // Handle errors for this specific model
          setResponses(prev => ({
            ...prev,
            [model.id]: `Error: ${error.message}`
          }));
          
          setLoading(prev => ({
            ...prev,
            [model.id]: false
          }));
        });
    });
  }, [sharedPrompt, fetchModelResponse, models]);

  const isLoading = Object.values(loading).some(status => status);
  
  return (
    <div className="app-container">
      <h1>Exploring Different LLM Models</h1>
      
      <div className="shared-prompt-container">
        <div className="shared-prompt-area">
          <textarea
            placeholder="Enter a prompt to send to all models..."
            value={sharedPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            disabled={isLoading}
          />
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !sharedPrompt.trim()}
            className="submit-all-btn"
          >
            {isLoading ? 'Sending...' : 'Compare All Models'}
          </button>
        </div>
      </div>

      <div className="model-grid">
        {models.map(model => (
          <div 
            key={model.id} 
            className="model-box"
            style={{ 
              borderColor: model.color
            }}
          >
            <h2 style={{ color: model.color }}>
              {model.name}
            </h2>
            
            <div className="response-area">
              <h3>Response:</h3>
              <div className="response-content">
                {responses[model.id] ? (
                  <div className="response-text">{responses[model.id]}</div>
                ) : (
                  <div className="placeholder-text">Response will appear here</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;