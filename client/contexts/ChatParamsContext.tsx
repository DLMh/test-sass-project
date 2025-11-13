'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface ChatParamsContextType {
  value: string | null;
  setValue: (value: string | null) => void;
}

const ChatParamsContext = createContext<ChatParamsContextType | undefined>(undefined);

export function ChatParamsProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<string | null>(null);

  const stableSetValue = useCallback((newValue: string | null) => {
    setValue(newValue);
  }, []);

  const contextValue = useMemo(() => ({
    value,
    setValue: stableSetValue
  }), [value, stableSetValue]);

  return (
    <ChatParamsContext.Provider value={contextValue}>
      {children}
    </ChatParamsContext.Provider>
  );
}

export function useChatParams(): ChatParamsContextType {
  const context = useContext(ChatParamsContext);
  if (!context) {
    throw new Error('useChatParams must be used within ChatParamsProvider');
  }
  return context;
}

