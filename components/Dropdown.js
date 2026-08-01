'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * A custom-styled select replacement.
 *
 * Uses a portal to render the menu into document.body rather than inline —
 * this matters specifically because it's used inside the admin table, which
 * has `overflow-hidden` on its rounded card wrapper (needed to clip the
 * table's square corners). A normal absolutely-positioned menu would get
 * silently clipped by that wrapper for any row near the bottom; portaling
 * out to body sidesteps that entirely, positioned via the trigger's real
 * bounding rect instead of relying on CSS stacking context.
 */
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  triggerClassName = '',
  menuClassName = '',
  align = 'left',
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const listboxId = useId();

  useEffect(() => setMounted(true), []);

  const selected = options.find((o) => o.value === value);

  function measureAndOpen() {
    if (disabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 6,
      left: align === 'right' ? rect.right + window.scrollX : rect.left + window.scrollX,
      width: rect.width,
    });
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e) {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }

    function handleScroll(e) {
      // Closing on scroll (rather than repositioning live) keeps this
      // simple and avoids stale-position bugs when the trigger sits inside
      // a horizontally-scrollable table.
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        onChange(options[activeIndex].value);
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, activeIndex, options, onChange]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : measureAndOpen())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`flex items-center justify-between gap-2 disabled:cursor-not-allowed disabled:opacity-50 ${triggerClassName}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className={`flex-shrink-0 text-brand-dark/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.ul
                id={listboxId}
                ref={menuRef}
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  top: coords.top,
                  left: align === 'right' ? coords.left - coords.width : coords.left,
                  minWidth: coords.width,
                  zIndex: 9999,
                }}
                className={`max-h-64 overflow-auto rounded-xl border border-brand-dark/10 bg-white py-1.5 shadow-soft ${menuClassName}`}
              >
                {options.map((opt, i) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={opt.value === value}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`mx-1.5 cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors ${
                      opt.value === value
                        ? 'bg-brand-teal/10 font-medium text-brand-teal'
                        : i === activeIndex
                        ? 'bg-brand-dark/5 text-brand-dark'
                        : 'text-brand-dark/70'
                    }`}
                  >
                    {opt.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
