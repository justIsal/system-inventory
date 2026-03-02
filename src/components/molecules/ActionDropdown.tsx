import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionDropdownProps {
  items: ActionItem[];
}

export function ActionDropdown({ items }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const [isVisible, setIsVisible] = useState(false); // Controls the CSS Transition opacity

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        });
        setIsOpen(true);
        // Delay the CSS transition slightly so the portal has time to mount at the correct X/Y first, avoiding the "fly-in from top-left" glitch.
        setTimeout(() => setIsVisible(true), 10);
    } else {
        setIsVisible(false);
        // Delay unmounting so the fade-out animation can play
        setTimeout(() => setIsOpen(false), 200);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // We must check if the click is outside BOTH the anchor button and the portal menu
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        !document.getElementById('portal-action-menu')?.contains(target)
      ) {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 200);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // Bind scroll to auto-close to prevent floating artifacts
    document.addEventListener("scroll", () => {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 200);
    }, true);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("scroll", () => {
            setIsVisible(false);
            setIsOpen(false);
        }, true);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="p-2 bg-transparent rounded-full hover:bg-slate-100 transition-colors text-slate-500 focus:outline-none"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
          <div
            id="portal-action-menu"
            style={{
                position: 'absolute',
                top: coords.top + 8, // 8px margin
                // Position it to right-align with the button
                left: coords.left + coords.width - 192, // 192px is w-48
            }}
            className={`w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-9999 transition-all duration-200 origin-top-right
              ${isVisible ? 'transform opacity-100 scale-100 pointer-events-auto' : 'transform opacity-0 scale-95 pointer-events-none'}
            `}
          >
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(false);
                    setTimeout(() => {
                        setIsOpen(false);
                        item.onClick();
                    }, 200);
                  }}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors hover:bg-slate-50
                    ${item.variant === 'danger' ? 'text-red-600 hover:text-red-800 hover:bg-red-50' : 'text-slate-700 hover:text-slate-900'}
                  `}
                  role="menuitem"
                >
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
      )}
    </div>
  );
}
