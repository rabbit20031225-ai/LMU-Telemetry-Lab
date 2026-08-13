import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { User, Plus, Trash2, X, RefreshCw, Edit2, Check, GripVertical } from 'lucide-react';
import { useTelemetryStore } from '../store/telemetryStore';
import { handleGlassMouseMove } from '../utils/glassEffect';

interface LoginOverlayProps {
    onClose?: () => void;
}

export const LoginOverlay: React.FC<LoginOverlayProps> = ({ onClose }) => {
    const activeProfileId = useTelemetryStore(state => state.activeProfileId);
    const profiles = useTelemetryStore(state => state.profiles);
    const fetchProfiles = useTelemetryStore(state => state.fetchProfiles);
    const createProfile = useTelemetryStore(state => state.createProfile);
    const setProfile = useTelemetryStore(state => state.setProfile);
    const updateProfile = useTelemetryStore(state => state.updateProfile);
    const reorderProfiles = useTelemetryStore(state => state.reorderProfiles);
    const uploadAvatar = useTelemetryStore(state => state.uploadAvatar);
    const deleteProfile = useTelemetryStore(state => state.deleteProfile);
    const isLoading = useTelemetryStore(state => state.isLoading);
    const error = useTelemetryStore(state => state.error);

    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [displayProfiles, setDisplayProfiles] = useState<any[]>(profiles || []);
    const [isDraggingState, setIsDraggingState] = useState(false);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    useEffect(() => {
        if (!isDraggingRef.current) {
            setDisplayProfiles(profiles || []);
        }
    }, [profiles]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await createProfile(newName);
        setIsCreating(false);
        setNewName('');
        if (onClose) onClose();
    };

    const handleSelect = async (id: string) => {
        if (editingId || isDraggingRef.current) return;
        await setProfile(id);
        if (onClose) onClose();
    };

    const handleRename = (e: React.MouseEvent, id: string, currentName: string) => {
        e.stopPropagation();
        setEditingId(id);
        setEditValue(currentName);
    };

    const submitRename = async (e: React.FormEvent | React.MouseEvent) => {
        e.stopPropagation();
        if (editingId && editValue.trim()) {
            await updateProfile(editingId, editValue.trim());
        }
        setEditingId(null);
        setEditValue('');
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setConfirmDelete(id);
    };

    const executeDelete = async (id: string) => {
        const { deleteProfile } = useTelemetryStore.getState();
        await deleteProfile(id);
        setConfirmDelete(null);
    };

    const handleReorder = async (newProfiles: any[]) => {
        setDisplayProfiles(newProfiles);
        await reorderProfiles(newProfiles.map((p: any) => p.id));
    };

    const getAvatarSrc = (url?: string | null) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return url;
    };

    return (
        <div 
            className="absolute inset-0 flex items-center justify-center p-6 overflow-hidden"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            {/* Background Ambient Glows */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" 
            />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" 
            />

            {/* Main Profile Selection UI */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className={`relative w-full max-w-md glass-container rounded-[2.5rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.6)] group border border-white/5 transition-all duration-500 ${confirmDelete ? 'scale-95 blur-md opacity-50 pointer-events-none' : 'scale-100 blur-0 opacity-100'}`}
                onMouseMove={(e) => handleGlassMouseMove(e)}
            >
                <div className="glass-content relative z-10 flex flex-col items-center">
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => fetchProfiles()}
                            disabled={isLoading}
                            title="Refresh Workspaces"
                            className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all glass-container rounded-full border border-white/10 group/refresh active:scale-95 disabled:opacity-50"
                            onMouseMove={(e) => handleGlassMouseMove(e)}
                        >
                            <div className="glass-content">
                                <RefreshCw size={20} className={`${isLoading ? 'animate-spin' : 'group-hover/refresh:rotate-180'} transition-all duration-700`} />
                            </div>
                        </button>

                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all glass-container rounded-full border border-white/10 group/close"
                                onMouseMove={(e) => handleGlassMouseMove(e)}
                            >
                                <div className="glass-content">
                                    <X size={20} className="group-hover/close:rotate-90 transition-transform duration-300" />
                                </div>
                            </button>
                        )}
                    </div>

                    <h2 className="text-3xl font-black tracking-tighter mb-1 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent italic uppercase px-2 text-center leading-tight">
                        {isCreating ? 'CREATE NEW SPACE' : 'WORKSPACE SELECTOR'}
                    </h2>
                    <p className="text-gray-400 text-[11px] mb-4 text-center font-medium tracking-tight px-4 leading-normal">
                        {isCreating ? 'Organize by track, car class, or driver identity.' : 'Drag to reorder • Top workspace is set as launch default.'}
                    </p>

                    {error && (
                        <div className="w-full mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Profile List */}
                    <div className="w-full max-h-[360px] overflow-y-auto px-1 py-1 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
                        {!isCreating ? (
                            <div className="flex flex-col gap-3">
                                <Reorder.Group
                                    axis="y"
                                    values={displayProfiles}
                                    onReorder={handleReorder}
                                    className={`flex flex-col gap-3 w-full ${isDraggingState ? 'cursor-grabbing [&_*]:!cursor-grabbing' : ''}`}
                                >
                                    {(displayProfiles || []).map((p: any, idx: number) => {
                                        return (
                                            <Reorder.Item
                                                key={p.id}
                                                value={p}
                                                transition={{ type: "spring", stiffness: 180, damping: 28, mass: 0.8 }}
                                                onDragStart={() => {
                                                    isDraggingRef.current = true;
                                                    setIsDraggingState(true);
                                                }}
                                                onDragEnd={() => {
                                                    setTimeout(() => {
                                                        isDraggingRef.current = false;
                                                        setIsDraggingState(false);
                                                    }, 150);
                                                }}
                                                onClick={() => handleSelect(p.id)}
                                                whileDrag={{ zIndex: 50, opacity: 0.95 }}
                                                className={`w-full group/item glass-container rounded-2xl transition-colors duration-200 border select-none ${
                                                    isDraggingState ? 'cursor-grabbing' : 'cursor-pointer'
                                                } ${
                                                    activeProfileId === p.id
                                                        ? 'bg-blue-600/20 border-blue-500/40'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="glass-content flex items-center p-3.5 gap-3">
                                                    {/* Drag Handle */}
                                                    <div 
                                                        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 opacity-60 group-hover/item:opacity-100 shrink-0"
                                                        title="Drag to reorder workspace"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <GripVertical size={18} />
                                                    </div>

                                                    {/* Avatar Section */}
                                                    <div className="relative group/avatar shrink-0">
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all overflow-hidden ${activeProfileId === p.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 group-hover/item:text-white group-hover/item:bg-white/10'}`}>
                                                            {p.avatar_url ? (
                                                                <img
                                                                    src={getAvatarSrc(p.avatar_url)}
                                                                    alt={p.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-white/5');
                                                                    }}
                                                                />
                                                            ) : (
                                                                <User size={22} />
                                                            )}
                                                        </div>

                                                        {/* Upload Trigger */}
                                                        <label
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity rounded-xl"
                                                        >
                                                            <Plus size={16} className="text-white" />
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const { uploadAvatar } = useTelemetryStore.getState();
                                                                        await uploadAvatar(p.id, file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* Title & Metadata */}
                                                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                                                        {editingId === p.id ? (
                                                            <div className="flex items-center gap-2 pr-2" onClick={e => e.stopPropagation()}>
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    value={editValue}
                                                                    onChange={e => setEditValue(e.target.value)}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter') submitRename(e as any);
                                                                        if (e.key === 'Escape') setEditingId(null);
                                                                    }}
                                                                    className="flex-1 bg-white/10 border border-blue-500/50 rounded-lg px-2 py-1 text-white font-black text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                                />
                                                                <button
                                                                    onClick={submitRename}
                                                                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="font-black tracking-tight text-base text-white group-hover/item:translate-x-0.5 transition-transform truncate">
                                                                {p.name}
                                                            </div>
                                                        )}
                                                        <div className="text-[10px] text-gray-300 font-mono uppercase tracking-[0.05em] flex items-center gap-2 transition-all duration-500 mt-0.5">
                                                            {p.id === 'guest' ? (
                                                                <span className="truncate">Initial Workspace</span>
                                                            ) : (
                                                                <span className="truncate">Created: {new Date(p.created_at).toLocaleDateString()}</span>
                                                            )}
                                                            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                                                            <span className="text-blue-400 font-bold shrink-0">{p.session_count || 0} Files</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1.5 min-w-fit ml-auto">
                                                        {!editingId && (
                                                            <div className="flex flex-col gap-0.5 opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                                                                <button
                                                                    onClick={(e) => handleRename(e, p.id, p.name)}
                                                                    className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all shrink-0"
                                                                    title="Rename"
                                                                >
                                                                    <Edit2 size={12} />
                                                                </button>
                                                                {p.id !== 'guest' && (
                                                                    <button
                                                                        onClick={(e) => handleDelete(e, p.id)}
                                                                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all shrink-0"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {activeProfileId === p.id && !editingId && (
                                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)] shrink-0 ml-1" />
                                                        )}
                                                    </div>
                                                </div>
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>

                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full group/new glass-container rounded-2xl border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/10 transition-all py-4 mt-2"
                                    onMouseMove={handleGlassMouseMove}
                                    style={{ '--glass-hover-scale': '1.02' } as any}
                                >
                                    <div className="glass-content flex flex-col items-center gap-2">
                                        <Plus size={24} className="text-gray-500 group-hover/new:text-blue-400 transition-colors" />
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover/new:text-white">New Category / Environment</span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreate} className="w-full space-y-6 animate-in slide-in-from-right-4 duration-300 px-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Environment Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. GT3 SPA / LEWIS HAMILTON / 2024 SEASON"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-bold"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl border border-white/5 text-gray-500 font-bold hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-[0.2em] italic"
                                    >
                                        Establish
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Glass Polish Layers */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-50" />
            </motion.div>

            {/* Deletion Confirmation Modal (Screen Centered Overlay) */}
            {confirmDelete && (
                <div className="absolute inset-0 z-[3100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-sm glass-container rounded-[2rem] p-8 text-center animate-in zoom-in-95 duration-300 border border-red-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                        <div className="glass-content flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Delete Workspace?</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                This will permanently remove all telemetry data associated with <br />
                                <span className="text-white font-bold">"{(profiles || []).find((p: any) => p.id === confirmDelete)?.name || 'Unknown'}"</span>.
                            </p>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-4 px-6 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={() => executeDelete(confirmDelete)}
                                    className="flex-1 py-4 px-6 rounded-xl bg-red-600 text-white font-black hover:bg-red-500 transition-all uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(220,38,38,0.3)]"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
