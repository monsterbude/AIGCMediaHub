import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { translations } from '@/lib/i18n'
import { buildFolderTree, formatFileSize, getTagStyle } from '@/lib/utils'

export function useAppLogic() {
    const [path, setPath] = useState('')
    const [files, setFiles] = useState([])
    const [filteredFiles, setFilteredFiles] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [scanCount, setScanCount] = useState(0)
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
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [cardScale, setCardScale] = useState(100) // Card scale percentage (15-200)
    const [lang, setLang] = useState('zh') // 'zh' | 'en'
    const [hoveredFileId, setHoveredFileId] = useState(null)
    
    // Extension Filter
    const [selectedExtensions, setSelectedExtensions] = useState(new Set())
    const [availableExtensions, setAvailableExtensions] = useState([])

    // Settings UI
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [importedPaths, setImportedPaths] = useState([])
    const [tagPool, setTagPool] = useState([])
    const [systemSettings, setSystemSettings] = useState({ cachePath: '.cache/thumbnails' })
    const [newTagName, setNewTagName] = useState('')

    const logsContainerRef = useRef(null)
    const eventSourceRef = useRef(null)
    const scanIntervalRef = useRef(null)

    // Translation helper
    const t = useMemo(() => (key, params = {}) => {
        let text = translations[lang]?.[key] || key
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p])
        })
        return text
    }, [lang])

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

    // Scroll logs to bottom
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
        }
    }, [logs])

    const fetchFiles = async (folderPath = null) => {
        setLoading(true)
        try {
            let url = folderPath
                ? `/api/files?limit=500&parentPath=${encodeURIComponent(folderPath)}`
                : '/api/files?limit=500'
            
            // Add extension filters if any
            if (selectedExtensions.size > 0) {
                const extensions = Array.from(selectedExtensions).join(',')
                url += `&extensions=${encodeURIComponent(extensions)}`
            }
            
            const res = await fetch(url)
            const json = await res.json()
            const data = json.data || []
            setFiles(data)
            
            // Extract available extensions from files
            const extensions = new Set()
            data.forEach(file => {
                if (file.fileExt) {
                    extensions.add(file.fileExt)
                }
            })
            setAvailableExtensions(Array.from(extensions))
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

    const fetchTagPool = useCallback(async (skip = 0, take = 500, append = false) => {
        try {
            const res = await fetch(`/api/tags/pool?skip=${skip}&take=${take}`)
            const data = await res.json()
            if (append) {
                setTagPool(prev => [...prev, ...data.tags])
            } else {
                setTagPool(data.tags)
            }
            return { tags: data.tags, total: data.total }
        } catch (e) { console.error(e) }
    }, [])

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
    }, [isSettingsOpen, fetchTagPool])

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

    useEffect(() => {
        fetchFiles(selectedFolder)
    }, [selectedFolder])

    // Fetch files when selected extensions change
    useEffect(() => {
        fetchFiles(selectedFolder)
    }, [selectedFolder, selectedExtensions])

    // Filter Logic
    useEffect(() => {
        let res = [...files]

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase()
            res = res.filter(f =>
                f.fileName.toLowerCase().includes(lowerQ) ||
                (f.aigcMetaInfo?.prompt && f.aigcMetaInfo.prompt.toLowerCase().includes(lowerQ)) ||
                (f.aigcMetaInfo?.modelName && f.aigcMetaInfo.modelName.toLowerCase().includes(lowerQ))
            )
        }

        if (sortOrder === 'newest') {
            res.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime))
        } else if (sortOrder === 'oldest') {
            res.sort((a, b) => new Date(a.modifiedTime) - new Date(b.modifiedTime))
        } else if (sortOrder === 'name-asc') {
            res.sort((a, b) => a.fileName.localeCompare(b.fileName))
        } else if (sortOrder === 'name-desc') {
            res.sort((a, b) => b.fileName.localeCompare(a.fileName))
        }

        if (selectedTags.size > 0) {
            res = res.filter(f => {
                const fileTagIds = new Set(f.tags?.map(t => t.id) || [])
                return Array.from(selectedTags).every(tid => fileTagIds.has(tid))
            })
        }

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

    const toggleFolder = (path) => {
        setExpandedFolders(prev => {
            const next = new Set(prev)
            if (next.has(path)) next.delete(path)
            else next.add(path)
            return next
        })
    }

    const expandAll = () => {
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

    const abortScan = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
            setScanning(false)
            onProgress(`\n> ${t('scan_aborted')}`)
        }
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current)
            scanIntervalRef.current = null
        }
    }

    useEffect(() => {
        if (scanning) {
            fetchFolders()
            scanIntervalRef.current = setInterval(() => {
                fetchFolders()
            }, 10000)
        } else {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current)
                scanIntervalRef.current = null
            }
        }
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
        setScanCount(0)

        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        const eventSource = new EventSource(`/api/scan/sse?path=${encodeURIComponent(scanPath)}&force=${force}`)
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'done' || data.type === 'aborted') {
                    eventSource.close()
                    eventSourceRef.current = null
                    setScanning(false)
                    fetchFiles()
                    fetchFolders()
                } else if (data.type === 'error') {
                    eventSource.close()
                    eventSourceRef.current = null
                    setScanning(false)
                } else {
                    setLogs(prev => [...prev.slice(-49), data])
                    // Update scan count for processing events (exclude skipped files)
                    if (data.type === 'processed' || data.type === 'scanning') {
                        setScanCount(prev => prev + 1)
                    }
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

    useEffect(() => {
        if (selectedFile) {
            setZoom(1)
            setPan({ x: 0, y: 0 })
        }
    }, [selectedFile])

    const handleWheel = (e) => {
        if (selectedFile?.fileType !== 'image') return
        e.stopPropagation()
        const scaleAmount = -e.deltaY * 0.002
        const newZoom = Math.max(1, Math.min(zoom + scaleAmount, 5))
        setZoom(newZoom)
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
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isFavorite: json.isFavorite } : f))
            }
        } catch (e) {
            console.error('Failed to toggle favorite:', e)
        }
    }

    const handleAITagging = async (fileId) => {
        try {
            onProgress(`\n> ${t('ai_tagging_in_progress')}`)
            const res = await fetch('/api/ai-tag-file', {
                method: 'POST',
                body: JSON.stringify({ fileId })
            })
            const json = await res.json()
            if (json.success) {
                // Update local state for the file
                setFiles(prev => prev.map(f => f.id === fileId ? { ...f, tags: json.file.tags } : f))
                if (selectedFile?.id === fileId) {
                    setSelectedFile(prev => ({ ...prev, tags: json.file.tags }))
                }
                onProgress(`\n> ${t('ai_tagging_complete')}`)
                fetchTags() // Refresh global tag list
            } else {
                onProgress(`\n> [Error] ${json.error}`)
            }
        } catch (e) {
            console.error('AI tagging failed:', e)
            onProgress(`\n> [Error] AI tagging failed: ${e.message}`)
        }
    }

    const handleAITagFolder = async (folderPath) => {
        try {
            onProgress(`\n> ${t('ai_tagging_in_progress')}: ${folderPath}`)
            const res = await fetch('/api/ai-tag-folder', {
                method: 'POST',
                body: JSON.stringify({ folderPath })
            })
            const json = await res.json()
            if (json.success) {
                onProgress(`\n> ${t('ai_tagging_complete')}: ${json.successCount} files tagged, ${json.failCount} failed.`)
                fetchFiles(selectedFolder)
                fetchTags()
            } else {
                onProgress(`\n> [Error] ${json.error}`)
            }
        } catch (e) {
            console.error('AI folder tagging failed:', e)
            onProgress(`\n> [Error] AI folder tagging failed: ${e.message}`)
        }
    }

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

    return {
        path, setPath, files, filteredFiles, logs, setLogs, loading, scanning, scanCount,
        selectedFile, setSelectedFile, zoom, setZoom, pan, setPan, isDragging,
        searchQuery, setSearchQuery, sortOrder, setSortOrder, folders,
        selectedFolder, setSelectedFolder, expandedFolders, setExpandedFolders,
        allTags, selectedTags, setSelectedTags, isFiltersOpen, setIsFiltersOpen,
        isExpandedFilters, setIsExpandedFilters, showOnlyFavorites, setShowOnlyFavorites,
        viewMode, setViewMode, cardScale, setCardScale, lang, setLang, hoveredFileId, setHoveredFileId,
        isSettingsOpen, setIsSettingsOpen, importedPaths, tagPool, systemSettings, setSystemSettings,
        newTagName, setNewTagName, t, changeLanguage, onProgress, logsContainerRef,
        handleScan, abortScan, toggleTag, buildFolderTree, toggleFolder, expandAll, collapseAll,
        handleNext, handlePrev, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
        copyToClipboard, toggleFavorite, formatFileSize, getTagStyle, removePath, addTagToPool,
        deleteTagFromPool, saveSetting, fetchTagPool, handleAITagging, handleAITagFolder,
        selectedExtensions, setSelectedExtensions, availableExtensions, setAvailableExtensions
    }
}
