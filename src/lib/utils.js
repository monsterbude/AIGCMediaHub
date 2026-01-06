/**
 * Helper to build recursive tree from flat paths
 */
export const buildFolderTree = (paths) => {
    const root = {}
    const folderSet = new Set(paths)

    paths.forEach(fullPath => {
        const parts = fullPath.split('\\')
        let current = root
        let currentPath = ''

        parts.forEach((part, index) => {
            currentPath = index === 0 ? part : currentPath + '\\' + part
            if (!current[part]) {
                current[part] = {
                    name: part,
                    fullPath: currentPath,
                    children: {}
                }
            }
            current = current[part].children
        })
    })

    const convertToArr = (node) => {
        return Object.values(node).map(item => {
            let current = item
            let nameParts = [item.name]

            // Look ahead in raw children (node based)
            while (Object.keys(current.children).length === 1 && !folderSet.has(current.fullPath)) {
                const childName = Object.keys(current.children)[0]
                const child = current.children[childName]
                nameParts.push(child.name)
                current = child
            }

            const children = convertToArr(current.children)

            let displayName = current.name
            let displayPrefix = ""

            if (nameParts.length > 1) {
                if (nameParts.length > 2) {
                    // C: > ... > AIGC format
                    displayPrefix = `${nameParts[0]} \u00A0\u203A\u00A0 ... \u00A0\u203A\u00A0 `
                    displayName = nameParts[nameParts.length - 1]
                } else {
                    // C: > Users format
                    displayPrefix = `${nameParts[0]} \u00A0\u203A\u00A0 `
                    displayName = nameParts[1]
                }
            }

            return {
                ...current,
                name: displayName,
                displayPrefix,
                children
            }
        }).sort((a, b) => a.name.localeCompare(b.name))
    }

    return convertToArr(root)
}

/**
 * Format file size in bytes to human readable string
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === '0') return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Helper to generate tag style
 */
export const getTagStyle = (tag, isSelected = false) => {
    const color = tag.color || '#4b5563'
    if (isSelected) {
        return {
            backgroundColor: color,
            borderColor: color,
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: `0 0 10px ${color}40`
        }
    }
    // Reading friendly: higher contrast and saturation for dark mode
    return {
        backgroundColor: `${color}20`, // 12.5% opacity
        borderColor: `${color}60`,     // 37.5% opacity
        color: color,
        fontWeight: '500'
    }
}

/**
 * Check if a string is valid JSON
 */
export const isValidJSON = (str) => {
    if (!str || typeof str !== 'string') return false
    try {
        JSON.parse(str)
        return true
    } catch (e) {
        return false
    }
}

/**
 * Format JSON string with indentation
 */
export const formatJSON = (str) => {
    if (!str) return ''
    try {
        const obj = JSON.parse(str)
        return JSON.stringify(obj, null, 2)
    } catch (e) {
        return str
    }
}
