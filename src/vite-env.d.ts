
/// <reference types="vite/client" />

// Add type declaration for ElevenLabs Convai custom element
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'agent-id'?: string;
    }, HTMLElement>;
  }
}
