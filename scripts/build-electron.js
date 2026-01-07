const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'out');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 开始构建 AIGC Media Hub 桌面应用...\n');

// 步骤 1: 清理旧的构建文件
console.log('📦 步骤 1/5: 清理旧的构建文件...');
try {
    if (fs.existsSync(outDir)) {
        fs.removeSync(outDir);
        console.log('   ✓ 已清理 out 目录');
    }
    if (fs.existsSync(distDir)) {
        fs.removeSync(distDir);
        console.log('   ✓ 已清理 dist 目录');
    }
} catch (error) {
    console.error('   ✗ 清理失败:', error.message);
    process.exit(1);
}

// 步骤 2: 构建 Next.js 应用
console.log('\n📦 步骤 2/5: 构建 Next.js 应用...');
try {
    execSync('npm run build', {
        stdio: 'inherit',
        cwd: rootDir
    });
    console.log('   ✓ Next.js 构建完成');
} catch (error) {
    console.error('   ✗ Next.js 构建失败:', error.message);
    process.exit(1);
}

// 步骤 3: 复制必要的资源文件
console.log('\n📦 步骤 3/5: 复制资源文件...');
try {
    // 确保 .next 目录存在
    const nextDir = path.join(rootDir, '.next');
    if (!fs.existsSync(nextDir)) {
        console.error('   ✗ .next 目录不存在，Next.js 构建可能失败');
        process.exit(1);
    }

    // 复制 Prisma schema（运行时需要）
    const prismaDir = path.join(rootDir, 'prisma');
    if (fs.existsSync(prismaDir)) {
        console.log('   ✓ Prisma 文件将由 electron-builder 复制');
    }

    // 复制插件目录
    const pluginsDir = path.join(rootDir, 'plugins');
    if (fs.existsSync(pluginsDir)) {
        console.log('   ✓ 插件目录将由 electron-builder 复制');
    }

    console.log('   ✓ 资源文件准备完成');
} catch (error) {
    console.error('   ✗ 复制资源文件失败:', error.message);
    process.exit(1);
}

// 步骤 4: 检查应用图标
console.log('\n📦 步骤 4/5: 检查应用图标...');
const iconPath = path.join(rootDir, 'build', 'icon.ico');
if (!fs.existsSync(iconPath)) {
    console.warn('   ⚠ 警告: 未找到应用图标 (build/icon.ico)');
    console.warn('   ⚠ 将使用默认图标，建议添加自定义图标');

    // 创建 build 目录
    fs.ensureDirSync(path.join(rootDir, 'build'));
} else {
    console.log('   ✓ 应用图标已就绪');
}

// 步骤 5: 准备打包
console.log('\n📦 步骤 5/5: 准备打包配置...');
console.log('   ✓ 构建脚本执行完成');
console.log('\n✨ 准备工作完成！Electron Builder 将开始打包...\n');
