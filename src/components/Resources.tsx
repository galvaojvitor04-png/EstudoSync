import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Book, Link as LinkIcon, FileText, Trash2, Plus, FileArchive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { t } from '../i18n/translations';
import { useStore } from '../store/useStore';

interface Resource {
  id: string;
  title: string;
  type: 'link' | 'note' | 'file';
  content: string; // URL for links, text for notes
  subject: string;
  createdAt: any;
}

export default function Resources() {
  const { preferences } = useStore();
  const lang = t[preferences.language];
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'link' | 'note'>('link');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'resources'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Resource[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Resource);
      });
      data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setResources(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'resources'), {
        title: newTitle,
        type: newType,
        content: newContent,
        subject: newSubject || 'Geral',
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setNewTitle('');
      setNewContent('');
      setNewSubject('');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar recurso. Verifique se está offline e tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (err) {
      console.error(err);
    }
  };

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'link') return <LinkIcon className="w-5 h-5 text-blue-400" />;
    if (type === 'file') return <FileArchive className="w-5 h-5 text-emerald-400" />;
    return <FileText className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className='flex justify-between items-end gap-4'>
        <div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent'>Biblioteca</h1>
          <p className='text-slate-500 dark:text-slate-400 text-sm'>Materiais, Notas e Links com acesso Offline</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 self-start">
          <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-slate-200">Novo Recurso</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo</label>
              <div className="flex bg-slate-100 dark:bg-[#0A0A0B] p-1 rounded-xl">
                <button type="button" onClick={() => setNewType('link')} className={cn("flex-1 py-1.5 text-sm rounded-lg transition-colors", newType === 'link' ? "bg-white dark:bg-slate-800 shadow-sm text-blue-500" : "text-slate-500 hover:text-slate-300")}>Link</button>
                <button type="button" onClick={() => setNewType('note')} className={cn("flex-1 py-1.5 text-sm rounded-lg transition-colors", newType === 'note' ? "bg-white dark:bg-slate-800 shadow-sm text-amber-500" : "text-slate-500 hover:text-slate-300")}>Nota</button>
              </div>
            </div>
            <input 
              type="text" required placeholder="Título" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input 
              type="text" placeholder="Matéria (Ex: Física)" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {newType === 'link' ? (
              <input 
                type="url" required placeholder="https://..." value={newContent} onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <textarea 
                required placeholder="Escreva suas anotações aqui..." value={newContent} onChange={(e) => setNewContent(e.target.value)}
                className="w-full h-32 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            )}
            <button type="submit" className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Salvar Recurso
            </button>
          </form>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
           {loading ? (
             <div className="flex justify-center p-8"><span className="text-slate-500">Carregando...</span></div>
           ) : resources.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-[#161617]/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
               <Book className="w-10 h-10 text-slate-400 mb-2" />
               <p className="text-slate-500 text-sm">Nenhum recurso salvo.</p>
             </div>
           ) : (
             <AnimatePresence>
               {resources.map(res => (
                 <motion.div 
                   key={res.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-white dark:bg-[#161617] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm group flex flex-col sm:flex-row gap-4"
                 >
                    <div className="p-3 bg-slate-50 dark:bg-[#0A0A0B] rounded-xl self-start">
                       <TypeIcon type={res.type} />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                         <h3 className="font-semibold text-slate-900 dark:text-slate-200">{res.title}</h3>
                         <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{res.subject}</span>
                       </div>
                       
                       {res.type === 'link' ? (
                         <a href={res.content} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline mt-2 block break-all">
                           {res.content}
                         </a>
                       ) : (
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap bg-slate-50 dark:bg-[#0A0A0B] p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                           {res.content}
                         </p>
                       )}
                    </div>
                    <button onClick={() => handleDelete(res.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-2 self-start sm:self-center">
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </motion.div>
               ))}
             </AnimatePresence>
           )}
        </div>
      </div>
    </div>
  );
}
