/**
 * Video2Sprite 主应用
 * 整合所有模块并初始化应用
 */

// 导入所有模块
import { VideoProcessor } from './core/VideoProcessor.js';
import { BackgroundRemover } from './core/BackgroundRemover.js';
import { SpriteGenerator } from './core/SpriteGenerator.js';
import { UIManager } from './ui/UIManager.js';
import { ProgressManager } from './ui/ProgressManager.js';
import { FileManager } from './utils/FileManager.js';

/**
 * 主应用类
 */
class Video2SpriteApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('🚀 初始化 Video2Sprite 应用...');
            
            // 检查浏览器兼容性
            this.checkBrowserSupport();
            
            // 初始化各个模块
            this.initializeModules();
            
            // 设置全局引用
            window.app = this;
            
            this.isInitialized = true;
            console.log('✅ Video2Sprite 应用初始化完成');
            
            // 显示欢迎信息
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showInitError(error);
        }
    }

    /**
     * 检查浏览器支持
     */
    checkBrowserSupport() {
        const requirements = [
            { feature: 'Canvas API', check: () => !!document.createElement('canvas').getContext },
            { feature: 'Video API', check: () => !!document.createElement('video').canPlayType },
            { feature: 'File API', check: () => 'File' in window },
            { feature: 'URL.createObjectURL', check: () => 'createObjectURL' in URL }
        ];

        const unsupported = requirements.filter(req => !req.check());
        
        if (unsupported.length > 0) {
            throw new Error(`浏览器不支持以下功能: ${unsupported.map(r => r.feature).join(', ')}`);
        }
    }

    /**
     * 初始化所有模块
     */
    initializeModules() {
        // 按依赖顺序初始化模块
        this.modules.progressManager = new ProgressManager();
        this.modules.backgroundRemover = new BackgroundRemover();
        this.modules.spriteGenerator = new SpriteGenerator();
        this.modules.uiManager = new UIManager();
        
        // 需要依赖其他模块的模块
        this.modules.fileManager = new FileManager(
            this.modules.uiManager,
            this.modules.spriteGenerator,
            this.modules.progressManager
        );
        
        this.modules.processor = new VideoProcessor(
            this.modules.progressManager,
            this.modules.backgroundRemover,
            this.modules.spriteGenerator
        );

        console.log('📦 所有模块初始化完成');
    }

    /**
     * 获取模块实例
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * 快捷访问器
     */
    get processor() { return this.modules.processor; }
    get backgroundRemover() { return this.modules.backgroundRemover; }
    get spriteGenerator() { return this.modules.spriteGenerator; }
    get uiManager() { return this.modules.uiManager; }
    get progressManager() { return this.modules.progressManager; }
    get fileManager() { return this.modules.fileManager; }

    /**
     * 重置应用状态
     */
    reset() {
        try {
            console.log('🔄 重置应用状态...');
            
            // 重置所有模块
            Object.values(this.modules).forEach(module => {
                if (module.reset && typeof module.reset === 'function') {
                    module.reset();
                }
            });
            
            this.uiManager.showSuccess('应用已重置');
            console.log('✅ 应用状态重置完成');
            
        } catch (error) {
            console.error('❌ 重置失败:', error);
            this.uiManager.showError('重置失败: ' + error.message);
        }
    }

    /**
     * 显示欢迎信息
     */
    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'fixed top-4 left-4 bg-indigo-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        welcomeDiv.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">🎮</span>
                <div>
                    <div class="font-semibold">Video2Sprite v2.0</div>
                    <div class="text-sm opacity-90">应用初始化完成，可以开始使用了！</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(welcomeDiv);
        
        // 自动移除欢迎信息
        setTimeout(() => {
            if (welcomeDiv.parentNode) {
                welcomeDiv.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    welcomeDiv.parentNode.removeChild(welcomeDiv);
                }, 300);
            }
        }, 4000);
    }

    /**
     * 显示初始化错误
     */
    showInitError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md mx-4">
                <div class="text-center">
                    <div class="text-6xl mb-4">❌</div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">初始化失败</h2>
                    <p class="text-gray-600 mb-6">${error.message}</p>
                    <button onclick="location.reload()" 
                            class="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                        重新加载页面
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * 获取应用信息
     */
    getAppInfo() {
        return {
            name: 'Video2Sprite',
            version: '2.0.0',
            modules: Object.keys(this.modules),
            initialized: this.isInitialized,
            buildTime: new Date().toISOString()
        };
    }

    /**
     * 导出应用状态（用于调试）
     */
    exportState() {
        return {
            appInfo: this.getAppInfo(),
            fileInfo: this.fileManager.getFileInfo(),
            spriteInfo: this.spriteGenerator.getSpriteInfo(),
            configData: this.progressManager.getConfigData()
        };
    }

    /**
     * 开发者工具
     */
    get devTools() {
        return {
            modules: this.modules,
            exportState: () => this.exportState(),
            reset: () => this.reset(),
            info: () => this.getAppInfo()
        };
    }
}

// 创建应用实例并初始化
const app = new Video2SpriteApp();

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// 导出应用实例（用于调试）
window.Video2SpriteApp = app;

// 在控制台显示开发者信息
console.log(`
🎮 Video2Sprite v2.0.0
📦 模块化架构 | 🎨 Tailwind CSS | ⚡ ES6 Modules

开发者工具:
- window.app: 主应用实例
- window.app.devTools: 开发者工具
- window.app.exportState(): 导出应用状态
`);

export default app;