import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SettingsIcon, RefreshIcon, TrashIcon } from './Icons'

export default function SettingsModal({
    isSettingsOpen,
    setIsSettingsOpen,
    t,
    importedPaths,
    setPath,
    handleScan,
    removePath,
    systemSettings,
    setSystemSettings,
    saveSetting,
    tagPool,
    setTagPool,
    newTagName,
    setNewTagName,
    addTagToPool,
    deleteTagFromPool,
    fetchTagPool
}) {
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [totalTags, setTotalTags] = useState(0)
    const tagPoolRef = useRef(null)

    const loadMoreTags = useCallback(async () => {
        setLoading(true)
        try {
            const nextPage = page + 1
            const skip = nextPage * 500
            const result = await fetchTagPool(skip, 500, true)
            if (result) {
                setPage(nextPage)
                setTotalTags(result.total)
            }
        } catch (error) {
            console.error('Error loading more tags:', error)
        } finally {
            setLoading(false)
        }
    }, [page, fetchTagPool])

    useEffect(() => {
        if (isSettingsOpen) {
            // Reset and load initial tags
            setPage(0)
            fetchTagPool(0, 500, false).then(data => {
                if (data) {
                    setTotalTags(data.total)
                }
            })
        }
    }, [isSettingsOpen, fetchTagPool])

    useEffect(() => {
        const handleScroll = () => {
            if (!tagPoolRef.current) return
            
            const { scrollTop, clientHeight, scrollHeight } = tagPoolRef.current
            
            // When user scrolls to within 100px of the bottom
            if (scrollHeight - scrollTop - clientHeight < 10 && !loading && tagPool.length < totalTags) {
                loadMoreTags()
            }
        }

        const tagPoolElement = tagPoolRef.current
        if (tagPoolElement) {
            tagPoolElement.addEventListener('scroll', handleScroll)
        }

        return () => {
            if (tagPoolElement) {
                tagPoolElement.removeEventListener('scroll', handleScroll)
            }
        }
    }, [loading, tagPool.length, totalTags, loadMoreTags])

    if (!isSettingsOpen) return null

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in shadow-2xl">
            <div className="bg-[#141414] border border-gray-800 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-linear-to-r from-blue-600/10 to-transparent">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-blue-500" />
                        {t('settings')}
                    </h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Path Management */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{t('manage_paths')}</h3>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
                            <div className="p-3 border-b border-gray-800 bg-[#202020] text-xs font-bold text-gray-500">{t('path_list')}</div>
                            <div className="divide-y divide-gray-800 max-h-[352px] overflow-y-auto custom-scrollbar">
                                {importedPaths.length === 0 && <div className="p-4 text-center text-gray-600 italic text-sm">No paths imported.</div>}
                                {importedPaths.map(p => (
                                    <div key={p} className="p-3 flex items-center justify-between group hover:bg-gray-800/50 transition-colors">
                                        <span className="text-sm text-gray-300 font-mono truncate mr-4">{p}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setIsSettingsOpen(false); setPath(p); handleScan(p, true); }} className="p-1.5 hover:bg-blue-600/20 rounded-md text-blue-400" title={t('re_scan')}>
                                                <RefreshIcon />
                                            </button>
                                            <button onClick={() => removePath(p)} className="p-1.5 hover:bg-red-600/20 rounded-md text-red-400" title={t('remove_path')}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Config */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{t('config')}</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">{t('cache_path')}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={systemSettings.cachePath}
                                        onChange={e => setSystemSettings(prev => ({ ...prev, cachePath: e.target.value }))}
                                        className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-md py-2 px-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                    />
                                    <button
                                        onClick={() => saveSetting('cachePath', systemSettings.cachePath)}
                                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-bold transition-colors"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>

                            {/* Scan Concurrency */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">{t('scan_concurrency')}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="16"
                                        value={systemSettings.scanConcurrency || 4}
                                        onChange={e => setSystemSettings(prev => ({ ...prev, scanConcurrency: e.target.value }))}
                                        className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-md py-2 px-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                    />
                                    <button
                                        onClick={() => saveSetting('scan_concurrency', systemSettings.scanConcurrency || 4)}
                                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-bold transition-colors"
                                    >
                                        Update
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-600">{t('scan_concurrency_desc')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Tag Pool Management */}
                    <section className="space-y-4 pb-4">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{t('tag_mgmt')}</h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={t('tag_name')}
                                    value={newTagName}
                                    onChange={e => setNewTagName(e.target.value)}
                                    className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-md py-2 px-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                />
                                <button
                                    onClick={addTagToPool}
                                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap"
                                >
                                    {t('add_tag')}
                                </button>
                            </div>

                            <div className="pt-2">
                                <div ref={tagPoolRef} className="bg-[#1a1a1a] border border-gray-800 rounded-lg h-[287px] overflow-y-auto custom-scrollbar p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {tagPool.map(tag => (
                                            <div key={tag.id} className="group relative">
                                                <div
                                                    className="px-3 py-1.5 rounded-full border border-gray-700 bg-gray-800/30 text-xs font-medium flex items-center gap-2"
                                                    style={tag.color ? { borderColor: `${tag.color}55`, color: tag.color } : {}}
                                                >
                                                    {tag.name}
                                                    <span className="text-[10px] opacity-40 uppercase">{tag.type}</span>
                                                    {tag.count > 0 && (
                                                        <span className="ml-1 text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                                                            {tag.count}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => deleteTagFromPool(tag.id)}
                                                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center transform hover:scale-110 shadow-lg"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Visual Tagging */}
                    <AITaggerSettings t={t} systemSettings={systemSettings} setSystemSettings={setSystemSettings} saveSetting={saveSetting} />
                </div>
            </div>
        </div>
    )
}

// AI Tagger Settings Component
function AITaggerSettings({ t, systemSettings, setSystemSettings, saveSetting }) {
    const [pluginStatus, setPluginStatus] = useState({ available: false, labelsCount: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkPlugin() {
            try {
                const res = await fetch('/api/ai-tagger/status')
                const status = await res.json()
                setPluginStatus(status)
            } catch (error) {
                setPluginStatus({ available: false, labelsCount: 0 })
            } finally {
                setLoading(false)
            }
        }
        checkPlugin()
    }, [])

    const aiEnabled = systemSettings.aiTaggerEnabled === 'true'
    const aiThreshold = parseFloat(systemSettings.aiTaggerThreshold || '0.35')

    return (
        <section className="space-y-4 pb-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{t('ai_tagging')}</h3>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 space-y-4">
                {/* Plugin Status */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <span className="text-xs font-bold text-gray-500">{t('plugin_status')}</span>
                    {loading ? (
                        <span className="text-xs text-gray-500">Loading...</span>
                    ) : pluginStatus.available ? (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('plugin_loaded')} ({pluginStatus.labelsCount} labels)
                        </span>
                    ) : (
                        <span className="text-xs text-yellow-500">{t('plugin_not_found')}</span>
                    )}
                </div>

                {/* Enable Toggle */}
                <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">{t('enable_ai_tagging')}</label>
                    <button
                        onClick={() => {
                            const newValue = !aiEnabled
                            setSystemSettings(prev => ({ ...prev, aiTaggerEnabled: String(newValue) }))
                            saveSetting('aiTaggerEnabled', String(newValue))
                        }}
                        disabled={!pluginStatus.available}
                        className={`relative w-12 h-6 rounded-full transition-colors ${aiEnabled ? 'bg-blue-600' : 'bg-gray-700'
                            } ${!pluginStatus.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${aiEnabled ? 'translate-x-6' : ''
                            }`} />
                    </button>
                </div>

                {/* Threshold Slider */}
                {pluginStatus.available && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500">{t('ai_threshold')}</label>
                            <span className="text-xs text-blue-400 font-mono">{aiThreshold.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.05"
                            value={aiThreshold}
                            onChange={(e) => {
                                const newValue = e.target.value
                                setSystemSettings(prev => ({ ...prev, aiTaggerThreshold: newValue }))
                            }}
                            onMouseUp={(e) => saveSetting('ai_tagger_threshold', e.target.value)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-gray-600">{t('ai_threshold_desc')}</p>
                    </div>
                )}
            </div>
        </section>
    )
}
