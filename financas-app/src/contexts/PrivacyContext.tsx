import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface PrivacyContextValue {
  isPrivate: boolean;
  togglePrivacy: () => void;
  mask: (value: string) => string;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  isPrivate: false,
  togglePrivacy: () => {},
  mask: (v) => v,
});

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(false);

  const togglePrivacy = useCallback(() => setIsPrivate((p) => !p), []);

  const mask = useCallback(
    (value: string) => (isPrivate ? '••••••' : value),
    [isPrivate]
  );

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, mask }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
