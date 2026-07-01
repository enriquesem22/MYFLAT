import { useEffect, useRef, useState } from 'react';
import type { Message } from '@/types';
import { SendIcon } from '@/components/common/icons';

interface Props {
  messages: Message[];
  meId: string;
  onSend: (text: string) => void;
}

export function ChatView({ messages, meId, onSend }: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Aún no hay mensajes. ¡Escribe el primero!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? 'bg-brand-500 text-white rounded-br-md'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="border-t border-gray-100 bg-white px-3 py-2.5 flex items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+0.625rem)]"
      >
        <input
          className="input flex-1"
          placeholder="Escribe un mensaje…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="w-11 h-11 shrink-0 rounded-full bg-brand-500 text-white flex items-center justify-center disabled:opacity-40"
          disabled={!text.trim()}
        >
          <SendIcon width={20} height={20} />
        </button>
      </form>
    </div>
  );
}
