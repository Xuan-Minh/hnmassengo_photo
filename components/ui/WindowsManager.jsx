'use client';

import {
  Children,
  cloneElement,
  useCallback,
  useState,
  useMemo,
  useRef,
} from 'react';

const WindowsManager = ({ children }) => {
  const { windowEntries, initialWindowZIndexes } = useMemo(() => {
    const entries = Children.toArray(children).filter(Boolean);
    const zIndexes = {};
    entries.forEach((child, index) => {
      const id = child.props.id ?? `window-${index}`;
      zIndexes[id] = index + 1;
    });
    return { windowEntries: entries, initialWindowZIndexes: zIndexes };
  }, [children]);

  const [windowZIndexes, setWindowZIndexes] = useState(initialWindowZIndexes);
  const nextZIndex = useRef(windowEntries.length + 1);

  const bringToFront = useCallback(id => {
    setWindowZIndexes(current => ({
      ...current,
      [id]: nextZIndex.current,
    }));
    nextZIndex.current += 1;
  }, []);

  return (
    <>
      {windowEntries.map((child, index) => {
        const id = child.props.id ?? `window-${index}`;
        const zIndex = windowZIndexes[id] ?? index + 1;

        return cloneElement(child, {
          key: id,
          zIndex,
          bringToFront: () => bringToFront(id),
        });
      })}
    </>
  );
};

export default WindowsManager;
