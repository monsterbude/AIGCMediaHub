import React, { useState, useEffect, useRef } from 'react'
import {
    SearchIcon, ExpandIcon, CollapseIcon, LayoutIcon,
    ChevronRightIcon, FolderIcon, RefreshIcon, FilterIcon, StarIcon,
    PlusIcon
} from './Icons'

export default function Sidebar({
    t,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    scanning,
    path,
    setPath,
    handleScan,
    abortScan,
    logs,
    setLogs,
    logsContainerRef,
    folders,
    expandAll,
    collapseAll,
    selectedFolder,
    setSelectedFolder,
    expandedFolders,
    toggleFolder,
    buildFolderTree,
    isFiltersOpen,
    setIsFiltersOpen,
    showOnlyFavorites,
    setShowOnlyFavorites,
    isExpandedFilters,
    setIsExpandedFilters,
    allTags,
    toggleTag,
    selectedTags,
    getTagStyle,
    handleAITagFolder
}) {
    const [contextMenu, setContextMenu] = useState(null)
    const menuRef = useRef(null)

    const handleRightClick = (e, folderPath) => {
        e.preventDefault()
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            path: folderPath
        })
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setContextMenu(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    const tree = buildFolderTree(folders)

    const renderTree = (nodes, level = 0) => {
        return nodes.map(node => {
            const isOpen = expandedFolders.has(node.fullPath)
            const isSelected = selectedFolder === node.fullPath
            const hasChildren = node.children.length > 0

            return (
                <div key={node.fullPath}>
                    <div
                        className={`flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-800 cursor-pointer text-sm truncate group ${isSelected ? 'text-blue-400 bg-blue-900/10 font-medium' : 'text-gray-300'}`}
                        style={{ paddingLeft: `${level * 12 + 8}px` }}
                        onClick={() => setSelectedFolder(node.fullPath)}
                        onContextMenu={(e) => handleRightClick(e, node.fullPath)}
                    >
                        <div className="flex items-center min-w-0 flex-1">
                            {hasChildren ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFolder(node.fullPath); }}
                                    className="p-1 -ml-1 mr-0.5 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <ChevronRightIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                </button>
                            ) : (
                                <div className="w-6" />
                            )}
                            <FolderIcon className={`w-4 h-4 mr-2 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                            <div className="min-w-0 flex-1 flex items-center overflow-hidden">
                                {node.displayPrefix && (
                                    <span className="shrink-0 text-gray-500 whitespace-pre opacity-60 font-normal">{node.displayPrefix}</span>
                                )}
                                <span className="truncate">{node.name}</span>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleScan(node.fullPath, true); }}
                            className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            title={t('force_rescan')}
                        >
                            <RefreshIcon className="w-3 h-3" />
                        </button>
                    </div>
                    {hasChildren && isOpen && renderTree(node.children, level + 1)}
                </div>
            )
        })
    }

    return (
        <div className="w-80 shrink-0 flex flex-col border-r border-gray-800 bg-[#161616]">
            {/* Header / Search */}
            <div className="p-4 space-y-4">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
                    {t('title')}
                    <span className="text-xs text-gray-500 block font-normal mt-1">v0.1.0</span>
                </h1>

                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#202020] border border-gray-700 rounded-md py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none placeholder-gray-500"
                    />
                    <div className="absolute left-3 top-2.5">
                        <SearchIcon />
                    </div>
                </div>
            </div>

            <div className="px-4 pb-4 border-b border-gray-800 space-y-3">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t('sort_order')}</label>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                        className="w-full bg-[#202020] border border-gray-700 rounded-md py-2 px-3 text-sm focus:outline-none"
                    >
                        <option value="newest">{t('newest')}</option>
                        <option value="oldest">{t('oldest')}</option>
                        <option value="name-asc">名称 (A-Z)</option>
                        <option value="name-desc">名称 (Z-A)</option>
                    </select>
                </div>

                {/* Add Folder (Scan) */}
                <div className="space-y-4">
                    {!scanning ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={t('scan_path')}
                                value={path}
                                onChange={e => setPath(e.target.value)}
                                className="flex-1 bg-[#202020] border border-gray-700 rounded-md py-2 px-3 text-sm focus:outline-none"
                            />
                            <button
                                onClick={() => handleScan(path)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                {t('scan_btn')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="bg-blue-600/20 border border-blue-500/30 rounded-md p-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs text-blue-400 font-medium">{t('scanning')}</span>
                                </div>
                                <button
                                    onClick={abortScan}
                                    className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors font-bold uppercase tracking-wider"
                                >
                                    {t('abort_scan')}
                                </button>
                            </div>
                        </div>
                    )}

                    {(logs.length > 0 || scanning) && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('scan_logs')}</label>
                                {logs.length > 0 && (
                                    <button onClick={() => setLogs([])} className="text-[10px] text-gray-600 hover:text-gray-400">{t('clear_logs')}</button>
                                )}
                            </div>
                            <div
                                ref={logsContainerRef}
                                className="w-full bg-black/40 border border-gray-800 rounded-md p-2 h-[100px] overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed"
                            >
                                {logs.length === 0 && <div className="text-gray-700 italic opacity-50">Waiting for logs...</div>}
                                {logs.map((log, i) => (
                                    <div key={i} className={`whitespace-nowrap truncate ${log.type === 'error' ? 'text-red-400' : log.type === 'done' || log.type === 'aborted' ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                                        <span className="opacity-40 mr-1">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                        {typeof log === 'string' ? log : (log.message || log.file || JSON.stringify(log))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Folders List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-400">{t('folders')}</h3>
                            <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">{folders.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={expandAll}
                                className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                title={t('expand_all')}
                            >
                                <ExpandIcon />
                            </button>
                            <button
                                onClick={collapseAll}
                                className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                title={t('collapse_all')}
                            >
                                <CollapseIcon />
                            </button>
                        </div>
                    </div>
                    <ul className="space-y-1">
                        <li
                            className={`flex items-center px-2 py-1.5 rounded-md hover:bg-gray-800 cursor-pointer text-sm font-medium ${!selectedFolder ? 'text-blue-400 bg-blue-900/10' : 'text-gray-300'}`}
                            onClick={() => setSelectedFolder(null)}
                        >
                            <LayoutIcon />
                            {t('all_assets')}
                        </li>

                        {renderTree(tree)}
                        {folders.length === 0 && <li className="text-xs text-gray-600 px-2 italic">{t('no_folders_scanned')}</li>}
                    </ul>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="border-t border-gray-800">
                <div
                    className="p-4 flex items-center justify-between text-sm text-gray-400 cursor-pointer hover:bg-gray-800/50"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                    <span className="flex items-center gap-2"><FilterIcon /> {t('advanced_filters')}</span>
                    <div className="flex items-center gap-3">
                        {/* Quick Favorite Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowOnlyFavorites(!showOnlyFavorites) }}
                            className={`p-1 rounded-md transition-colors ${showOnlyFavorites ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                            title={t('show_favorites_only')}
                        >
                            <StarIcon className="w-4 h-4" />
                        </button>
                        <svg className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {isFiltersOpen && (
                    <div className="px-4 pb-4 space-y-4">
                        {!isExpandedFilters ? (
                            <div className="space-y-3">
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('top_tags')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.slice(0, 4).map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className="px-2 py-1 rounded text-xs transition-all border"
                                            style={getTagStyle(tag, selectedTags.has(tag.id))}
                                        >
                                            {tag.name}
                                            <span className="ml-1 opacity-60 text-[10px]">{tag.count}</span>
                                        </button>
                                    ))}
                                    {allTags.length === 0 && <span className="text-xs text-gray-600 italic">{t('no_tags_detected')}</span>}
                                </div>
                                {allTags.length > 4 && (
                                    <button
                                        onClick={() => setIsExpandedFilters(true)}
                                        className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-blue-400 font-medium transition-colors"
                                    >
                                        {t('show_all')} ({allTags.length}) <PlusIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                {(() => {
                                    const grouped = allTags.reduce((acc, tag) => {
                                        const type = tag.type || 'other'
                                        if (!acc[type]) acc[type] = []
                                        acc[type].push(tag)
                                        return acc
                                    }, {})
                                    const labels = {
                                        model: t('base_models'),
                                        lora: t('loras'),
                                        tool: t('source_tools'),
                                        other: t('misc')
                                    }
                                    return Object.entries(grouped).sort().map(([type, tags]) => (
                                        <div key={type} className="space-y-2">
                                            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                                                <div className="w-1 h-3 rounded-full" style={{ backgroundColor: tags[0]?.color }}></div>
                                                {labels[type] || type}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => toggleTag(tag.id)}
                                                        className="px-2 py-1 rounded text-xs transition-all border"
                                                        style={getTagStyle(tag, selectedTags.has(tag.id))}
                                                    >
                                                        {tag.name}
                                                        <span className="ml-1 opacity-60 text-[10px]">{tag.count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                })()}
                                <button
                                    onClick={() => setIsExpandedFilters(false)}
                                    className="text-[10px] text-gray-500 hover:text-blue-400 font-medium transition-colors"
                                >
                                    {t('show_less')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={menuRef}
                    className="fixed z-50 bg-[#202020] border border-gray-700 rounded-md shadow-2xl py-1 min-w-[160px] animate-in fade-in zoom-in duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
                        onClick={() => {
                            handleAITagFolder(contextMenu.path)
                            setContextMenu(null)
                        }}
                    >
                        <svg className="w-4 h-4 text-green-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {t('ai_tag_folder')}
                    </button>
                    <div className="h-px bg-gray-700 my-1"></div>
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        onClick={() => setContextMenu(null)}
                    >
                        {t('cancel')}
                    </button>
                </div>
            )}
        </div>
    )
}
