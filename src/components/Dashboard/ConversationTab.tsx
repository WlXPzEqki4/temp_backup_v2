
import React, { useEffect } from 'react';

interface ConversationTabProps {
  userClassificationLevel?: string;
}

const ConversationTab: React.FC<ConversationTabProps> = ({ userClassificationLevel = 'unclassified' }) => {
  // Set the specific agent ID provided by the user
  const AGENT_ID = "T0KR2s0LicRIPaN74r9F";
  
  useEffect(() => {
    // Ensure the script is loaded and properly initialized
    if (!document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]')) {
      const script = document.createElement('script');
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      script.defer = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
      
      // Add a listener to know when script is loaded
      script.onload = () => {
        console.log("ElevenLabs Convai script loaded successfully");
      };
      
      script.onerror = () => {
        console.error("Failed to load ElevenLabs Convai script");
      };
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* ElevenLabs Conversation Widget with explicit height and width */}
      <div className="flex-grow bg-white rounded-lg border overflow-hidden mb-4" style={{ minHeight: "400px", position: "relative" }}>
        <elevenlabs-convai 
          agent-id={AGENT_ID} 
          style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '400px', 
            display: 'block',
            position: 'relative', 
            top: '0', 
            left: '0', 
            right: '0',
            bottom: '0'
          }}
        ></elevenlabs-convai>
      </div>
    </div>
  );
};

export default ConversationTab;
