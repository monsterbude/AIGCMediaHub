import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import prisma from "./prisma";
import { getSetting } from "./settings";

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

    // Load labels from CSV
    const csvContent = await fs.readFile(LABELS_PATH, "utf-8");
    labels = csvContent
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split(",");
        return parts[1] ? parts[1].trim() : parts[0].trim();
      });

    isPluginAvailable = true;
    console.log(
      `[AI Tagger] Plugin loaded successfully. ${labels.length} labels available.`
    );
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
  return enabled === "true" && isPluginAvailable;
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
 * Preprocess image for model input
 */
async function preprocessImage(imagePath) {
  try {
    // Resize to 448x448 and normalize
    const buffer = await sharp(imagePath)
      .resize(448, 448, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = buffer;
    const { width, height, channels } = info;

    // Normalize to [0, 1] and convert to Float32Array
    const float32Data = new Float32Array(width * height * channels);
    for (let i = 0; i < data.length; i++) {
      float32Data[i] = data[i] / 255.0;
    }

    // Reshape to [1, 3, 448, 448] (NCHW format)
    const rgbData = new Float32Array(1 * 3 * height * width);
    for (let c = 0; c < 3; c++) {
      for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
          const srcIdx = (h * width + w) * channels + c;
          const dstIdx = c * (height * width) + h * width + w;
          rgbData[dstIdx] = float32Data[srcIdx];
        }
      }
    }

    return new ort.Tensor("float32", rgbData, [1, 3, height, width]);
  } catch (error) {
    console.error("[AI Tagger] Image preprocessing failed:", error);
    throw error;
  }
}

/**
 * Tag an image using AI model
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

    // Prioritize thumbnail if available
    const imagePath =
      file.thumbnailPath && (await fs.pathExists(file.thumbnailPath))
        ? file.thumbnailPath
        : file.filePath;

    console.log(
      `[AI Tagger] Processing ${imagePath} (using ${
        file.thumbnailPath ? "thumbnail" : "original"
      })`
    );

    // Preprocess image
    const inputTensor = await preprocessImage(imagePath);

    // Run inference
    const feeds = { input: inputTensor };
    const results = await session.run(feeds);
    const output = results[Object.keys(results)[0]];

    // Get threshold from settings
    const threshold = parseFloat(
      await getSetting("ai_tagger_threshold", "0.35")
    );

    // Filter tags by threshold
    const detectedTags = [];
    for (let i = 0; i < output.data.length; i++) {
      if (output.data[i] > threshold && labels[i]) {
        detectedTags.push({
          name: labels[i],
          confidence: output.data[i],
        });
      }
    }

    // Sort by confidence
    detectedTags.sort((a, b) => b.confidence - a.confidence);

    console.log(
      `[AI Tagger] Detected ${detectedTags.length} tags for file ${fileId}`
    );

    // Save tags to database
    await saveAITags(
      fileId,
      detectedTags.map((t) => t.name)
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
async function saveAITags(fileId, tagNames) {
  for (const tagName of tagNames) {
    try {
      // Create or find tag
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          type: "ai",
          color: "#10b981", // Green for AI tags
        },
      });

      // Link to file
      await prisma.fileTag.upsert({
        where: {
          fileId_tagId: {
            fileId: fileId,
            tagId: tag.id,
          },
        },
        update: { source: "ai" },
        create: {
          fileId: fileId,
          tagId: tag.id,
          source: "ai",
        },
      });
    } catch (e) {
      console.error("[AI Tagger] Error saving tag:", tagName, e);
    }
  }
}
