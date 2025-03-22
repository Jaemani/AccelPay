import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext({
  selectedTab: '',
  setSelectedTab: () => {}
});

export const Tabs = ({ defaultValue, children, className = '' }) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className = '' }) => {
  const { selectedTab, setSelectedTab } = useContext(TabsContext);
  const isActive = selectedTab === value;
  
  return (
    <button
      onClick={() => setSelectedTab(value)}
      className={`px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
        isActive 
          ? 'bg-white text-blue-700 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '' }) => {
  const { selectedTab } = useContext(TabsContext);
  
  if (selectedTab !== value) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
};