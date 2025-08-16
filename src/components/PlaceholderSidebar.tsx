import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { placeholderOptions } from '../config/ckeditor';

interface PlaceholderSidebarProps {
  onInsertPlaceholder: (placeholder: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const PlaceholderSidebar: React.FC<PlaceholderSidebarProps> = ({
  onInsertPlaceholder,
  isVisible,
  onToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['personal', 'dates', 'company']);
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(600);
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 50 });
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Categorize placeholders
  const categorizedPlaceholders = useMemo(() => {
    const categories = {
      personal: {
        name: 'Personal Information',
        icon: '👤',
        placeholders: placeholderOptions.filter(p => 
          p.value.includes('recipient_name') || 
          p.value.includes('address') || 
          p.value.includes('phone') || 
          p.value.includes('email')
        )
      },
      dates: {
        name: 'Dates',
        icon: '📅',
        placeholders: placeholderOptions.filter(p => 
          p.value.includes('date') || 
          p.value.includes('response') || 
          p.value.includes('transaction')
        )
      },
      company: {
        name: 'Company Information',
        icon: '🏢',
        placeholders: placeholderOptions.filter(p => 
          p.value.includes('company') || 
          p.value.includes('state')
        )
      },
      financial: {
        name: 'Financial',
        icon: '💰',
        placeholders: placeholderOptions.filter(p => 
          p.value.includes('amount')
        )
      }
    };

    // Filter by search term
    if (searchTerm) {
      Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey as keyof typeof categories];
        category.placeholders = category.placeholders.filter(p =>
          p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return categories;
  }, [searchTerm]);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(c => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Handle resizing and dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = resizeStart.x - e.clientX;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(250, Math.min(500, resizeStart.width + deltaX));
        const newHeight = Math.max(300, Math.min(800, resizeStart.height + deltaY));
        
        setWidth(newWidth);
        setHeight(newHeight);
      }
      
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep sidebar within viewport bounds
        const maxX = window.innerWidth - width;
        const maxY = window.innerHeight - height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
    };

    if (isResizing || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, resizeStart, dragOffset, width, height]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: width,
      height: height
    });
  };

  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.sidebar-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const getPlaceholderIcon = (placeholder: string) => {
    if (placeholder.includes('name')) return '👤';
    if (placeholder.includes('amount')) return '💰';
    if (placeholder.includes('date')) return '📅';
    if (placeholder.includes('address')) return '📍';
    if (placeholder.includes('state')) return '🏛️';
    if (placeholder.includes('company')) return '🏢';
    if (placeholder.includes('phone')) return '📞';
    if (placeholder.includes('email')) return '📧';
    return '📝';
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={sidebarRef}
      className="fixed bg-white shadow-lg border border-gray-200 z-40 flex flex-col rounded-lg"
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '250px',
        minHeight: '300px',
        maxWidth: '500px',
        maxHeight: '800px'
      }}
    >
      {/* Header */}
      <div 
        className="sidebar-header flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 cursor-move"
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">📝</span>
          <span className="font-medium text-gray-700">All Placeholders</span>
          <span className="text-xs text-gray-500">({width}×{height})</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 text-gray-500 hover:text-gray-700 rounded"
          title="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search placeholders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Placeholders List */}
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: `${height - 200}px` }}>
        {Object.entries(categorizedPlaceholders).map(([categoryKey, category]) => {
          if (category.placeholders.length === 0) return null;
          
          const isExpanded = expandedCategories.includes(categoryKey);
          
          return (
            <div key={categoryKey} className="mb-4">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {category.placeholders.length}
                  </span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {isExpanded && (
                <div className="mt-2 space-y-1">
                  {category.placeholders.map((placeholder) => (
                    <button
                      key={placeholder.value}
                      onClick={() => onInsertPlaceholder(placeholder.value)}
                      className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                      title={`Insert ${placeholder.label}`}
                    >
                      <span>{getPlaceholderIcon(placeholder.value)}</span>
                      <span className="flex-1">{placeholder.label}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        {placeholder.value}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {searchTerm && Object.values(categorizedPlaceholders).every(cat => cat.placeholders.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>No placeholders found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <p>💡 <strong>Tip:</strong> Click any placeholder to insert</p>
          <p>⌨️ <strong>Shortcut:</strong> Ctrl+Shift+P for quick menu</p>
        </div>
      </div>

      {/* Left Resize Handle (Width) */}
      <div
        className="absolute top-0 left-0 w-2 h-full cursor-ew-resize hover:bg-blue-300 transition-colors"
        onMouseDown={handleResizeStart}
        style={{
          background: isResizing ? '#3b82f6' : '#e5e7eb'
        }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Bottom Resize Handle (Height) */}
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-blue-300 transition-colors"
        onMouseDown={handleResizeStart}
        style={{
          background: isResizing ? '#3b82f6' : '#e5e7eb'
        }}
      >
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <GripVertical className="w-4 h-4 text-gray-600 rotate-90" />
        </div>
      </div>

      {/* Corner Resize Handle (Width & Height) */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-200 hover:bg-gray-300 transition-colors"
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
    </div>
  );
};

export default PlaceholderSidebar;
