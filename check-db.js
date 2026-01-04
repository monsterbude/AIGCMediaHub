import prisma from './src/lib/prisma.js'

async function check() {
  try {
    const fileCount = await prisma.fileMetaInfo.count()
    const aigcCount = await prisma.aigcMetaInfo.count()
    
    console.log('Total Files:', fileCount)
    console.log('Total AIGC Meta:', aigcCount)
    
    if (aigcCount > 0) {
      const sample = await prisma.aigcMetaInfo.findFirst({
        include: { fileMetaInfo: true }
      })
      console.log('Sample AIGC:', JSON.stringify(sample, null, 2))
    } else {
        console.log('No AIGC metadata found.')
    }
  } catch (e) {
    console.error(e)
  }
}

check()
