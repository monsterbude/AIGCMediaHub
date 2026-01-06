'use client'

import React from 'react'
import { useAppLogic } from '@/hooks/useAppLogic'
import Lightbox from '@/components/Lightbox'
import SettingsModal from '@/components/SettingsModal'
import Sidebar from '@/components/Sidebar'
import Gallery from '@/components/Gallery'

export default function Home() {
    const {
        path, setPath, filteredFiles, logs, setLogs, loading, scanning,
        selectedFile, setSelectedFile, zoom, pan, isDragging,
        searchQuery, setSearchQuery, sortOrder, setSortOrder, folders,
        selectedFolder, setSelectedFolder, expandedFolders,
        allTags, selectedTags, setSelectedTags, isFiltersOpen, setIsFiltersOpen,
        isExpandedFilters, setIsExpandedFilters, showOnlyFavorites, setShowOnlyFavorites,
        viewMode, setViewMode, cardScale, setCardScale, lang, hoveredFileId, setHoveredFileId,
        isSettingsOpen, setIsSettingsOpen, importedPaths, tagPool, systemSettings, setSystemSettings,
        newTagName, setNewTagName, t, changeLanguage, onProgress, logsContainerRef,
        handleScan, abortScan, toggleTag, buildFolderTree, toggleFolder, expandAll, collapseAll,
        handleNext, handlePrev, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
        copyToClipboard, toggleFavorite, formatFileSize, getTagStyle, removePath, addTagToPool,
        deleteTagFromPool, saveSetting, handleAITagging, handleAITagFolder
    } = useAppLogic()

    return (
        <div className="flex h-screen bg-[#0e0e0e] text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
            {/* SIDEBAR */}
            <Sidebar
                t={t}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                scanning={scanning}
                path={path}
                setPath={setPath}
                handleScan={handleScan}
                abortScan={abortScan}
                logs={logs}
                setLogs={setLogs}
                logsContainerRef={logsContainerRef}
                folders={folders}
                expandAll={expandAll}
                collapseAll={collapseAll}
                selectedFolder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                buildFolderTree={buildFolderTree}
                isFiltersOpen={isFiltersOpen}
                setIsFiltersOpen={setIsFiltersOpen}
                showOnlyFavorites={showOnlyFavorites}
                setShowOnlyFavorites={setShowOnlyFavorites}
                isExpandedFilters={isExpandedFilters}
                setIsExpandedFilters={setIsExpandedFilters}
                allTags={allTags}
                toggleTag={toggleTag}
                selectedTags={selectedTags}
                getTagStyle={getTagStyle}
                lang={lang}
                changeLanguage={changeLanguage}
                handleAITagFolder={handleAITagFolder}
            />

            {/* MAIN CONTENT */}
            <Gallery
                t={t}
                filteredFiles={filteredFiles}
                loading={loading}
                viewMode={viewMode}
                setViewMode={setViewMode}
                cardScale={cardScale}
                setCardScale={setCardScale}
                copyToClipboard={copyToClipboard}
                onProgress={onProgress}
                setIsSettingsOpen={setIsSettingsOpen}
                handleScan={handleScan}
                path={path}
                setSelectedFile={setSelectedFile}
                hoveredFileId={hoveredFileId}
                setHoveredFileId={setHoveredFileId}
                pan={pan}
                zoom={zoom}
                isDragging={isDragging}
                toggleFavorite={toggleFavorite}
                formatFileSize={formatFileSize}
                getTagStyle={getTagStyle}
                handleAITagging={handleAITagging}
            />
            <Lightbox
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                filteredFiles={filteredFiles}
                t={t}
                handlePrev={handlePrev}
                handleNext={handleNext}
                handleWheel={handleWheel}
                handleMouseUp={handleMouseUp}
                handleMouseDown={handleMouseDown}
                handleMouseMove={handleMouseMove}
                pan={pan}
                zoom={zoom}
                isDragging={isDragging}
                toggleFavorite={toggleFavorite}
                formatFileSize={formatFileSize}
                copyToClipboard={copyToClipboard}
                onProgress={onProgress}
                getTagStyle={getTagStyle}
                handleAITagging={handleAITagging}
            />

            <SettingsModal
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                t={t}
                importedPaths={importedPaths}
                setPath={setPath}
                handleScan={handleScan}
                removePath={removePath}
                systemSettings={systemSettings}
                setSystemSettings={setSystemSettings}
                saveSetting={saveSetting}
                tagPool={tagPool}
                newTagName={newTagName}
                setNewTagName={setNewTagName}
                addTagToPool={addTagToPool}
                deleteTagFromPool={deleteTagFromPool}
            />
        </div>
    )
}

