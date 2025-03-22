import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext({
  open: false,
  setOpen: () => {}
});

export const Dialog = ({ children, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const setOpen = (value) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    if (onOpenChange) {
      onOpenChange(value);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        {children}
      </div>
    </DialogContext.Provider>
  );
};

export const DialogContent = ({ children, className = '' }) => {
  const { setOpen } = useContext(DialogContext);
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-auto ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ className = '', children }) => {
  return (
    <div className={`px-6 py-4 border-b ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ className = '', children }) => {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  );
};

export const DialogFooter = ({ className = '', children }) => {
  return (
    <div className={`px-6 py-4 border-t flex justify-end space-x-2 ${className}`}>
      {children}
    </div>
  );
};