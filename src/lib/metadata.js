import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'
import exifr from 'exifr'

export async function parseAigcMetadata(filePath) {
    try {
        const ext = path.extname(filePath).toLowerCase().replace('.', '')
        
        // Skip metadata parsing for certain file types that exifr might not handle well
        if (['webp'].includes(ext)) {
            console.log(`[Metadata] Skipping metadata parsing for ${ext} file: ${filePath}`)
            // Return basic dimensions using sharp for webp files
            try {
                const image = sharp(filePath)
                const metadata = await image.metadata()
                return {
                    width: metadata.width,
                    height: metadata.height
                }
            } catch (sharpError) {
                console.warn(`[Metadata] Sharp failed for ${filePath}:`, sharpError.message)
                return null
            }
        }
        
        const buffer = await fs.readFile(filePath)

        // Try parsing with exifr
        const output = await exifr.parse(buffer, {
            tiff: true,
            xmp: true,
            icc: false,
            ifd0: true,
            exif: true,
            userComment: true,
            mergeOutput: true
        })

        // Handle case where exifr returns null/undefined
        if (!output) {
            return null
        }

        const result = {
            width: output.ExifImageWidth || output.PixelXDimension || output.width,
            height: output.ExifImageHeight || output.PixelYDimension || output.height,
        }

        // --- COMFYUI LOGIC ---
        let comfyWorkflow = null
        let comfyPrompt = null

        // 1. Check for standard 'workflow' or 'prompt' keys
        if (output.workflow) comfyWorkflow = output.workflow
        if (output.prompt) comfyPrompt = output.prompt

        // 2. Check UserComment for ComfyUI JSON
        if (!comfyWorkflow && output.UserComment) {
            let str = output.UserComment
            if (Buffer.isBuffer(str)) {
                str = str.toString('utf8').replace(/^UNICODE\x00/, '').replace(/^[^\x20-\x7E]+/, '')
            }
            try {
                const json = JSON.parse(str)
                if (json.nodes && json.links) {
                    comfyWorkflow = JSON.stringify(json)
                }
            } catch (e) { }
        }

        if (comfyPrompt || comfyWorkflow) {
            return { ...result, ...parseComfyUI(comfyPrompt, comfyWorkflow) }
        }

        // --- AUTOMATIC1111 LOGIC ---
        let parameters = ''
        if (output.parameters) {
            parameters = output.parameters
        } else if (output.UserComment) {
            if (Buffer.isBuffer(output.UserComment)) {
                const str = output.UserComment.toString('utf8')
                parameters = str.replace(/^UNICODE\x00/, '').replace(/^[^\x20-\x7E]+/, '')
            } else {
                parameters = output.UserComment
            }
        }

        if (parameters && parameters.includes('Steps:')) {
            return { ...result, ...parseAutomatic1111(parameters) }
        }

        // Even if no AIGC info, return dimensions
        return result.width && result.height ? result : null

    } catch (error) {
        console.error(`Metadata parsing error for ${filePath}:`, error)
        return null
    }
}

function parseComfyUI(promptJsonStr, workflowJsonStr) {
    const result = {
        sourceTool: 'comfyui',
        rawParameters: workflowJsonStr || promptJsonStr, // Prefer workflow for graph
        prompt: '',
        negativePrompt: '',
        steps: null,
        sampler: null,
        cfgScale: null,
        seed: null,
        width: null,
        height: null,
        modelName: null,
        modelHash: null
    }

    try {
        // We prefer 'prompt' (which is the execution graph) for exact values, 
        // but 'workflow' (UI graph) is easier to read for humans.
        // Let's try to parse 'workflow' because it contains node titles.

        // Actually, let's use a simpler heuristic on the 'workflow' JSON if available
        const graph = JSON.parse(workflowJsonStr || promptJsonStr)
        const nodes = graph.nodes || [] // workflow format
        // If it's prompt format, it's Object.values(graph)
        const nodeList = Array.isArray(nodes) ? nodes : Object.values(graph)

        // Find KSampler
        const kSampler = nodeList.find(n => n.type === 'KSampler' || n.type === 'KSamplerAdvanced')
        if (kSampler) {
            // In workflow format, values are in 'widgets\_values' (array) or 'inputs'
            // In prompt format, values are in 'inputs'

            // Normalize access
            const inputs = kSampler.inputs || {}
            const widgets = kSampler.widgets_values

            if (widgets && Array.isArray(widgets)) {
                // Workflow format typically: [seed, control_after_generate, steps, cfg, sampler_name, scheduler, denoise]
                // Add type checks to prevent conversion errors
                const seedValue = widgets[0]
                if (seedValue != null && (typeof seedValue === 'number' || !isNaN(seedValue))) {
                    result.seed = BigInt(seedValue)
                }
                const stepsValue = widgets[2]
                if (stepsValue != null && (typeof stepsValue === 'number' || !isNaN(stepsValue))) {
                    result.steps = parseInt(stepsValue)
                }
                const cfgValue = widgets[3]
                if (cfgValue != null && (typeof cfgValue === 'number' || !isNaN(cfgValue))) {
                    result.cfgScale = parseFloat(cfgValue)
                }
                const samplerValue = widgets[4]
                if (samplerValue != null) {
                    result.sampler = String(samplerValue)
                }
            } else {
                // Prompt format
                const seedValue = inputs.seed
                if (seedValue != null && (typeof seedValue === 'number' || !isNaN(seedValue))) {
                    result.seed = BigInt(seedValue || 0)
                }
                const stepsValue = inputs.steps
                if (stepsValue != null && (typeof stepsValue === 'number' || !isNaN(stepsValue))) {
                    result.steps = parseInt(stepsValue)
                }
                const cfgValue = inputs.cfg
                if (cfgValue != null && (typeof cfgValue === 'number' || !isNaN(cfgValue))) {
                    result.cfgScale = parseFloat(cfgValue)
                }
                const samplerValue = inputs.sampler_name
                if (samplerValue != null) {
                    result.sampler = String(samplerValue)
                }
            }
        }

        // Find Checkpoint
        const checkpoint = nodeList.find(n => n.type === 'CheckpointLoaderSimple' || n.type === 'CheckpointLoader')
        if (checkpoint) {
            const widgets = checkpoint.widgets_values
            const inputs = checkpoint.inputs
            if (widgets) {
                result.modelName = widgets[0]
            } else if (inputs) {
                result.modelName = inputs.ckpt_name
            }
        }

        // Find Prompts (Text Encode)
        // Heuristic: Positive usually linked to KSampler 'positive', Negative to 'negative'
        // This is hard without traversing links. 
        // Simple fallback: Find CLIPTextEncode nodes. usually first is pos, second neg? Unreliable.
        // Let's just find all text and join them?

        const textNodes = nodeList.filter(n => n.type === 'CLIPTextEncode')
        if (textNodes.length > 0) {
            // Try to guess based on text content maybe? or just take the first two
            const texts = textNodes.map(n => {
                return n.widgets_values ? n.widgets_values[0] : (n.inputs ? n.inputs.text : '')
            })

            // Naive assignment
            result.prompt = texts[0] || ''
            if (texts.length > 1) result.negativePrompt = texts[1]
        }

        // Find LoRAs
        const loraNodes = nodeList.filter(n => n.type === 'LoraLoader' || n.type === 'LoraLoaderModelOnly')
        const loras = loraNodes.map(n => {
            return n.widgets_values ? n.widgets_values[0] : (n.inputs ? n.inputs.lora_name : '')
        }).filter(Boolean)
        result.loras = [...new Set(loras)]

    } catch (e) {
        console.error('Error parsing ComfyUI JSON', e)
    }

    return result
}

function parseAutomatic1111(parameters) {
    const result = {
        sourceTool: 'stable-diffusion-webui',
        rawParameters: parameters,
        prompt: '',
        negativePrompt: '',
        steps: null,
        sampler: null,
        cfgScale: null,
        seed: null,
        width: null,
        height: null,
        modelName: null,
        modelHash: null
    }

    // Split on "Negative prompt:" to get positive
    const negSplit = parameters.split('Negative prompt:')
    if (negSplit.length > 1) {
        result.prompt = negSplit[0].trim()
        const afterNeg = negSplit[1]
        // Split on "Steps:" to get negative
        const stepsSplit = afterNeg.split(/Steps:\s*/)
        result.negativePrompt = stepsSplit[0].trim()

        if (stepsSplit.length > 1) {
            parseTechnicalParams(stepsSplit[1], result)
        }
    } else {
        // Maybe no negative prompt, check for Steps directly
        const stepsSplit = parameters.split(/Steps:\s*/)
        result.prompt = stepsSplit[0].trim()
        if (stepsSplit.length > 1) {
            parseTechnicalParams(stepsSplit[1], result)
        }
    }

    return result
}

function parseTechnicalParams(paramsStr, result) {
    const kvRegex = /([a-zA-Z0-9\s]+):\s*([^,]+)/g

    const firstComma = paramsStr.indexOf(',')
    if (firstComma !== -1) {
        const stepsValue = paramsStr.substring(0, firstComma)
        if (stepsValue != null && !isNaN(stepsValue)) {
            result.steps = parseInt(stepsValue)
        }
    } else {
        if (paramsStr != null && !isNaN(paramsStr)) {
            result.steps = parseInt(paramsStr)
        }
    }

    let match
    while ((match = kvRegex.exec(paramsStr)) !== null) {
        const key = match[1].trim()
        const value = match[2].trim()

        switch (key) {
            case 'Sampler': result.sampler = value; break;
            case 'CFG scale': 
                if (value != null && !isNaN(value)) {
                    result.cfgScale = parseFloat(value)
                }
                break;
            case 'Seed': 
                if (value != null && !isNaN(value)) {
                    result.seed = BigInt(value)
                }
                break;
            case 'Size':
                const [w, h] = value.split('x').map(Number);
                if (w != null && h != null && !isNaN(w) && !isNaN(h)) {
                    result.width = w;
                    result.height = h;
                }
                break;
            case 'Model hash': result.modelHash = value; break;
            case 'Model': result.modelName = value; break;
        }
    }

    // Extract LoRAs from prompt
    const loraRegex = /<lora:([^:]+):[^>]+>/g
    const loras = []
    let loraMatch
    while ((loraMatch = loraRegex.exec(result.prompt)) !== null) {
        loras.push(loraMatch[1])
    }
    result.loras = [...new Set(loras)]
}
