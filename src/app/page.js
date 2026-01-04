'use client'
import { useState, useEffect, useRef } from 'react'
import { translations } from '@/lib/i18n'

// Simple Icon Components
// Simple Icon Components
const SearchIcon = ({ className = "w-5 h-5 text-gray-400" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
const FolderIcon = ({ className = "w-4 h-4 text-gray-400 mr-2" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
const PlusIcon = ({ className = "w-4 h-4 mr-2" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
const InfoIcon = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const StarIcon = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
const CopyIcon = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
const FilterIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>

const GridIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>

const ListIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
const SettingsIcon = ({ className }) => <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
const TrashIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
const RefreshIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>

export default function Home() {
    const [path, setPath] = useState('')
    const [files, setFiles] = useState([])
    const [filteredFiles, setFilteredFiles] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    // Zoom & Pan State
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0 })

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOrder, setSortOrder] = useState('newest')
    const [folders, setFolders] = useState([]) // Unique parent paths
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [expandedFolders, setExpandedFolders] = useState(new Set())

    // Tag Filters
    const [allTags, setAllTags] = useState([])
    const [selectedTags, setSelectedTags] = useState(new Set())
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)
    const [isExpandedFilters, setIsExpandedFilters] = useState(false)
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false) // New state for favorites filter
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [cardScale, setCardScale] = useState(100) // Card scale percentage (15-200)
    const [lang, setLang] = useState('zh') // 'zh' | 'en'
    const [hoveredFileId, setHoveredFileId] = useState(null)

    // Settings UI
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [importedPaths, setImportedPaths] = useState([])
    const [tagPool, setTagPool] = useState([])
    const [systemSettings, setSystemSettings] = useState({ cachePath: '.cache/thumbnails' })
    const [newTagName, setNewTagName] = useState('')

    // Translation helper
    const t = (key, params = {}) => {
        let text = translations[lang]?.[key] || key
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p])
        })
        return text
    }

    // Load language from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang')
        if (savedLang) setLang(savedLang)
    }, [])

    // Save language to localStorage
    const changeLanguage = (newLang) => {
        setLang(newLang)
        localStorage.setItem('app_lang', newLang)
    }

    const onProgress = (msg) => {
        setLogs(prev => [...prev, msg])
    }

    const logsContainerRef = useRef(null)

    // Scroll logs to bottom
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
        }
    }, [logs])

    const fetchFiles = async (folderPath = null) => {
        setLoading(true)
        try {
            const url = folderPath
                ? `/api/files?limit=500&parentPath=${encodeURIComponent(folderPath)}`
                : '/api/files?limit=500'
            const res = await fetch(url)
            const json = await res.json()
            const data = json.data || []
            setFiles(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchFolders = async () => {
        try {
            const res = await fetch('/api/folders')
            const json = await res.json()
            setFolders(json.data || [])
        } catch (e) {
            console.error(e)
        }
    }

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings')
            const data = await res.json()
            setSystemSettings(prev => ({ ...prev, ...data }))
        } catch (e) { console.error(e) }
    }

    const saveSetting = async (key, value) => {
        try {
            await fetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ key, value })
            })
            setSystemSettings(prev => ({ ...prev, [key]: value }))
        } catch (e) { console.error(e) }
    }

    const fetchPaths = async () => {
        try {
            const res = await fetch('/api/paths')
            const data = await res.json()
            // Deduplicate paths more intelligently: usually users scan a folder. 
            // We only want to show the specific paths they typed in the box.
            // For simplicity, let's show all unique parent paths.
            setImportedPaths(data)
        } catch (e) { console.error(e) }
    }

    const removePath = async (p) => {
        if (!confirm(t('delete_confirm'))) return
        try {
            await fetch(`/api/paths?path=${encodeURIComponent(p)}`, { method: 'DELETE' })
            fetchPaths()
            fetchFiles()
        } catch (e) { console.error(e) }
    }

    const fetchTagPool = async () => {
        try {
            const res = await fetch('/api/tags/pool')
            const data = await res.json()
            setTagPool(data)
        } catch (e) { console.error(e) }
    }

    const addTagToPool = async () => {
        if (!newTagName.trim()) return
        try {
            await fetch('/api/tags/pool', {
                method: 'POST',
                body: JSON.stringify({ name: newTagName, type: 'custom' })
            })
            setNewTagName('')
            fetchTagPool()
        } catch (e) { console.error(e) }
    }

    const deleteTagFromPool = async (id) => {
        if (!confirm(t('delete_confirm'))) return
        try {
            await fetch(`/api/tags/pool/${id}`, { method: 'DELETE' })
            fetchTagPool()
        } catch (e) { console.error(e) }
    }

    useEffect(() => {
        if (isSettingsOpen) {
            fetchSettings()
            fetchPaths()
            fetchTagPool()
        }
    }, [isSettingsOpen])

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags')
            const json = await res.json()
            if (json.success) setAllTags(json.data)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchFiles()
        fetchFolders()
        fetchTags()
    }, [])

    // Reload files when folder selection changes
    useEffect(() => {
        fetchFiles(selectedFolder)
    }, [selectedFolder])

    // Filter Logic
    useEffect(() => {
        let res = [...files]

        // Search
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase()
            res = res.filter(f =>
                f.fileName.toLowerCase().includes(lowerQ) ||
                (f.aigcMetaInfo?.prompt && f.aigcMetaInfo.prompt.toLowerCase().includes(lowerQ)) ||
                (f.aigcMetaInfo?.modelName && f.aigcMetaInfo.modelName.toLowerCase().includes(lowerQ))
            )
        }

        // Sort
        if (sortOrder === 'newest') {
            res.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime))
        } else if (sortOrder === 'oldest') {
            res.sort((a, b) => new Date(a.modifiedTime) - new Date(b.modifiedTime))
        } else if (sortOrder === 'name-asc') {
            res.sort((a, b) => a.fileName.localeCompare(b.fileName))
        } else if (sortOrder === 'name-desc') {
            res.sort((a, b) => b.fileName.localeCompare(a.fileName))
        }

        // Filter by Tags
        if (selectedTags.size > 0) {
            res = res.filter(f => {
                const fileTagIds = new Set(f.tags?.map(t => t.id) || [])
                // Must have ALL selected tags (AND logic)
                return Array.from(selectedTags).every(tid => fileTagIds.has(tid))
            })
        }
        // Favorites
        if (showOnlyFavorites) {
            res = res.filter(f => f.isFavorite)
        }

        setFilteredFiles(res)
    }, [files, searchQuery, sortOrder, selectedTags, showOnlyFavorites])


    const toggleTag = (tagId) => {
        setSelectedTags(prev => {
            const next = new Set(prev)
            if (next.has(tagId)) next.delete(tagId)
            else next.add(tagId)
            return next
        })
    }


    // Helper to build recursive tree from flat paths
    const buildFolderTree = (paths) => {
        const root = {}
        const folderSet = new Set(paths)

        paths.forEach(fullPath => {
            const parts = fullPath.split('\\')
            let current = root
            let currentPath = ''

            parts.forEach((part, index) => {
                currentPath = index === 0 ? part : currentPath + '\\' + part
                if (!current[part]) {
                    current[part] = {
                        name: part,
                        fullPath: currentPath,
                        children: {}
                    }
                }
                current = current[part].children
            })
        })

        const convertToArr = (node) => {
            return Object.values(node).map(item => {
                let current = item
                let nameParts = [item.name]

                // Look ahead in raw children (node based)
                while (Object.keys(current.children).length === 1 && !folderSet.has(current.fullPath)) {
                    const childName = Object.keys(current.children)[0]
                    const child = current.children[childName]
                    nameParts.push(child.name)
                    current = child
                }

                const children = convertToArr(current.children)

                let displayName = current.name
                let displayPrefix = ""

                if (nameParts.length > 1) {
                    if (nameParts.length > 2) {
                        // C: > ... > AIGC format
                        displayPrefix = `${nameParts[0]} \u00A0\u203A\u00A0 ... \u00A0\u203A\u00A0 `
                        displayName = nameParts[nameParts.length - 1]
                    } else {
                        // C: > Users format
                        displayPrefix = `${nameParts[0]} \u00A0\u203A\u00A0 `
                        displayName = nameParts[1]
                    }
                }

                return {
                    ...current,
                    name: displayName,
                    displayPrefix,
                    children
                }
            }).sort((a, b) => a.name.localeCompare(b.name))
        }

        return convertToArr(root)
    }

    const toggleFolder = (path) => {
        setExpandedFolders(prev => {
            const next = new Set(prev)
            if (next.has(path)) next.delete(path)
            else next.add(path)
            return next
        })
    }

    const expandAll = () => {
        // Collect all possible parent paths from the tree
        const allPaths = new Set()
        const traverse = (nodes) => {
            nodes.forEach(node => {
                if (node.children.length > 0) {
                    allPaths.add(node.fullPath)
                    traverse(node.children)
                }
            })
        }
        traverse(buildFolderTree(folders))
        setExpandedFolders(allPaths)
    }

    const collapseAll = () => {
        setExpandedFolders(new Set())
    }

    const eventSourceRef = useRef(null)
    const scanIntervalRef = useRef(null)

    const abortScan = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
            setScanning(false)
            onProgress(`\n> ${t('scan_aborted')}`)
        }
        // Clear interval when aborting
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current)
            scanIntervalRef.current = null
        }
    }

    // Auto-refresh folders during scanning
    useEffect(() => {
        if (scanning) {
            // Refresh immediately when scanning starts
            fetchFolders()

            // Set up interval to refresh every 10 seconds
            scanIntervalRef.current = setInterval(() => {
                fetchFolders()
            }, 10000)
        } else {
            // Clear interval when scanning stops
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current)
                scanIntervalRef.current = null
            }
        }

        // Cleanup on unmount
        return () => {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current)
            }
        }
    }, [scanning])

    const handleScan = async (targetPath, force = false) => {
        const scanPath = targetPath || path
        if (!scanPath) return

        setScanning(true)
        setLogs([])

        // Close existing if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        // Add force param
        const eventSource = new EventSource(`/api/scan/sse?path=${encodeURIComponent(scanPath)}&force=${force}`)
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'done') {
                    eventSource.close()
                    eventSourceRef.current = null
                    setScanning(false)
                    fetchFiles()
                    fetchFolders()
                } else if (data.type === 'aborted') {
                    eventSource.close()
                    eventSourceRef.current = null
                    setScanning(false)
                    fetchFiles()
                    fetchFolders()
                } else if (data.type === 'error') {
                    // handle error
                    eventSource.close()
                    eventSourceRef.current = null
                    setScanning(false)
                } else {
                    setLogs(prev => [...prev.slice(-49), data]) // Keep last 50 logs for reference
                }
            } catch (e) { }
        }

        eventSource.onerror = () => {
            eventSource.close()
            eventSourceRef.current = null
            setScanning(false)
            fetchFiles()
            fetchFolders()
        }
    }

    // Navigation Helpers
    const handleNext = (e) => {
        e?.stopPropagation()
        if (!selectedFile) return
        const idx = filteredFiles.findIndex(f => f.id === selectedFile.id)
        if (idx !== -1 && idx < filteredFiles.length - 1) {
            setSelectedFile(filteredFiles[idx + 1])
        }
    }

    const handlePrev = (e) => {
        e?.stopPropagation()
        if (!selectedFile) return
        const idx = filteredFiles.findIndex(f => f.id === selectedFile.id)
        if (idx > 0) {
            setSelectedFile(filteredFiles[idx - 1])
        }
    }

    // Reset zoom/pan when file changes
    useEffect(() => {
        if (selectedFile) {
            setZoom(1)
            setPan({ x: 0, y: 0 })
        }
    }, [selectedFile])

    // Zoom & Pan Handlers
    const handleWheel = (e) => {
        // Only zoom if image
        if (selectedFile?.fileType !== 'image') return

        // Prevent default scroll if needed, though stopPropagation is usually enough in fixed modal
        e.stopPropagation()

        // Calculate new zoom
        const scaleAmount = -e.deltaY * 0.002
        const newZoom = Math.max(1, Math.min(zoom + scaleAmount, 5)) // Min 1x, Max 5x

        setZoom(newZoom)

        // If zooming out to 1x, reset pan
        if (newZoom === 1) {
            setPan({ x: 0, y: 0 })
        }
    }

    const handleMouseDown = (e) => {
        if (zoom > 1) {
            e.preventDefault()
            setIsDragging(true)
            dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
        }
    }

    const handleMouseMove = (e) => {
        if (isDragging && zoom > 1) {
            e.preventDefault()
            const newX = e.clientX - dragStart.current.x
            const newY = e.clientY - dragStart.current.y
            setPan({ x: newX, y: newY })
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
    }

    const toggleFavorite = async (file) => {
        try {
            const res = await fetch(`/api/files/${file.id}/favorite`, { method: 'POST' })
            const json = await res.json()
            if (json.success) {
                // Update local state
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isFavorite: json.isFavorite } : f))
            }
        } catch (e) {
            console.error('Failed to toggle favorite:', e)
        }
    }

    // Helper to generate tag style
    const getTagStyle = (tag, isSelected = false) => {
        const color = tag.color || '#4b5563'
        if (isSelected) {
            return {
                backgroundColor: color,
                borderColor: color,
                color: '#fff',
                fontWeight: 'bold',
                boxShadow: `0 0 10px ${color}40`
            }
        }
        // Reading friendly: higher contrast and saturation for dark mode
        return {
            backgroundColor: `${color}20`, // 12.5% opacity
            borderColor: `${color}60`,     // 37.5% opacity
            color: color,
            fontWeight: '500'
        }
    }

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === '0') return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedFile) return

            switch (e.key) {
                case 'Escape': setSelectedFile(null); break;
                case 'ArrowRight': handleNext(); break;
                case 'ArrowLeft': handlePrev(); break;
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedFile, filteredFiles])

    return (
        <div className="flex h-screen bg-[#111111] text-gray-200 font-sans overflow-hidden">

            {/* LEFT SIDEBAR */}
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
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                </button>
                                <button
                                    onClick={collapseAll}
                                    className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                    title={t('collapse_all')}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16m0-16L4 20" /></svg>
                                </button>
                            </div>
                        </div>
                        <ul className="space-y-1">
                            <li
                                className={`flex items-center px-2 py-1.5 rounded-md hover:bg-gray-800 cursor-pointer text-sm font-medium ${!selectedFolder ? 'text-blue-400 bg-blue-900/10' : 'text-gray-300'}`}
                                onClick={() => setSelectedFolder(null)}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                {t('all_assets')}
                            </li>

                            {(() => {
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
                                                >
                                                    <div className="flex items-center min-w-0 flex-1">
                                                        {hasChildren ? (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleFolder(node.fullPath); }}
                                                                className="p-1 -ml-1 mr-0.5 text-gray-500 hover:text-gray-300 transition-colors"
                                                            >
                                                                <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
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
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                    </button>
                                                </div>
                                                {hasChildren && isOpen && renderTree(node.children, level + 1)}
                                            </div>
                                        )
                                    })
                                }
                                return renderTree(tree)
                            })()}
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
                                // DEFAULT VIEW: Show top 4 tags
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
                                // EXPANDED VIEW: Grouped by Category
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
                                        className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-blue-400 font-medium transition-colors border-t border-gray-800 pt-3 w-full"
                                    >
                                        {t('show_fewer')} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" /></svg>
                                    </button>
                                </div>
                            )}

                            {selectedTags.size > 0 && (
                                <div className="pt-2 border-t border-gray-800">
                                    <button
                                        onClick={() => setSelectedTags(new Set())}
                                        className="text-[10px] text-red-500 hover:text-red-400 font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        {t('reset_filters')} ({selectedTags.size})
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Language Switcher Footer */}
                <div className="px-4 py-2 border-t border-gray-800 bg-[#141414] flex justify-center gap-4">
                    <button
                        onClick={() => changeLanguage('zh')}
                        className={`text-[10px] font-bold px-2 py-1 rounded ${lang === 'zh' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        中文 (ZH)
                    </button>
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`text-[10px] font-bold px-2 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        English (EN)
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0e0e0e]">
                {/* Simple Top Bar (Status) */}
                <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111111] shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded text-xs font-medium">{t('status_active')}</span>
                        <span className="text-sm text-gray-500 font-medium">{t('library_items', { count: filteredFiles.length })}</span>
                        {loading && <span className="text-xs text-gray-400 animate-pulse">{t('loading')}</span>}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Switcher */}
                        <div className="flex bg-[#1a1a1a] border border-gray-800 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                title={t('grid_view')}
                            >
                                <GridIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                title={t('list_view')}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Card Scale Slider (Grid View Only) */}
                        {viewMode === 'grid' && (
                            <>
                                <div className="w-px h-4 bg-gray-800" />
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 whitespace-nowrap">缩放</span>
                                    <input
                                        type="range"
                                        min="15"
                                        max="200"
                                        value={cardScale}
                                        onChange={(e) => setCardScale(parseInt(e.target.value))}
                                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        style={{
                                            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(cardScale - 15) / 1.85}%, #374151 ${(cardScale - 15) / 1.85}%, #374151 100%)`
                                        }}
                                    />
                                    <span className="text-xs text-gray-400 font-mono w-10 text-right">{cardScale}%</span>
                                </div>
                            </>
                        )}

                        <div className="w-px h-4 bg-gray-800" />

                        <button
                            onClick={() => {
                                const paths = filteredFiles.map(f => f.filePath).join('\n')
                                copyToClipboard(paths)
                                onProgress(`\n${t('copied', { count: filteredFiles.length })}`)
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-xs text-gray-300 transition-colors"
                        >
                            <CopyIcon className="w-3.5 h-3.5" /> {t('export_paths')}
                        </button>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-gray-400 transition-all hover:text-white"
                            title={t('settings')}
                        >
                            <SettingsIcon />
                        </button>

                        <button
                            onClick={() => handleScan(path, true)}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-blue-400 transition-all hover:rotate-180 duration-500"
                            title={t('force_rescan')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {viewMode === 'grid' ? (
                        /* GRID VIEW */
                        <div
                            className="grid gap-6"
                            style={{
                                gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(120, 200 * (cardScale / 100))}px, 1fr))`
                            }}
                        >
                            {filteredFiles.map(file => (
                                <div
                                    key={file.id}
                                    className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-xl"
                                >
                                    <div
                                        className="aspect-9/16 bg-black relative overflow-hidden"
                                        onClick={() => setSelectedFile(file)}
                                        onMouseEnter={() => setHoveredFileId(file.id)}
                                        onMouseLeave={() => setHoveredFileId(null)}
                                    >
                                        {(file.fileType === 'image' || file.thumbnailPath) ? (
                                            <>
                                                <img
                                                    src={file.thumbnailPath || `/api/image?path=${encodeURIComponent(file.filePath)}`}
                                                    alt={file.fileName}
                                                    style={{
                                                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                                    }}
                                                    className={`w-full h-full object-cover transition-opacity duration-300 ${hoveredFileId === file.id && file.fileType === 'video' ? 'opacity-0' : 'opacity-100'} group-hover:scale-105 animate-fade-in`}
                                                    loading="lazy"
                                                />
                                                {hoveredFileId === file.id && file.fileType === 'video' && (
                                                    <video
                                                        src={`/api/image?path=${encodeURIComponent(file.filePath)}`}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        autoPlay
                                                        muted
                                                        loop
                                                        playsInline
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600/50 font-bold text-2xl uppercase">
                                                {file.fileExt}
                                            </div>
                                        )}

                                        {/* Overlay Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#1a1a1a]/75 border-t border-gray-800/50 backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-gray-100 text-sm font-semibold truncate drop-shadow-md" title={file.fileName}>{file.fileName}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-700/30">{file.fileExt.toUpperCase()}</span>
                                                <span className="text-[10px] text-gray-300 font-medium">{formatFileSize(file.fileSize)}</span>
                                            </div>
                                            {file.tags && file.tags.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-700/30 flex flex-wrap gap-1">
                                                    {file.tags.slice(0, 3).map(tag => (
                                                        <span key={tag.id} className="text-[9px] px-1.5 py-0.5 rounded border" style={getTagStyle(tag)}>
                                                            {tag.name.slice(0, 3)}{tag.name.length > 3 ? '..' : ''}
                                                        </span>
                                                    ))}
                                                    {file.tags.length > 3 && <span className="text-[9px] text-gray-400">...</span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className={`p-1.5 rounded-md backdrop-blur-sm shadow-lg transition-colors ${file.isFavorite ? 'bg-amber-500/80 text-white' : 'bg-black/40 hover:bg-black/60 text-white'}`}
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(file) }}
                                            >
                                                <StarIcon className={`w-4 h-4 ${file.isFavorite ? 'fill-current' : ''}`} />
                                            </button>
                                            <button className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-md backdrop-blur-sm shadow-lg transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedFile(file) }}>
                                                <InfoIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* LIST VIEW */
                        <div className="bg-[#161616] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#1a1a1a] text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">{t('preview')}</th>
                                        <th className="px-6 py-4">{t('filename')}</th>
                                        <th className="px-6 py-4">{t('metadata')}</th>
                                        <th className="px-6 py-4">{t('tags')}</th>
                                        <th className="px-6 py-4 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filteredFiles.map(file => (
                                        <tr
                                            key={file.id}
                                            className="hover:bg-blue-600/5 transition-colors group"
                                            onMouseEnter={() => setHoveredFileId(file.id)}
                                            onMouseLeave={() => setHoveredFileId(null)}
                                        >
                                            <td className="px-6 py-3">
                                                <div
                                                    className="w-12 h-16 bg-black rounded-md overflow-hidden border border-gray-700 cursor-pointer shadow-md group-hover:border-blue-500/50 transition-all hover:scale-105 flex items-center justify-center font-bold text-[10px] text-gray-600 relative"
                                                    onClick={() => setSelectedFile(file)}
                                                >
                                                    {(file.fileType === 'image' || file.thumbnailPath) ? (
                                                        <>
                                                            <img
                                                                src={file.thumbnailPath || `/api/image?path=${encodeURIComponent(file.filePath)}`}
                                                                className={`w-full h-full object-cover transition-opacity duration-300 ${hoveredFileId === file.id && file.fileType === 'video' ? 'opacity-0' : 'opacity-100'}`}
                                                                loading="lazy"
                                                            />
                                                            {hoveredFileId === file.id && file.fileType === 'video' && (
                                                                <video
                                                                    src={`/api/image?path=${encodeURIComponent(file.filePath)}`}
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                    autoPlay
                                                                    muted
                                                                    loop
                                                                    playsInline
                                                                />
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="opacity-50">{file.fileExt.toUpperCase()}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 max-w-xs md:max-w-md">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-200 truncate cursor-pointer hover:text-blue-400 transition-colors" title={file.fileName} onClick={() => setSelectedFile(file)}>
                                                        {file.fileName}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono truncate mt-0.5 opacity-50 select-all" title={file.filePath}>{file.filePath}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-blue-300 bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-700/30 font-bold uppercase">{file.fileExt}</span>
                                                        <span className="text-[11px] text-gray-400">{formatFileSize(file.fileSize)}</span>
                                                    </div>
                                                    {file.aigcMetaInfo?.modelName && (
                                                        <span className="text-[10px] text-purple-400 font-medium truncate max-w-[120px]" title={file.aigcMetaInfo.modelName}>{file.aigcMetaInfo.modelName}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                    {file.tags?.slice(0, 5).map(tag => (
                                                        <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded border transition-all" style={getTagStyle(tag)}>
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                    {file.tags?.length > 5 && <span className="text-[10px] text-gray-500 font-bold">+{file.tags.length - 5}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex justify-end gap-2 text-gray-400">
                                                    <button
                                                        onClick={() => toggleFavorite(file)}
                                                        className={`p-1.5 rounded-lg transition-all ${file.isFavorite ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500 hover:bg-amber-500/10'}`}
                                                        title={file.isFavorite ? t('unfavorite') : t('favorite')}
                                                    >
                                                        <StarIcon className={`w-4 h-4 ${file.isFavorite ? 'fill-current' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => { if (file.aigcMetaInfo?.prompt) { copyToClipboard(file.aigcMetaInfo.prompt); onProgress(`\n${t('prompt_copied')}`); } }}
                                                        className="p-1.5 rounded-lg hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                                        title={t('copy_prompt')}
                                                    >
                                                        <CopyIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedFile(file)}
                                                        className="p-1.5 rounded-lg hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                                        title={t('view_details')}
                                                    >
                                                        <InfoIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredFiles.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 py-32">
                            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-lg font-medium">{t('no_assets_found')}</p>
                            <p className="text-sm opacity-60">{t('try_scanning_or_clearing_filters')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* LIGHTBOX MODAL */}
            {selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setSelectedFile(null)}></div>

                    {/* Modal Content */}
                    <div className="relative w-full h-full flex flex-row">

                        {/* Main View Area (Image/Video) */}
                        <div className="flex-1 flex flex-col relative" onClick={() => setSelectedFile(null)}>
                            {/* Header Controls */}
                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-linear-to-b from-black/60 to-transparent">
                                <span className="bg-black/50 text-white px-2 py-1 rounded text-xs font-mono">
                                    {filteredFiles.findIndex(f => f.id === selectedFile.id) + 1} / {filteredFiles.length}
                                </span>
                                <button className="text-white hover:text-gray-300 p-2" onClick={(e) => { e.stopPropagation(); /* TODO: Fullscreen toggle based on ref if needed */ }}>
                                    {t('screen')}
                                </button>
                            </div>

                            {/* Prev Button */}
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/60 rounded-full transition-all z-20"
                                onClick={handlePrev}
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>

                            {/* Content */}
                            <div
                                className="flex-1 flex items-center justify-center p-8 overflow-hidden"
                                onWheel={handleWheel}
                                onMouseLeave={handleMouseUp}
                            >
                                {selectedFile.fileType === 'image' ? (
                                    <img
                                        src={`/api/image?path=${encodeURIComponent(selectedFile.filePath)}`}
                                        alt={selectedFile.fileName}
                                        style={{
                                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                        }}
                                        className="max-w-full max-h-full object-contain shadow-2xl"
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        draggable={false}
                                    />
                                ) : selectedFile.fileType === 'video' ? (
                                    <video
                                        controls
                                        autoPlay
                                        className="max-w-full max-h-full object-contain shadow-2xl"
                                        src={`/api/image?path=${encodeURIComponent(selectedFile.filePath)}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t('video_not_supported')}
                                    </video>
                                ) : (
                                    <div className="text-gray-500 text-4xl font-bold">{selectedFile.fileExt.toUpperCase()}</div>
                                )}
                            </div>

                            {/* Next Button */}
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/60 rounded-full transition-all z-20"
                                onClick={handleNext}
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        {/* Metadata Sidebar */}
                        <div className="w-96 bg-[#161616] border-l border-gray-800 flex flex-col shadow-2xl z-30">
                            {/* Sidebar Header */}
                            <div className="h-14 border-b border-gray-800 flex justify-between items-center px-4 bg-[#161616]">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-200">{t('asset_details')}</h3>
                                    <button
                                        onClick={() => toggleFavorite(selectedFile)}
                                        className={`p-1 rounded-md transition-all ${selectedFile.isFavorite ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                                        title={selectedFile.isFavorite ? t('unfavorite') : t('favorite')}
                                    >
                                        <StarIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                                {/* Mini Map / File Info */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-100 mb-1 break-all" title={selectedFile.fileName}>
                                        {selectedFile.fileName}
                                    </h4>
                                    <p className="text-xs text-blue-400 mb-4">{new Date(selectedFile.modifiedTime).toLocaleString()}</p>

                                    <div className="space-y-4">
                                        {/* Basic Info Grid */}
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="bg-[#1a1a1a] p-2 rounded border border-gray-800">
                                                <span className="block text-gray-500 uppercase mb-0.5">{t('dimensions')}</span>
                                                <span className="text-gray-200 font-medium">
                                                    {selectedFile.aigcMetaInfo?.width && selectedFile.aigcMetaInfo?.height
                                                        ? `${selectedFile.aigcMetaInfo.width} x ${selectedFile.aigcMetaInfo.height}`
                                                        : t('unknown')}
                                                </span>
                                            </div>
                                            <div className="bg-[#1a1a1a] p-2 rounded border border-gray-800">
                                                <span className="block text-gray-500 uppercase mb-0.5">{t('file_size')}</span>
                                                <span className="text-gray-200 font-medium">{formatFileSize(selectedFile.fileSize)}</span>
                                            </div>
                                        </div>

                                        {/* Path Info */}
                                        <div className="bg-[#1a1a1a] p-2 rounded border border-gray-800 space-y-1">
                                            <span className="block text-[10px] text-gray-500 uppercase">{t('path')}</span>
                                            <p className="text-[10px] text-gray-400 break-all leading-tight font-mono">{selectedFile.filePath}</p>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => copyToClipboard(selectedFile.filePath)}
                                                    className="text-[10px] text-blue-500 hover:text-blue-400"
                                                >
                                                    {t('copy_path')}
                                                </button>
                                                <button className="text-[10px] text-gray-600 hover:text-gray-400">{t('open_folder')}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tag Input Stub */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input type="text" placeholder={t('add_tag_placeholder')} disabled className="w-full bg-[#111] border border-gray-700 rounded px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
                                        <span className="absolute right-3 top-2.5 text-gray-600"><StarIcon /></span>
                                    </div>

                                    {selectedFile.tags && selectedFile.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFile.tags.map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="px-2 py-0.5 rounded text-[10px] border transition-colors"
                                                    style={getTagStyle(tag)}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Metadata */}
                                {selectedFile.aigcMetaInfo ? (
                                    <div className="space-y-6">
                                        {/* Prompt */}
                                        {selectedFile.aigcMetaInfo.prompt && (
                                            <div className="space-y-1">
                                                <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('prompt')}</h5>
                                                <div className="p-3 bg-[#0a0a0a] rounded border border-gray-800 text-xs text-gray-300 leading-relaxed font-mono max-h-48 overflow-y-auto custom-scrollbar select-text selection:bg-blue-900/50">
                                                    {selectedFile.aigcMetaInfo.prompt}
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        className="text-[10px] text-blue-500 hover:text-blue-400"
                                                        onClick={() => { copyToClipboard(selectedFile.aigcMetaInfo.prompt); onProgress(`\n${t('prompt_copied')}`); }}
                                                    >
                                                        {t('copy_prompt')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Negative Prompt */}
                                        {selectedFile.aigcMetaInfo.negativePrompt && (
                                            <div className="space-y-1">
                                                <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('negative_prompt')}</h5>
                                                <div className="p-3 bg-[#0a0a0a] rounded border border-red-900/20 text-xs text-gray-400 leading-relaxed font-mono select-text selection:bg-red-900/30">
                                                    {selectedFile.aigcMetaInfo.negativePrompt}
                                                </div>
                                            </div>
                                        )}

                                        {/* Generation Details Grid */}
                                        <div className="border-t border-gray-800 pt-4">
                                            <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3">{t('generation_details')}</h5>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="bg-gray-800/50 p-2 rounded">
                                                    <span className="block text-[10px] text-gray-500 uppercase">{t('model_name')}</span>
                                                    <span className="font-medium text-purple-300 truncate block" title={selectedFile.aigcMetaInfo.modelName}>{selectedFile.aigcMetaInfo.modelName || t('na')}</span>
                                                </div>
                                                <div className="bg-gray-800/50 p-2 rounded">
                                                    <span className="block text-[10px] text-gray-500 uppercase">{t('sampler')}</span>
                                                    <span className="font-medium text-gray-300 truncate block">{selectedFile.aigcMetaInfo.sampler || t('na')}</span>
                                                </div>
                                                <div className="bg-gray-800/50 p-2 rounded">
                                                    <span className="block text-[10px] text-gray-500 uppercase">{t('steps')}</span>
                                                    <span className="font-medium text-gray-300 block">{selectedFile.aigcMetaInfo.steps || t('na')}</span>
                                                </div>
                                                <div className="bg-gray-800/50 p-2 rounded">
                                                    <span className="block text-[10px] text-gray-500 uppercase">{t('seed')}</span>
                                                    <span className="font-mono text-gray-300 block truncate" title={selectedFile.aigcMetaInfo.seed}>{selectedFile.aigcMetaInfo.seed || t('na')}</span>
                                                </div>
                                                <div className="bg-gray-800/50 p-2 rounded">
                                                    <span className="block text-[10px] text-gray-500 uppercase">{t('cfg')}</span>
                                                    <span className="font-medium text-gray-300 block">{selectedFile.aigcMetaInfo.cfgScale || t('na')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 opacity-50">
                                        <p className="text-sm">{t('no_meta_found')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsOpen && (
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

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {tagPool.map(tag => (
                                            <div key={tag.id} className="group relative">
                                                <div
                                                    className="px-3 py-1.5 rounded-full border border-gray-700 bg-gray-800/30 text-xs font-medium flex items-center gap-2"
                                                    style={tag.color ? { borderColor: `${tag.color}55`, color: tag.color } : {}}
                                                >
                                                    {tag.name}
                                                    <span className="text-[10px] opacity-40 uppercase">{tag.type}</span>
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
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

