import React, { useState, useEffect } from 'react'
import MetadataSidebar from './MetadataSidebar'

export default function Lightbox({
    selectedFile,
    setSelectedFile,
    filteredFiles,
    t,
    handlePrev,
    handleNext,
    handleWheel,
    handleMouseUp,
    handleMouseDown,
    handleMouseMove,
    pan,
    zoom,
    isDragging,
    toggleFavorite,
    formatFileSize,
    copyToClipboard,
    onProgress,
    getTagStyle,
    handleAITagging
}) {
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFullscreen])

    if (!selectedFile) return null

    return (
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
                        <button
                            className="text-white hover:text-gray-300 p-2 bg-black/30 hover:bg-black/50 rounded transition-colors flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFullscreen(!isFullscreen);
                            }}
                        >
                            {isFullscreen ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-xs">{t('exit_fullscreen')}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                    <span className="text-xs">{t('fullscreen')}</span>
                                </>
                            )}
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

                <MetadataSidebar
                    selectedFile={selectedFile}
                    t={t}
                    toggleFavorite={toggleFavorite}
                    setSelectedFile={setSelectedFile}
                    formatFileSize={formatFileSize}
                    copyToClipboard={copyToClipboard}
                    onProgress={onProgress}
                    getTagStyle={getTagStyle}
                    handleAITagging={handleAITagging}
                    isHidden={isFullscreen}
                />
            </div>
        </div>
    )
}
