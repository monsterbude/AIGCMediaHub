import prisma from './prisma'

export async function getSetting(key, defaultValue = '') {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        })
        return setting ? setting.value : defaultValue
    } catch (e) {
        console.error(`Error getting setting ${key}:`, e)
        return defaultValue
    }
}

export async function setSetting(key, value) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        })
        return true
    } catch (e) {
        console.error(`Error setting ${key}:`, e)
        return false
    }
}
