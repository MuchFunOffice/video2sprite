/**
 * 进度管理模块
 * 负责处理进度显示和结果展示
 */
export class ProgressManager {
    constructor() {
        this.elements = {
            progressSection: document.getElementById('progressSection'),
            progressText: document.getElementById('progressText'),
            progressBar: document.getElementById('progressBar'),
            progressPercent: document.getElementById('progressPercent'),
            resultSection: document.getElementById('resultSection'),
            configInfo: document.getElementById('configInfo')
        };
        this.configData = null;
    }

    /**
     * 显示进度区域
     */
    show() {
        this.elements.progressSection.classList.remove('hidden');
        this.elements.resultSection.classList.add('hidden');
        this.update(0, '准备中...');
    }

    /**
     * 更新进度
     */
    update(percent, text) {
        this.elements.progressBar.style.width = percent + '%';
        this.elements.progressPercent.textContent = Math.round(percent) + '%';
        this.elements.progressText.textContent = text;
        
        // 添加动画效果
        if (percent === 100) {
            this.elements.progressBar.style.background = 
                'linear-gradient(to right, #10b981, #059669)';
            this.elements.progressText.classList.add('text-green-600', 'font-semibold');
        }
    }

    /**
     * 显示处理结果
     */
    showResults(canvas, configData) {
        this.configData = configData;
        
        // 隐藏进度，显示结果
        this.elements.progressSection.classList.add('hidden');
        this.elements.resultSection.classList.remove('hidden');
        
        // 更新配置信息显示
        this.elements.configInfo.textContent = JSON.stringify(configData, null, 2);
        
        // 滚动到结果区域
        this.elements.resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // 显示成功消息
        this.showSuccessMessage();
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.elements.progressText.textContent = '❌ ' + message;
        this.elements.progressText.classList.add('text-red-600', 'font-semibold');
        this.elements.progressBar.style.background = 
            'linear-gradient(to right, #ef4444, #dc2626)';
        
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-2">❌</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 自动移除错误提示
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    errorDiv.parentNode.removeChild(errorDiv);
                }, 300);
            }
        }, 5000);
    }

    /**
     * 显示成功消息
     */
    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-2">✅</span>
                <div>
                    <div class="font-semibold">处理完成！</div>
                    <div class="text-sm opacity-90">精灵图已生成，可以下载了</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // 自动移除成功提示
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    successDiv.parentNode.removeChild(successDiv);
                }, 300);
            }
        }, 4000);
    }

    /**
     * 获取配置数据
     */
    getConfigData() {
        return this.configData;
    }

    /**
     * 隐藏所有进度和结果
     */
    hide() {
        this.elements.progressSection.classList.add('hidden');
        this.elements.resultSection.classList.add('hidden');
    }

    /**
     * 重置进度管理器
     */
    reset() {
        this.hide();
        this.configData = null;
        
        // 重置进度条样式
        this.elements.progressBar.style.width = '0%';
        this.elements.progressBar.style.background = '';
        this.elements.progressText.className = 'text-gray-700';
        this.elements.progressText.textContent = '准备中...';
        this.elements.progressPercent.textContent = '0%';
    }

    /**
     * 创建进度动画
     */
    animateProgress(targetPercent, duration = 1000) {
        const startPercent = parseFloat(this.elements.progressBar.style.width) || 0;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeProgress = this.easeOutCubic(progress);
            const currentPercent = startPercent + (targetPercent - startPercent) * easeProgress;
            
            this.elements.progressBar.style.width = currentPercent + '%';
            this.elements.progressPercent.textContent = Math.round(currentPercent) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 缓动函数
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
} 