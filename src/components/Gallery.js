import React from "react";
import {
  GridIcon,
  ListIcon,
  CopyIcon,
  SettingsIcon,
  StarIcon,
  InfoIcon,
} from "./Icons";

export default function Gallery({
  t,
  filteredFiles,
  loading,
  viewMode,
  setViewMode,
  cardScale,
  setCardScale,
  copyToClipboard,
  onProgress,
  setIsSettingsOpen,
  handleScan,
  path,
  setSelectedFile,
  hoveredFileId,
  setHoveredFileId,
  pan,
  zoom,
  isDragging,
  toggleFavorite,
  formatFileSize,
  getTagStyle,
  handleAITagging,
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0e0e0e]">
      {/* Simple Top Bar (Status) */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111111] shrink-0">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded text-xs font-medium">
            {t("status_active")}
          </span>
          <span className="text-sm text-gray-500 font-medium">
            {t("library_items", { count: filteredFiles.length })}
          </span>
          {loading && (
            <span className="text-xs text-gray-400 animate-pulse">
              {t("loading")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* View Switcher */}
          <div className="flex bg-[#1a1a1a] border border-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title={t("grid_view")}
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title={t("list_view")}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Card Scale Slider (Grid View Only) */}
          {viewMode === "grid" && (
            <>
              <div className="w-px h-4 bg-gray-800" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  缩放
                </span>
                <input
                  type="range"
                  min="15"
                  max="200"
                  value={cardScale}
                  onChange={(e) => setCardScale(parseInt(e.target.value))}
                  className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  style={{
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${
                      (cardScale - 15) / 1.85
                    }%, #374151 ${(cardScale - 15) / 1.85}%, #374151 100%)`,
                  }}
                />
                <span className="text-xs text-gray-400 font-mono w-10 text-right">
                  {cardScale}%
                </span>
              </div>
            </>
          )}

          <div className="w-px h-4 bg-gray-800" />

          <button
            onClick={() => {
              const paths = filteredFiles.map((f) => f.filePath).join("\n");
              copyToClipboard(paths);
              onProgress(`\n${t("copied", { count: filteredFiles.length })}`);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-xs text-gray-300 transition-colors"
          >
            <CopyIcon className="w-3.5 h-3.5" /> {t("export_paths")}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-gray-400 transition-all hover:text-white"
            title={t("settings")}
          >
            <SettingsIcon />
          </button>

          <button
            onClick={() => handleScan(path, true)}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-blue-400 transition-all hover:rotate-180 duration-500"
            title={t("force_rescan")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {viewMode === "grid" ? (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(
                120,
                200 * (cardScale / 100)
              )}px, 1fr))`,
            }}
          >
            {filteredFiles.map((file) => (
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
                  {file.fileType === "image" || file.thumbnailPath ? (
                    <>
                      <img
                        src={
                          file.thumbnailPath ||
                          `/api/image?path=${encodeURIComponent(file.filePath)}`
                        }
                        alt={file.fileName}
                        style={{
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transition: isDragging
                            ? "none"
                            : "transform 0.1s ease-out",
                        }}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          hoveredFileId === file.id && file.fileType === "video"
                            ? "opacity-0"
                            : "opacity-100"
                        } group-hover:scale-105 animate-fade-in`}
                        loading="lazy"
                      />
                      {hoveredFileId === file.id &&
                        file.fileType === "video" && (
                          <video
                            src={`/api/image?path=${encodeURIComponent(
                              file.filePath
                            )}`}
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

                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#1a1a1a]/75 border-t border-gray-800/50 backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p
                      className="text-gray-100 text-sm font-semibold truncate drop-shadow-md"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-700/30">
                        {file.fileExt.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-300 font-medium">
                        {formatFileSize(file.fileSize)}
                      </span>
                    </div>
                    {file.tags && file.tags.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700/30 flex flex-wrap gap-1">
                        {file.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-[9px] px-1.5 py-0.5 rounded border"
                            style={getTagStyle(tag)}
                          >
                            {tag.name.slice(0, 3)}
                            {tag.name.length > 3 ? ".." : ""}
                          </span>
                        ))}
                        {file.tags.length > 3 && (
                          <span className="text-[9px] text-gray-400">...</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.fileType === "image" && (
                      <button
                        className="p-1.5 bg-green-600/80 hover:bg-green-500 text-white rounded-md backdrop-blur-sm shadow-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAITagging(file.id);
                        }}
                        title={t("ai_tag_file")}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      className={`p-1.5 rounded-md backdrop-blur-sm shadow-lg transition-colors ${
                        file.isFavorite
                          ? "bg-amber-500/80 text-white"
                          : "bg-black/40 hover:bg-black/60 text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(file);
                      }}
                    >
                      <StarIcon
                        className={`w-4 h-4 ${
                          file.isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button
                      className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-md backdrop-blur-sm shadow-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                      }}
                    >
                      <InfoIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#161616] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1a1a1a] text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">{t("preview")}</th>
                  <th className="px-6 py-4">{t("filename")}</th>
                  <th className="px-6 py-4">{t("metadata")}</th>
                  <th className="px-6 py-4">{t("tags")}</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredFiles.map((file) => (
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
                        {file.fileType === "image" || file.thumbnailPath ? (
                          <>
                            <img
                              src={
                                file.thumbnailPath ||
                                `/api/image?path=${encodeURIComponent(
                                  file.filePath
                                )}`
                              }
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                hoveredFileId === file.id &&
                                file.fileType === "video"
                                  ? "opacity-0"
                                  : "opacity-100"
                              }`}
                              loading="lazy"
                            />
                            {hoveredFileId === file.id &&
                              file.fileType === "video" && (
                                <video
                                  src={`/api/image?path=${encodeURIComponent(
                                    file.filePath
                                  )}`}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                />
                              )}
                          </>
                        ) : (
                          <span className="opacity-50">
                            {file.fileExt.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 max-w-xs md:max-w-md">
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-semibold text-gray-200 truncate cursor-pointer hover:text-blue-400 transition-colors"
                          title={file.fileName}
                          onClick={() => setSelectedFile(file)}
                        >
                          {file.fileName}
                        </span>
                        <span
                          className="text-[10px] text-gray-500 font-mono truncate mt-0.5 opacity-50 select-all"
                          title={file.filePath}
                        >
                          {file.filePath}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-blue-300 bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-700/30 font-bold uppercase">
                            {file.fileExt}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatFileSize(file.fileSize)}
                          </span>
                        </div>
                        {file.aigcMetaInfo?.modelName && (
                          <span
                            className="text-[10px] text-purple-400 font-medium truncate max-w-[120px]"
                            title={file.aigcMetaInfo.modelName}
                          >
                            {file.aigcMetaInfo.modelName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {file.tags?.slice(0, 5).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-[10px] px-2 py-0.5 rounded border transition-all"
                            style={getTagStyle(tag)}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {file.tags?.length > 5 && (
                          <span className="text-[10px] text-gray-500 font-bold">
                            +{file.tags.length - 5}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2 text-gray-400">
                        {file.fileType === "image" && (
                          <button
                            onClick={() => handleAITagging(file.id)}
                            className="p-1.5 rounded-lg hover:text-green-400 hover:bg-green-400/10 transition-all"
                            title={t("ai_tag_file")}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => toggleFavorite(file)}
                          className={`p-1.5 rounded-lg transition-all ${
                            file.isFavorite
                              ? "text-amber-500 bg-amber-500/10"
                              : "hover:text-amber-500 hover:bg-amber-500/10"
                          }`}
                          title={
                            file.isFavorite ? t("unfavorite") : t("favorite")
                          }
                        >
                          <StarIcon
                            className={`w-4 h-4 ${
                              file.isFavorite ? "fill-current" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            if (file.aigcMetaInfo?.prompt) {
                              copyToClipboard(file.aigcMetaInfo.prompt);
                              onProgress(`\n${t("prompt_copied")}`);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                          title={t("copy_prompt")}
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="p-1.5 rounded-lg hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                          title={t("view_details")}
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
            <svg
              className="w-16 h-16 mb-4 opacity-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium">{t("no_assets_found")}</p>
            <p className="text-sm opacity-60">
              {t("try_scanning_or_clearing_filters")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
