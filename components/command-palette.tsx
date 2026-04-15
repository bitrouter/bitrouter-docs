'use client';

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bot,
  Loader2,
  MessageCircleIcon,
  RefreshCw,
  Search,
  Send,
  X,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { type UIMessage, useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Markdown } from './markdown';

/* ─── Types ─── */
type Mode = 'search' | 'ai';

interface SearchResult {
  id: string;
  url: string;
  type: 'page' | 'heading' | 'text';
  content: string;
  page_id?: string;
}

interface CommandPaletteContext {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const Context = createContext<CommandPaletteContext | null>(null);

export function useCommandPalette() {
  return use(Context)!;
}

/* ─── Provider ─── */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('search');

  const value = useMemo(
    () => ({ open, setOpen, mode, setMode }),
    [open, mode],
  );

  return <Context value={value}>{children}</Context>;
}

/* ─── Trigger (for nav bar search button) ─── */
export function CommandPaletteTrigger({
  className,
  ...props
}: ComponentProps<'button'>) {
  const { setOpen } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={className}
      {...props}
    />
  );
}

/* ─── Main dialog ─── */
export function CommandPaletteDialog() {
  const { open, setOpen, mode, setMode } = useCommandPalette();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Global hotkey: Cmd+K
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(!open);
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Reset to search mode when opening
  useEffect(() => {
    if (open) setMode('search');
  }, [open, setMode]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-fade-in"
        onClick={() => setOpen(false)}
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          'fixed z-50 w-full max-w-2xl animate-fade-in-up',
          'left-1/2 top-[15%] -translate-x-1/2',
          'border border-border bg-popover text-popover-foreground shadow-2xl',
          'flex flex-col overflow-hidden',
          mode === 'ai' ? 'max-h-[70dvh]' : 'max-h-[min(60dvh,500px)]',
        )}
      >
        {/* Mode tabs */}
        <div className="flex items-center border-b border-border">
          <button
            type="button"
            onClick={() => setMode('search')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
              mode === 'search'
                ? 'text-foreground border-b-2 border-foreground -mb-px'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Search className="size-3.5" />
            Search
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
              mode === 'ai'
                ? 'text-foreground border-b-2 border-foreground -mb-px'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Bot className="size-3.5" />
            AI Chat
          </button>
          <div className="flex-1" />
          <kbd className="mr-3 text-[10px] text-muted-foreground/60 border border-border/50 px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        {/* Content */}
        {mode === 'search' ? <SearchMode /> : <AIChatMode />}
      </div>
    </>
  );
}

/* ─── Search Mode ─── */
function SearchMode() {
  const { setOpen } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch search results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const locale = document.documentElement.lang || 'en';
    const url = `/api/search?query=${encodeURIComponent(query)}&locale=${locale}`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: SearchResult[]) => {
        setResults(data);
        setSelectedIndex(0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  const navigate = useCallback(
    (url: string) => {
      setOpen(false);
      window.location.href = url;
    },
    [setOpen],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].url);
    }
  };

  return (
    <>
      {/* Search input */}
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search documentation..."
          className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {query.trim() === '' ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <Search className="size-8 mb-3 opacity-30" />
            <p>Type to search documentation</p>
            <p className="mt-1 text-xs opacity-60">or switch to AI Chat for questions</p>
          </div>
        ) : results.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <p>No results found</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {results.map((result, i) => (
              <button
                key={result.id}
                type="button"
                onClick={() => navigate(result.url)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                  i === selectedIndex
                    ? 'bg-accent/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <FileText className="size-4 shrink-0 opacity-50" />
                <span
                  className="flex-1 truncate [&_mark]:bg-transparent [&_mark]:text-foreground [&_mark]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: result.content }}
                />
                <ArrowRight className="size-3.5 shrink-0 opacity-30" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── AI Chat Mode ─── */
function AIChatMode() {
  const chat = useChat({
    id: 'command-palette-ai',
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ChatMessages messages={chat.messages} status={chat.status} />
      <ChatInput chat={chat} />
    </div>
  );
}

function ChatMessages({
  messages,
  status,
}: {
  messages: UIMessage[];
  status: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'instant',
      });
    });
    const child = containerRef.current.firstElementChild;
    if (child) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  const filtered = messages.filter((m) => m.role !== 'system');

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
      }}
    >
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
          <MessageCircleIcon className="size-8 opacity-30" fill="currentColor" stroke="none" />
          <p>Ask anything about BitRouter</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {filtered.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {status === 'streaming' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const roleName: Record<string, string> = {
  user: 'you',
  assistant: 'bitrouter',
};

function ChatMessage({ message }: { message: UIMessage }) {
  let markdown = '';
  for (const part of message.parts ?? []) {
    if (part.type === 'text') markdown += part.text;
  }

  return (
    <div>
      <p
        className={cn(
          'mb-1 text-xs font-medium font-mono uppercase tracking-wider',
          message.role === 'assistant' ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {roleName[message.role] ?? 'unknown'}
      </p>
      <div className="prose prose-sm text-sm">
        <Markdown text={markdown} />
      </div>
    </div>
  );
}

function ChatInput({ chat }: { chat: ReturnType<typeof useChat> }) {
  const [input, setInput] = useState('');
  const isLoading = chat.status === 'streaming' || chat.status === 'submitted';

  const onSubmit = (e?: SyntheticEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    void chat.sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="border-t border-border">
      {/* Actions */}
      {chat.messages.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 pt-2">
          {!isLoading && chat.messages.at(-1)?.role === 'assistant' && (
            <button
              type="button"
              onClick={() => chat.regenerate()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground border border-border"
            >
              <RefreshCw className="size-3" />
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => chat.setMessages([])}
            className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground border border-border"
          >
            Clear
          </button>
        </div>
      )}
      {/* Input */}
      <form onSubmit={onSubmit} className="flex items-start gap-2 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (!e.shiftKey && e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={isLoading ? 'AI is answering...' : 'Ask a question...'}
          disabled={isLoading}
          autoFocus
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={chat.stop}
            className="inline-flex items-center gap-1.5 shrink-0 border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Loader2 className="size-3 animate-spin" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center shrink-0 bg-foreground text-background px-2.5 py-1 text-xs transition-colors disabled:opacity-30"
          >
            <Send className="size-3" />
          </button>
        )}
      </form>
    </div>
  );
}
