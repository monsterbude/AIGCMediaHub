-- CreateTable
CREATE TABLE "file_meta_info" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "file_path" TEXT NOT NULL,
    "parent_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "file_hash" TEXT,
    "mime_type" TEXT,
    "file_type" TEXT,
    "file_ext" TEXT,
    "created_time" DATETIME NOT NULL,
    "modified_time" DATETIME NOT NULL,
    "last_scanned" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "thumbnail_path" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "aigc_meta_info" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "file_meta_info_id" INTEGER NOT NULL,
    "source_tool" TEXT,
    "model_name" TEXT,
    "model_hash" TEXT,
    "prompt" TEXT,
    "negative_prompt" TEXT,
    "steps" INTEGER,
    "sampler" TEXT,
    "cfg_scale" REAL,
    "seed" BIGINT,
    "width" INTEGER,
    "height" INTEGER,
    "batch_index" INTEGER,
    "batch_size" INTEGER,
    "generated_time" DATETIME,
    "workflow_json" TEXT,
    "raw_parameters" TEXT,
    "extra_info" TEXT,
    CONSTRAINT "aigc_meta_info_file_meta_info_id_fkey" FOREIGN KEY ("file_meta_info_id") REFERENCES "file_meta_info" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "color" TEXT,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "file_tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "file_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "source" TEXT,
    "added_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "file_tags_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_meta_info" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "file_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "file_meta_info_file_path_key" ON "file_meta_info"("file_path");

-- CreateIndex
CREATE INDEX "file_meta_info_parent_path_idx" ON "file_meta_info"("parent_path");

-- CreateIndex
CREATE INDEX "file_meta_info_file_hash_idx" ON "file_meta_info"("file_hash");

-- CreateIndex
CREATE INDEX "file_meta_info_modified_time_idx" ON "file_meta_info"("modified_time");

-- CreateIndex
CREATE UNIQUE INDEX "aigc_meta_info_file_meta_info_id_key" ON "aigc_meta_info"("file_meta_info_id");

-- CreateIndex
CREATE INDEX "aigc_meta_info_model_name_idx" ON "aigc_meta_info"("model_name");

-- CreateIndex
CREATE INDEX "aigc_meta_info_seed_idx" ON "aigc_meta_info"("seed");

-- CreateIndex
CREATE INDEX "aigc_meta_info_generated_time_idx" ON "aigc_meta_info"("generated_time");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_type_idx" ON "tags"("type");

-- CreateIndex
CREATE UNIQUE INDEX "file_tags_file_id_tag_id_key" ON "file_tags"("file_id", "tag_id");
