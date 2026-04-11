"use client";

import * as React from "react";

type Option = {
  id: string;
  label: string;
  group?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  meta?: string; // small right-aligned hint text
};

type BaseProps = {
  id?: string;
  className?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  /**
   * When provided, async mode is enabled. Return a list of options for the query.
   * Debounce is handled internally.
   */
  onQuery?: (q: string) => Promise<Option[]>;
  /**
   * Allow creating new items directly from the query.
   * If provided, a "Create..." row appears when no exact match.
   */
  onCreate?: (q: string) => Promise<Option> | Option;
  getCreateLabel?: (q: string) => string;
  /**
   * Called when selection changes.
   * If multiple=false, value is string | null; if multiple=true, value is string[].
   */
  onValueChange: (value: string[] | string | null) => void;
  /**
   * For local mode (no onQuery), provide your option list. Can include groups via option.group.
   */
  options?: Option[];

  value?: string[] | string | null;
  /** Controlled open state (optional) */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;

  /** Optional header/footer/empty custom nodes inside the dropdown */
  header?: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;

  /** Custom render for an option row */
  renderOption?: (opt: Option, state: { active: boolean; selected: boolean }) => React.ReactNode;

  /** Max popup height (px) */
  maxHeight?: number;
  /** Item height for virtualization (row total height) */
  itemHeight?: number;
  /** Virtualize when options length exceeds this */
  virtualizeThreshold?: number;
};

function classNames(...xs: Array<string | undefined | false>) {
  return xs.filter(Boolean).join(" ");
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function SmartCombobox({
  id,
  className,
  label,
  placeholder = "Search…",
  disabled,
  clearable = true,
  multiple = false,
  onQuery,
  onCreate,
  getCreateLabel = (q) => `Create “${q}”`,
  onValueChange,
  options: optionsProp = [],
  value: valueProp = multiple ? [] : null,
  open: controlledOpen,
  onOpenChange,
  header,
  footer,
  emptyState,
  renderOption,
  maxHeight = 320,
  itemHeight = 36,
  virtualizeThreshold = 120,
}: BaseProps) {
  const inputId = React.useId();
  const listboxId = React.useId();
  const activeDescId = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [openU, setOpenU] = React.useState(false);
  const open = controlledOpen ?? openU;

  const isMultiple = !!multiple;
  const [internalValue, setInternalValue] = React.useState<string[]>(
    isMultiple ? (Array.isArray(valueProp) ? valueProp : []) : []
  );

  // Reflect controlled value when provided
  React.useEffect(() => {
    if (isMultiple) {
      if (Array.isArray(valueProp)) setInternalValue(valueProp);
    }
  }, [valueProp, isMultiple]);

  const singleValue = !isMultiple ? (typeof valueProp === "string" ? valueProp : null) : null;

  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounced(query, 150);
  const [loading, setLoading] = React.useState(false);
  const [remoteOptions, setRemoteOptions] = React.useState<Option[] | null>(null);

  React.useEffect(() => {
    let didCancel = false;
    if (!onQuery) {
      setRemoteOptions(null);
      return;
    }
    setLoading(true);
    onQuery(debouncedQuery)
      .then((res) => {
        if (!didCancel) setRemoteOptions(res || []);
      })
      .finally(() => {
        if (!didCancel) setLoading(false);
      });
    return () => {
      didCancel = true;
    };
  }, [onQuery, debouncedQuery]);

  const baseOptions = onQuery ? remoteOptions ?? [] : optionsProp;

  const filtered = React.useMemo(() => {
    if (onQuery) return baseOptions;
    const q = normalize(debouncedQuery);
    if (!q) return baseOptions;
    return baseOptions.filter((o) => normalize(o.label).includes(q));
  }, [baseOptions, debouncedQuery, onQuery]);

  const options = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const g = (a.group || "").localeCompare(b.group || "");
      return g !== 0 ? g : a.label.localeCompare(b.label);
    });
    return copy;
  }, [filtered]);

  const [activeIndex, setActiveIndex] = React.useState(0);

  const showCreate =
    !!onCreate && debouncedQuery.trim().length > 0 && !options.some((o) => normalize(o.label) === normalize(debouncedQuery));

  const useVirtual = options.length > virtualizeThreshold;
  const [scrollTop, setScrollTop] = React.useState(0);
  const viewportCount = Math.max(1, Math.floor(maxHeight / itemHeight));
  const overscan = 4;
  const start = useVirtual ? Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) : 0;
  const end = useVirtual ? Math.min(options.length, Math.ceil((scrollTop + maxHeight) / itemHeight) + overscan) : options.length;
  const visible = useVirtual ? options.slice(start, end) : options;
  const paddingTop = useVirtual ? start * itemHeight : 0;
  const paddingBottom = useVirtual ? (options.length - end) * itemHeight : 0;

  const isSelected = React.useCallback(
    (id: string) => {
      if (isMultiple) return internalValue.includes(id);
      return singleValue === id;
    },
    [internalValue, singleValue, isMultiple]
  );

  const commitChange = React.useCallback(
    (next: string[] | string | null) => {
      onValueChange(next);
    },
    [onValueChange]
  );

  function toggleOption(opt: Option) {
    if (opt.disabled) return;
    if (isMultiple) {
      const next = isSelected(opt.id)
        ? internalValue.filter((x) => x !== opt.id)
        : [...internalValue, opt.id];
      setInternalValue(next);
      commitChange(next);
    } else {
      commitChange(isSelected(opt.id) ? null : opt.id);
      setOpen(false);
      setQuery(opt.label);
    }
  }

  function removeChip(id: string) {
    if (!isMultiple) return;
    const next = internalValue.filter((x) => x !== id);
    setInternalValue(next);
    commitChange(next);
  }

  function clearAll() {
    if (disabled) return;
    if (isMultiple) {
      setInternalValue([]);
      commitChange([]);
    } else {
      commitChange(null);
    }
    setQuery("");
    inputRef.current?.focus();
  }

  function setOpen(next: boolean) {
    if (disabled) return;
    if (controlledOpen === undefined) setOpenU(next);
    onOpenChange?.(next);
    if (next) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const el = containerRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  React.useEffect(() => {
    setActiveIndex((i) => Math.max(0, Math.min(i, options.length - 1)));
  }, [options.length]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " " || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) {
      if (isMultiple && e.key === "Backspace" && query.length === 0 && internalValue.length) {
        removeChip(internalValue[internalValue.length - 1]);
      }
      return;
    }

    const maxIndex = options.length - 1;
    const step = (delta: number) => setActiveIndex((i) => Math.max(0, Math.min(maxIndex, i + delta)));

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        step(1);
        ensureVisible(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        step(-1);
        ensureVisible(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        ensureVisible(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(maxIndex);
        ensureVisible(maxIndex);
        break;
      case "PageDown":
        e.preventDefault();
        step(viewportCount);
        ensureVisible(activeIndex + viewportCount);
        break;
      case "PageUp":
        e.preventDefault();
        step(-viewportCount);
        ensureVisible(activeIndex - viewportCount);
        break;
      case "Enter":
        e.preventDefault();
        if (showCreate && activeIndex === 0) {
          handleCreate(debouncedQuery);
          return;
        }
        {
          const idx = showCreate ? activeIndex - 1 : activeIndex;
          const target = options[idx];
          if (target) toggleOption(target);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  function ensureVisible(index: number) {
    if (!listRef.current) return;
    if (!useVirtual) {
      const child = listRef.current.querySelector<HTMLElement>(`[data-idx="${index}"]`);
      child?.scrollIntoView({ block: "nearest" });
      return;
    }
    const min = index * itemHeight;
    const max = min + itemHeight;
    const st = listRef.current.scrollTop;
    const vh = maxHeight;
    if (min < st) listRef.current.scrollTop = min;
    else if (max > st + vh) listRef.current.scrollTop = max - vh;
  }

  async function handleCreate(q: string) {
    if (!onCreate || !q.trim()) return;
    const newOpt = await onCreate(q.trim());
    if (Array.isArray(baseOptions)) {
      setRemoteOptions([newOpt, ...baseOptions]);
    }
    toggleOption(newOpt);
    setQuery("");
  }

  const groups = React.useMemo(() => {
    const map = new Map<string, Option[]>();
    for (const o of visible) {
      const g = o.group || "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(o);
    }
    return map;
  }, [visible]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={classNames("relative w-full shadow-lg rounded-2xl", className)}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-foreground/80"
        >
          {label}
        </label>
      )}

      <div
        className={classNames(
          "group flex min-h-14 w-full items-center gap-2 rounded-[24px] border border-border/50 bg-background/80 backdrop-blur-sm px-4",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-all",
          disabled && "opacity-60 pointer-events-none"
        )}
        onClick={() => {
          if (!open) setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        {isMultiple && internalValue.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {internalValue.map((id) => {
              const opt = baseOptions.find((o) => o.id === id);
              if (!opt) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {opt.icon ? <span className="size-3.5">{opt.icon}</span> : null}
                  {opt.label}
                  <button
                    type="button"
                    aria-label={`Remove ${opt.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChip(id);
                    }}
                    className="ml-1 grid size-4 place-items-center rounded hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <svg viewBox="0 0 20 20" className="size-3" aria-hidden="true">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={open ? activeDescId : undefined}
          aria-disabled={disabled || undefined}
          placeholder={placeholder}
          disabled={disabled}
          className={classNames(
            "peer flex-1 bg-transparent py-4 outline-none placeholder:text-muted-foreground text-foreground md:text-lg"
          )}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />

        <div className="ml-auto flex items-center gap-1">
          {clearable && ((isMultiple && internalValue.length > 0) || (!isMultiple && singleValue) || query.length > 0) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear selection"
              title="Clear"
            >
              <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm transition-colors">
            Find Tutors
          </button>
        </div>
      </div>

      {open && (
        <div
          className={classNames(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-[20px] border border-border/50 bg-popover shadow-xl shadow-black/5",
            "animate-in slide-in-from-top-2 fade-in duration-200"
          )}
          style={{ maxHeight }}
        >
          {header ? (
            <div className="border-b border-border p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              {header}
            </div>
          ) : null}

          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable={isMultiple || undefined}
            className="max-h-[inherit] overflow-auto py-2"
            style={{ maxHeight }}
            onScroll={(e) => {
              if (!useVirtual) return;
              const el = e.currentTarget;
              setScrollTop(el.scrollTop);
            }}
          >
            {showCreate && (
              <div
                role="option"
                id={activeIndex === 0 ? activeDescId : undefined}
                aria-selected={activeIndex === 0}
                data-idx={0}
                onMouseEnter={() => setActiveIndex(0)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleCreate(debouncedQuery)}
                className={classNames(
                  "flex cursor-pointer items-center gap-2 px-4 py-3 mx-2 rounded-xl text-foreground font-medium",
                  activeIndex === 0
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-muted/50"
                )}
                style={{ height: itemHeight }}
              >
                <span className="inline-flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground shadow-sm">
                  +
                </span>
                {getCreateLabel(debouncedQuery)}
              </div>
            )}

            {useVirtual && paddingTop > 0 ? <div style={{ height: paddingTop }} /> : null}

            {[...groups.entries()].map(([group, items]) => {
              return (
                <div key={group} role="group" aria-label={group}>
                  {group !== "Other" && (
                    <div className="sticky top-0 z-10 bg-popover/90 backdrop-blur-sm px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </div>
                  )}
                  {items.map((opt) => {
                    const idx = options.indexOf(opt) + (showCreate ? 1 : 0);
                    const active = idx === activeIndex;
                    const selected = isSelected(opt.id);

                    const defaultRow = (
                      <div
                        key={opt.id}
                        role="option"
                        id={active ? activeDescId : undefined}
                        aria-selected={selected}
                        data-idx={idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleOption(opt)}
                        className={classNames(
                          "flex cursor-pointer items-center justify-between gap-2 px-4 py-3 mx-2 my-1 rounded-xl transition-colors",
                          "text-foreground",
                          active
                            ? "bg-muted font-medium"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {opt.icon ? <span className="size-5 shrink-0 text-muted-foreground">{opt.icon}</span> : 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                          }
                          <span className="truncate">{opt.label}</span>
                        </div>
                        <div className="ml-2 flex items-center gap-2">
                          {opt.meta ? (
                            <span className={classNames("text-xs px-2 py-1 bg-background rounded-md border border-border/50 font-medium", active ? "text-primary" : "text-muted-foreground")}>
                              {opt.meta}
                            </span>
                          ) : null}
                          {selected && (
                            <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-primary" aria-hidden="true">
                              <path d="M5 10l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );

                    return renderOption ? (
                      <div
                        key={opt.id}
                        role="option"
                        id={active ? activeDescId : undefined}
                        aria-selected={selected}
                        data-idx={idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleOption(opt)}
                        className={classNames(
                          "flex cursor-pointer items-center px-4 mx-2 rounded-xl my-1",
                          active
                            ? "bg-muted"
                            : "hover:bg-muted/50"
                        )}
                        style={{ height: itemHeight }}
                      >
                        {renderOption(opt, { active, selected })}
                      </div>
                    ) : (
                      defaultRow
                    );
                  })}
                </div>
              );
            })}

            {useVirtual && paddingBottom > 0 ? <div style={{ height: paddingBottom }} /> : null}

            {!loading && options.length === 0 && !showCreate && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {emptyState ?? "No matching topics found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
