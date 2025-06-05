/**
 * 精灵图生成模块
 * 负责将处理后的帧合成为精灵图
 */
export class SpriteGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * 创建精灵图
     */
    async createSprite(frames, settings) {
        const spriteWidth = settings.frameWidth * settings.spriteWidth;
        const spriteHeight = settings.frameHeight * settings.spriteHeight;
        
        // 使用页面上的canvas显示结果
        this.canvas = document.getElementById('spriteCanvas');
        this.canvas.width = spriteWidth;
        this.canvas.height = spriteHeight;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.clearRect(0, 0, spriteWidth, spriteHeight);
        
        // 创建临时canvas用于帧处理
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = settings.frameWidth;
        tempCanvas.height = settings.frameHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 绘制所有帧到精灵图
        frames.forEach((frameData, index) => {
            const row = Math.floor(index / settings.spriteWidth);
            const col = index % settings.spriteWidth;
            const x = col * settings.frameWidth;
            const y = row * settings.frameHeight;
            
            // 将帧数据绘制到临时canvas
            tempCtx.putImageData(frameData, 0, 0);
            
            // 从临时canvas绘制到主精灵图
            this.ctx.drawImage(tempCanvas, x, y);
        });
        
        return this.canvas;
    }

    /**
     * 获取精灵图数据URL
     */
    getDataURL(quality = 0.9) {
        if (!this.canvas) {
            throw new Error('No sprite canvas available');
        }
        return this.canvas.toDataURL('image/png', quality);
    }

    /**
     * 导出精灵图为Blob
     */
    async exportAsBlob(quality = 0.9) {
        if (!this.canvas) {
            throw new Error('No sprite canvas available');
        }
        
        return new Promise((resolve) => {
            this.canvas.toBlob(resolve, 'image/png', quality);
        });
    }

    /**
     * 获取精灵图信息
     */
    getSpriteInfo() {
        if (!this.canvas) {
            return null;
        }
        
        return {
            width: this.canvas.width,
            height: this.canvas.height,
            dataSize: this.canvas.width * this.canvas.height * 4 // RGBA
        };
    }

    /**
     * 重置生成器
     */
    reset() {
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.canvas = null;
        this.ctx = null;
    }
} 