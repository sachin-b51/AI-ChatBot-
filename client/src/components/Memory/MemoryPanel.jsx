import React, { useState, useEffect } from 'react';
import { getMemories, updateMemory, deleteMemory } from '../../api';
import { X, Trash2, Edit3, Save, Brain } from 'lucide-react';

const MemoryPanel = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const data = await getMemories();
      setMemories(data);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mem) => {
    setEditingId(mem._id);
    setEditContent(mem.content);
  };

  const handleSave = async (id) => {
    try {
      await updateMemory(id, editContent);
      setEditingId(null);
      fetchMemories();
    } catch (err) {
      console.error('Failed to save memory:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Forget this memory?')) {
      try {
        await deleteMemory(id);
        fetchMemories();
      } catch (err) {
        console.error('Failed to delete memory:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Memory Editor</h2>
              <p className="text-xs text-text-secondary">Facts the AI has learned about you</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-secondary">Recalling facts...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">The AI hasn't learned any facts about you yet.</p>
              <p className="text-xs text-text-muted mt-2">Try telling it something about yourself!</p>
            </div>
          ) : (
            memories.map((mem) => (
              <div 
                key={mem._id}
                className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 transition-all"
              >
                {editingId === mem._id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 bg-black/40 rounded-lg border border-accent/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent resize-none text-sm"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs text-text-secondary hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSave(mem._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs hover:bg-accent/80 transition-all font-medium"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-text-primary leading-relaxed">
                      {mem.content}
                    </p>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <button 
                        onClick={() => handleEdit(mem)}
                        className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors"
                        title="Edit fact"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(mem._id)}
                        className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                        title="Forget this"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">
                    Learned {new Date(mem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
            The AI automatically extracts facts from your conversations
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemoryPanel;
