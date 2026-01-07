import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import prisma from "./prisma";
import { getSetting } from "./settings";
import { updateMultipleTagCounts } from "./tagCountUtils.js";

// Plugin detection
const PLUGIN_DIR = path.join(process.cwd(), "plugins", "ai-tagger");
const MODEL_PATH = path.join(PLUGIN_DIR, "model.onnx");
const LABELS_PATH = path.join(PLUGIN_DIR, "selected_tags.csv");

let ort = null;
let session = null;
let labels = [];
let isPluginAvailable = false;

/**
 * Initialize the AI tagger plugin
 */
async function initPlugin() {
  try {
    // Check if model files exist
    if (
      !(await fs.pathExists(MODEL_PATH)) ||
      !(await fs.pathExists(LABELS_PATH))
    ) {
      console.log(
        "[AI Tagger] Plugin not detected. Model files not found in plugins/ai-tagger/"
      );
      isPluginAvailable = false;
      return false;
    }

    // Dynamically import onnxruntime-node
    ort = await import("onnxruntime-node");

    // Load ONNX model
  session = await ort.InferenceSession.create(MODEL_PATH, {
    executionProviders: ["cpu"], // Default to CPU, can be extended to GPU
  });

  // Print model input and output information for debugging
  console.log("[AI Tagger] Model input information:");
  session.inputNames.forEach(name => {
    console.log(`[AI Tagger] Input: ${name}`);
  });
  console.log("[AI Tagger] Model output information:");
  session.outputNames.forEach(name => {
    console.log(`[AI Tagger] Output: ${name}`);
  });

    // Load labels from CSV
    const csvContent = await fs.readFile(LABELS_PATH, "utf-8");
    labels = csvContent
      .split("\n")
      .filter((line) => line.trim())
      .slice(1) // Skip header line
      .map((line) => {
        const parts = line.split(",");
        // Get the name from the second column, or fallback to first column
        const tagName = parts[1] ? parts[1].trim() : parts[0].trim();
        // Filter out invalid tags
        return tagName && tagName !== "name" ? tagName : null;
      })
      .filter((tag) => tag !== null); // Remove null entries

    console.log(`[AI Tagger] Loaded ${labels.length} labels`);
    // Debug: Log labels around monochrome and greyscale indices
    console.log(`[AI Tagger] Labels at indices 59-62:`, labels.slice(59, 63));
    console.log(`[AI Tagger] Labels at indices 80-84:`, labels.slice(80, 85));

    isPluginAvailable = true;
    console.log(
      `[AI Tagger] Plugin loaded successfully. ${labels.length} labels available.`
    );
    // Debug: Log first 10 labels to check order
    console.log(`[AI Tagger] First 10 labels:`, labels.slice(0, 10));
    return true;
  } catch (error) {
    console.error("[AI Tagger] Failed to initialize plugin:", error);
    isPluginAvailable = false;
    return false;
  }
}

/**
 * Check if AI tagging is enabled and plugin is available
 */
export async function isAITaggerEnabled() {
  const enabled = await getSetting("ai_tagger_enabled", "false");
  if (enabled !== "true") {
    return false;
  }
  // Initialize plugin if not already done
  if (!isPluginAvailable) {
    await initPlugin();
  }
  return isPluginAvailable;
}

/**
 * Get plugin status
 */
export async function getPluginStatus() {
  if (!isPluginAvailable) {
    await initPlugin();
  }
  return {
    available: isPluginAvailable,
    modelPath: MODEL_PATH,
    labelsCount: labels.length,
  };
}

/**
 * 核心预处理：0-255 量程 + BGR 顺序 + NHWC 布局
 */
async function preprocessImage(imagePath) {
  try {
    const targetSize = 448;
    const { data, info } = await sharp(imagePath)
      .resize(targetSize, targetSize, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .removeAlpha()
      .toColourspace('srgb')
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    console.log(`[AI Tagger] Preprocessing image: ${imagePath}, width: ${width}, height: ${height}, channels: ${channels}`);

    // Check if data is valid
    if (!data || data.length === 0) {
      throw new Error('Empty image data');
    }

    // Debug: Log first few pixels of raw data
    console.log(`[AI Tagger] First 10 raw pixels:`, Array.from(data.slice(0, 30)));

    const imageSize = targetSize * targetSize;
    const floatData = new Float32Array(imageSize * 3);

    // WD14 特性：不除以 255，使用 BGR 顺序
    for (let i = 0; i < imageSize; i++) {
      floatData[i * 3]     = data[i * 3 + 2]; // B
      floatData[i * 3 + 1] = data[i * 3 + 1]; // G
      floatData[i * 3 + 2] = data[i * 3];     // R
    }

    // Debug: Log first few processed pixels
    console.log(`[AI Tagger] First 10 processed pixels (BGR):`, floatData.slice(0, 30));

    return new ort.Tensor("float32", floatData, [1, targetSize, targetSize, 3]);
  } catch (error) {
    console.error("[AI Tagger] Image preprocessing failed:", error);
    throw error;
  }
}

/**
 * 图像打标
 * @param {number} fileId - Database file ID
 * @returns {Promise<string[]>} Array of detected tags
 */
export async function tagImage(fileId) {
  try {
    // Check if plugin is enabled
    if (!(await isAITaggerEnabled())) {
      return [];
    }

    // Initialize plugin if not already done
    if (!session) {
      const initialized = await initPlugin();
      if (!initialized) return [];
    }

    // Get file info from database
    const file = await prisma.fileMetaInfo.findUnique({
      where: { id: fileId },
      select: { filePath: true, thumbnailPath: true },
    });

    if (!file) {
      console.error("[AI Tagger] File not found:", fileId);
      return [];
    }

    // Force using original image for better quality
    const imagePath = file.filePath;

    console.log(
      `[AI Tagger] Processing ${imagePath} (using original image)`
    );
    
    // Debug: Check if file exists
    const fileExists = await fs.pathExists(imagePath);
    console.log(`[AI Tagger] File exists: ${fileExists}`);
    if (fileExists) {
      const stats = await fs.stat(imagePath);
      console.log(`[AI Tagger] File size: ${stats.size} bytes`);
    }

    // Preprocess image
    const inputTensor = await preprocessImage(imagePath);

    // Run inference
    let results;
    try {
        if (session.inputNames && session.inputNames.length > 0) {
            const inputName = session.inputNames[0];
            console.log(`[AI Tagger] Using model input name: ${inputName}`);
            console.log(`[AI Tagger] Processing file: ${fileId}, image path: ${imagePath}`);
            results = await session.run({ [inputName]: inputTensor });
            
            // Debug: Log model output information
            console.log(`[AI Tagger] Model output keys:`, Object.keys(results));
            const outputKey = Object.keys(results)[0];
            const output = results[outputKey];
            console.log(`[AI Tagger] Output shape:`, output.dims);
            console.log(`[AI Tagger] Output type:`, output.type);
            console.log(`[AI Tagger] First 10 output values:`, output.data.slice(0, 10));
        } else {
            throw new Error('Model has no input names');
        }
    } catch (e) {
        console.error(`[AI Tagger] Model inference failed:`, e);
        throw new Error(`Failed to run model inference: ${e.message}`);
    }
    const output = results[session.outputNames[0]];
    const scores = output.data;

    // 使用更合理的阈值
    const threshold = 0.35;

    console.log(`[AI Tagger] Using threshold: ${threshold}`);

    // Filter tags by threshold
    const detectedTags = [];
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i]; // 直接使用原始分值
      if (i < labels.length && score > threshold) {
        detectedTags.push({
          name: labels[i],
          confidence: score
        });
      }
    }

    // Sort by confidence
    detectedTags.sort((a, b) => b.confidence - a.confidence);

    console.log(
      `[AI Tagger] Detected ${detectedTags.length} tags for file ${fileId}`
    );
    console.log(`[AI Tagger] Top 15 tags:`);
    detectedTags.slice(0, 15).forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.name}: ${tag.confidence.toFixed(4)}`);
    });

    // Save tags to database
    await saveAITags(
      fileId,
      detectedTags
    );

    return detectedTags.map((t) => t.name);
  } catch (error) {
    console.error("[AI Tagger] Tagging failed:", error);
    return [];
  }
}

/**
 * Save AI-generated tags to database
 */
async function saveAITags(fileId, tags) {
  const tagIdsToUpdate = new Set();

  try {
    // Remove all existing AI tags for this file first
    const existingTags = await prisma.fileTag.findMany({
      where: {
        fileId: fileId,
        source: "ai",
      },
      select: { tagId: true }
    });

    if (existingTags.length > 0) {
      await prisma.fileTag.deleteMany({
        where: {
          fileId: fileId,
          source: "ai",
        },
      });
      console.log(`[AI Tagger] Removed existing AI tags for file ${fileId}`);

      // Add existing tag IDs to update list
      existingTags.forEach(ft => tagIdsToUpdate.add(ft.tagId));
    }
  } catch (e) {
    console.error("[AI Tagger] Error removing existing AI tags:", e);
  }

  for (const tag of tags) {
    try {
      // Create or find tag
      const tagObj = await prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: {
          name: tag.name,
          type: "ai",
          color: "#10b981", // Green for AI tags
        },
      });

      // Link to file with confidence as weight
      await prisma.fileTag.create({
        data: {
          fileId: fileId,
          tagId: tagObj.id,
          source: "ai",
          weight: tag.confidence,
        },
      });

      // Add new tag ID to update list
      tagIdsToUpdate.add(tagObj.id);
    } catch (e) {
      console.error("[AI Tagger] Error saving tag:", tag.name, e);
    }
  }

  // Update tag counts for all affected tags
  if (tagIdsToUpdate.size > 0) {
    try {
      await updateMultipleTagCounts(Array.from(tagIdsToUpdate));
      console.log(`[AI Tagger] Updated counts for ${tagIdsToUpdate.size} tags`);
    } catch (e) {
      console.error("[AI Tagger] Error updating tag counts:", e);
    }
  }
}
