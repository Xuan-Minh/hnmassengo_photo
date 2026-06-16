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
  const constraintsRef = useRef(null);
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
    <section
      id="home"
      ref={constraintsRef}
      className="relative w-full h-full bg-transparent"
    >
      {windowEntries.map((child, index) => {
        const id = child.props.id ?? `window-${index}`;
        const zIndex = windowZIndexes[id] ?? index + 1;

        return cloneElement(child, {
          key: id,
          zIndex,
          bringToFront: () => bringToFront(id),
          constraintsRef,
        });
      })}
    </section>
  );
};

export default WindowsManager;
