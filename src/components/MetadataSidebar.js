import React, { useState } from 'react'
import { StarIcon } from './Icons'
import { isValidJSON, formatJSON } from '@/lib/utils'

export default function MetadataSidebar({
    selectedFile,
    t,
    toggleFavorite,
    setSelectedFile,
    formatFileSize,
    copyToClipboard,
    onProgress,
    getTagStyle,
    handleAITagging,
    isHidden = false
}) {
    const [showRawData, setShowRawData] = useState(false)

    if (!selectedFile || isHidden) return null

    return (
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
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input type="text" placeholder={t('add_tag_placeholder')} disabled className="w-full bg-[#111] border border-gray-700 rounded px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
                            <span className="absolute right-3 top-2.5 text-gray-600"><StarIcon /></span>
                        </div>
                        <button
                            onClick={() => handleAITagging(selectedFile.id)}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm font-bold transition-all shadow-lg flex items-center gap-1.5"
                            title={t('ai_tag_this_file')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {t('ai_tag_file')}
                        </button>
                    </div>

                    {selectedFile.tags && selectedFile.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedFile.tags.map(tag => {
                                // Get tag data from either direct property or nested tag object
                                const tagData = tag.tag || tag;
                                const tagName = tagData.name || '';
                                const isAITag = tagData.type === 'ai' || tagData.source === 'ai';
                                return (
                                    <span
                                        key={tag.id || tagData.id}
                                        className="px-2 py-0.5 rounded text-[10px] border transition-colors flex items-center gap-1"
                                        style={getTagStyle(tagData)}
                                    >
                                        {tagName}
                                        {isAITag && (
                                            <span className="text-[8px] bg-green-500/20 text-green-400 px-1 rounded font-bold">
                                                {t('ai_tag_indicator')}
                                            </span>
                                        )}
                                    </span>
                                )
                            })}
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

                        {/* Raw Data Section */}
                        {selectedFile.aigcMetaInfo.rawParameters && (
                            <div className="border-t border-gray-800 pt-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer hover:bg-gray-800/30 p-2 rounded transition-colors"
                                    onClick={() => setShowRawData(!showRawData)}
                                >
                                    <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2">
                                        {t('raw_data')}
                                        <svg
                                            className={`w-3 h-3 transition-transform ${showRawData ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </h5>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            copyToClipboard(selectedFile.aigcMetaInfo.rawParameters)
                                            onProgress(`\n${t('raw_data_copied')}`)
                                        }}
                                        className="text-[10px] text-blue-500 hover:text-blue-400"
                                    >
                                        {t('copy_raw_data')}
                                    </button>
                                </div>

                                {showRawData && (
                                    <div className="mt-2 p-3 bg-[#0a0a0a] rounded border border-gray-800 max-h-96 overflow-y-auto custom-scrollbar">
                                        <pre className="text-[10px] text-gray-300 leading-relaxed font-mono whitespace-pre-wrap break-all select-text selection:bg-blue-900/50">
                                            {isValidJSON(selectedFile.aigcMetaInfo.rawParameters)
                                                ? formatJSON(selectedFile.aigcMetaInfo.rawParameters)
                                                : selectedFile.aigcMetaInfo.rawParameters
                                            }
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 opacity-50">
                        <p className="text-sm">{t('no_meta_found')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
