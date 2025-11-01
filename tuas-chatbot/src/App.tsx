import React, { useEffect, useState } from 'react';
import { useConversationStore } from './store/conversationStore';
import { useConversationHandler } from './hooks/useConversationHandler';

function App() {
  const { initializeConversation, conversation } = useConversationStore();
  const { processUserMessage, isLoading } = useConversationHandler();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate ChatKit initialization
    const timer = setTimeout(() => {
      setIsReady(true);
      initializeConversation();
    }, 1000);

    return () => clearTimeout(timer);
  }, [initializeConversation]);

  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return;

    await processUserMessage(message);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Tuas Power Supply</h1>
        <p>Customer Signup Assistant - Switch to competitive electricity rates in minutes!</p>
      </div>

      <div className="chat-content">
        {isReady ? (
          <TuasChatInterface
            messages={conversation.conversationHistory}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            validationErrors={conversation.validationErrors}
            currentState={conversation.state}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            <div>
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>🔌</div>
              Initializing chat system...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TuasChatInterfaceProps {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  onSubmit: (message: string) => void;
  isLoading: boolean;
  validationErrors: Array<{ field: string; message: string }>;
  currentState: string;
}

const TuasChatInterface: React.FC<TuasChatInterfaceProps> = ({
  messages,
  onSubmit,
  isLoading,
  validationErrors,
  currentState
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#f9fafb'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                backgroundColor: message.role === 'user' ? '#3b82f6' : '#ffffff',
                color: message.role === 'user' ? 'white' : '#374151',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626'
          }}>
            ⚠️ {validationErrors[0].message}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              color: '#6b7280'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Typing...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              currentState === 'COMPLETED'
                ? 'Thank you for your application!'
                : currentState === 'REJECTED'
                ? 'Sorry, we cannot proceed with your application.'
                : 'Type your message...'
            }
            disabled={isLoading || currentState === 'COMPLETED' || currentState === 'REJECTED'}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || currentState === 'COMPLETED' || currentState === 'REJECTED'}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: (!inputValue.trim() || isLoading || currentState === 'COMPLETED' || currentState === 'REJECTED') ? 0.5 : 1,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </form>

        {/* Progress indicator */}
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          {getProgressText(currentState)}
        </div>
      </div>

      <style>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #9ca3af;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

const getProgressText = (state: string): string => {
  switch (state) {
    case 'GREETING':
    case 'CUSTOMER_TYPE_IDENTIFICATION':
      return 'Step 1 of 7 - Customer Information';
    case 'EDGE_CASE_CHECK':
      return 'Step 2 of 7 - Eligibility Check';
    case 'PLAN_EDUCATION':
    case 'PLAN_SELECTION':
      return 'Step 3 of 7 - Plan Selection';
    case 'PERSONAL_DETAILS':
      return 'Step 4 of 7 - Personal Details';
    case 'PREMISE_DETAILS':
      return 'Step 5 of 7 - Premise Details';
    case 'START_DATE':
    case 'INSURANCE_OPTIN':
      return 'Step 6 of 7 - Preferences';
    case 'CONFIRMATION':
    case 'SIGNATURE':
      return 'Step 7 of 7 - Confirmation';
    case 'COMPLETED':
      return '✅ Application Complete';
    case 'REJECTED':
      return '❌ Application Not Eligible';
    default:
      return '';
  }
};

export default App;