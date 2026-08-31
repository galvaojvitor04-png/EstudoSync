import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Send, Users, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';

const ROOMS = ['Geral', 'Matemática', 'Programação', 'Idiomas', 'Ciências'];

interface Message {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  room: string;
  createdAt: any;
}

export default function ChatRoom() {
  const { preferences } = useStore();
  const lang = t[preferences.language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'messages'),
      where('room', '==', activeRoom),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Message[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(data);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [activeRoom]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // optimistic clear

    try {
      await addDoc(collection(db, 'messages'), {
        text: messageText,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || 'Usuário',
        room: activeRoom,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Erro ao enviar mensagem.');
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      <header className='flex justify-between items-end gap-4 shrink-0'>
        <div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent'>Salas de Estudo</h1>
          <p className='text-slate-500 dark:text-slate-400 text-sm'>Troque dicas e mantenha o foco com a comunidade</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Rooms Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto hide-scrollbar">
          {ROOMS.map(room => (
            <button
              key={room}
              onClick={() => setActiveRoom(room)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm whitespace-nowrap",
                activeRoom === room 
                  ? "bg-white dark:bg-[#161617] shadow-sm text-blue-500 border border-slate-200 dark:border-slate-800" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#161617]/50"
              )}
            >
              <Hash className="w-4 h-4 opacity-70" />
              {room}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col min-h-0 relative overflow-hidden">
          {/* Room Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#161617]/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-200">Sala {activeRoom}</h2>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Users className="w-12 h-12 opacity-20" />
                <p className="text-sm">Nenhuma mensagem ainda. Comece a interação!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.userId === auth.currentUser?.uid;
                const showHeader = idx === 0 || messages[idx - 1].userId !== msg.userId;

                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
                  >
                    {showHeader && (
                      <span className="text-xs text-slate-500 dark:text-slate-500 mb-1 px-1">
                        {isMe ? 'Você' : msg.userEmail.split('@')[0]}
                      </span>
                    )}
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl shadow-sm text-sm",
                      isMe 
                        ? "bg-blue-500 text-white rounded-tr-sm" 
                        : "bg-slate-100 dark:bg-[#0A0A0B] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/50 rounded-tl-sm"
                    )}>
                      {msg.text}
                    </div>
                    {msg.createdAt && (
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    )}
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50 dark:bg-[#0A0A0B] border-t border-slate-100 dark:border-slate-800/50 shrink-0">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Mensagem em #${activeRoom}...`}
                className="flex-1 bg-white dark:bg-[#161617] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-900 dark:text-slate-200"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white p-3 rounded-2xl transition-colors shadow-sm flex items-center justify-center shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
