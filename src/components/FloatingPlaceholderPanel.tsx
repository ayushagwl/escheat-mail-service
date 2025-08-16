import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Move, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface FloatingPlaceholderPanelProps {
  onInsertPlaceholder: (placeholder: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const FloatingPlaceholderPanel: React.FC<FloatingPlaceholderPanelProps> = ({
  onInsertPlaceholder,
  isVisible,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Most commonly used placeholders for quick access
  const quickPlaceholders = [
    { label: 'Name', value: '{{recipient_name}}', icon: '👤' },
    { label: 'Amount', value: '{{amount}}', icon: '💰' },
    { label: 'Today', value: '{{todays_date}}', icon: '📅' },
    { label: 'Address', value: '{{address}}', icon: '📍' },
    { label: 'State', value: '{{state}}', icon: '🏛️' },
    { label: 'Company', value: '{{company_name}}', icon: '🏢' }
  ];

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Handle dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep panel within viewport bounds
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(250, Math.min(500, resizeStart.width + deltaX));
        const newHeight = Math.max(150, Math.min(600, resizeStart.height + deltaY));
        
        setSize({
          width: newWidth,
          height: newHeight
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, size.width, size.height]);

  if (!isVisible) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the header area
    const target = e.target as HTMLElement;
    console.log('Mouse down on:', target.className, 'Closest header:', target.closest('.panel-header'));
    if (target.closest('.panel-header')) {
      console.log('Starting drag from position:', position);
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const resetPosition = () => {
    setPosition({ x: 20, y: 100 });
    setSize({ width: 300, height: 200 });
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200"
      style={{ 
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '250px',
        minHeight: '150px',
        maxWidth: '500px',
        maxHeight: '600px'
      }}
    >
      {/* Header */}
      <div 
        className="panel-header flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">📝</span>
          <span className="font-medium text-sm text-gray-700">Quick Insert</span>
          <Move className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 mr-2">
            {size.width}×{size.height}
          </span>
          <button
            onClick={resetPosition}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Reset position"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Placeholders */}
      <div className="p-3 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-2">
          {quickPlaceholders.map((placeholder) => (
            <button
              key={placeholder.value}
              onClick={() => onInsertPlaceholder(placeholder.value)}
              className="flex items-center space-x-2 p-2 text-xs bg-blue-50 text-blue-800 rounded-md hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
              title={`Insert ${placeholder.label}`}
            >
              <span>{placeholder.icon}</span>
              <span>{placeholder.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize bg-gray-200 hover:bg-gray-300 transition-colors"
        onMouseDown={handleResizeStart}
        style={{
          background: isResizing ? '#6b7280' : '#e5e7eb',
          borderRadius: '0 0 0.5rem 0'
        }}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2">
          <div className="w-full h-0.5 bg-gray-600 mb-0.5"></div>
          <div className="w-full h-0.5 bg-gray-600 mb-0.5"></div>
          <div className="w-full h-0.5 bg-gray-600"></div>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">
            💡 Tip: Use the right sidebar for all placeholders
          </p>
          <div className="text-xs text-gray-500">
            <p>• Click any button above to insert</p>
            <p>• Drag the header to move panel</p>
            <p>• Use Ctrl+Shift+P for quick menu</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingPlaceholderPanel;
