const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const PLUGIN_DIR = path.join(process.cwd(), "plugins", "ai-tagger");
const MODEL_PATH = path.join(PLUGIN_DIR, "model.onnx");
const LABELS_PATH = path.join(PLUGIN_DIR, "selected_tags.csv");

let ort = null;
let session = null;
let labels = [];

/**
 * 初始化模型和标签
 */
async function initPlugin() {
    try {
        if (!(await fs.pathExists(MODEL_PATH)) || !(await fs.pathExists(LABELS_PATH))) {
            console.error("[AI Tagger] 找不到模型或标签文件。");
            return false;
        }

        ort = await import("onnxruntime-node");
        session = await ort.InferenceSession.create(MODEL_PATH, { executionProviders: ["cpu"] });

        // 加载标签 CSV
        const csvContent = await fs.readFile(LABELS_PATH, "utf-8");
        labels = csvContent
            .split("\n")
            .filter((line) => line.trim())
            .slice(1) // 跳过表头
            .map((line) => {
                const parts = line.split(",");
                return parts[1] ? parts[1].trim() : parts[0].trim();
            });

        console.log(`[AI Tagger] 插件初始化成功，加载了 ${labels.length} 个标签。`);
        return true;
    } catch (error) {
        console.error("[AI Tagger] 初始化失败:", error);
        return false;
    }
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

        const imageSize = targetSize * targetSize;
        const floatData = new Float32Array(imageSize * 3);

        // WD14 特性：不除以 255，使用 BGR 顺序
        for (let i = 0; i < imageSize; i++) {
            floatData[i * 3]     = data[i * 3 + 2]; // B
            floatData[i * 3 + 1] = data[i * 3 + 1]; // G
            floatData[i * 3 + 2] = data[i * 3];     // R
        }

        return new ort.Tensor("float32", floatData, [1, targetSize, targetSize, 3]);
    } catch (error) {
        console.error("[AI Tagger] 预处理失败:", error);
        throw error;
    }
}

/**
 * 图像打标
 */
async function tagImage(imagePath, threshold = 0.35) {
    try {
        if (!session) await initPlugin();

        const inputTensor = await preprocessImage(imagePath);
        const results = await session.run({ [session.inputNames[0]]: inputTensor });
        const output = results[session.outputNames[0]];
        const scores = output.data;

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

        return detectedTags.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
        console.error("[AI Tagger] 打标失败:", error);
        return [];
    }
}

/**
 * 执行测试
 */
async function main() {
    const testImages = ["y:/bit-block/AIGC开源站点/A/9517243.png"];
    
    if (!(await initPlugin())) return;

    for (const imgPath of testImages) {
        console.log(`\n>>> 正在处理: ${path.basename(imgPath)}`);
        const tags = await tagImage(imgPath);
        
        if (tags.length === 0) {
            console.log("未发现匹配标签。");
        } else {
            tags.slice(0, 15).forEach((t, i) => {
                console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${t.name.padEnd(20)} (${(t.confidence * 100).toFixed(2)}%)`);
            });
        }
    }
}

main().catch(console.error);