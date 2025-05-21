import React from 'react';
import { socialLinks } from './utils';

interface DebugOverlayProps {
  visible: boolean;
  currentMode: string;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ visible, currentMode }) => {
  if (!visible) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
        maxWidth: '320px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', color: '#88ccff', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '5px' }}>
        Physics Controls
      </h3>
      <div style={{ marginBottom: '10px', backgroundColor: 'rgba(136, 204, 255, 0.1)', padding: '5px', borderRadius: '4px' }}>
        Current Mode: <span style={{ color: '#ff88aa', fontWeight: 'bold' }}>{currentMode.toUpperCase()}</span>
      </div>      
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        <li>Click face to cycle animations</li>
        <li>Press &quot;d&quot; to toggle this panel</li>
        <li>Press &quot;r&quot; for random motion</li>
        <li>Press &quot;o&quot; for orbital arrangement</li>
        <li>Press &quot;s&quot; for spin animation</li>
        <li>Press &quot;h&quot; for helix animation</li>
        <li>Press &quot;p&quot; for pulse animation</li>
        <li>Press &quot;l&quot; to highlight in sequence</li>
        <li>Press 1-{socialLinks.length} to center a ball</li>
        <li>Click any ball to open its link</li>
      </ul>
      
      <h4 style={{ margin: '15px 0 5px 0', color: '#ffcc66', fontSize: '13px' }}>Easter Eggs:</h4>
      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
        <li>Ctrl+T: Triangle formation</li>
        <li>Ctrl+C: Cube formation</li>
        <li>Ctrl+L: Line formation</li>
      </ul>
    </div>
  );
};

export default DebugOverlay;
