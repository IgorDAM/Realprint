import { File, Image, Canvas, Blob } from './types';

class ImageOptimizer {
    private supportedFormats: string[];
    private maxWidth: number;
    private maxHeight: number;
    private quality: number;

    constructor() {
        this.supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        this.maxWidth = 1920;
        this.maxHeight = 1080;
        this.quality = 0.8;
    }

    async optimizeImage(file: File) {
        try {
            if (!this.supportedFormats.includes(file.type)) {
                throw new Error('Formato de imagen no soportado');
            }

            const image = await this.loadImage(file);
            const canvas = this.resizeImage(image);
            const optimizedBlob = await this.compressImage(canvas, file.type);
            
            return {
                blob: optimizedBlob,
                size: optimizedBlob.size,
                originalSize: file.size,
                reduction: ((file.size - optimizedBlob.size) / file.size * 100).toFixed(2) + '%'
            };
        } catch (error) {
            console.error('Error optimizando imagen:', error);
            throw error;
        }
    }

    private loadImage(file: File): Promise<Image> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    private resizeImage(image: Image): Canvas {
        const canvas = document.createElement('canvas') as Canvas;
        let width = image.width;
        let height = image.height;

        if (width > this.maxWidth) {
            height = (this.maxWidth / width) * height;
            width = this.maxWidth;
        }

        if (height > this.maxHeight) {
            width = (this.maxHeight / height) * width;
            height = this.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(image, 0, 0, width, height);
        }

        return canvas;
    }

    private compressImage(canvas: Canvas, type: string): Promise<Blob> {
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob: Blob) => resolve(blob),
                type,
                this.quality
            );
        });
    }

    async optimizeMultipleImages(files: File[]) {
        const results = [];
        for (const file of files) {
            try {
                const result = await this.optimizeImage(file);
                results.push(result);
            } catch (error) {
                console.error(`Error optimizando ${file.name}:`, error);
                results.push({
                    error: true,
                    fileName: file.name,
                    message: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        }
        return results;
    }

    setMaxDimensions(width: number, height: number) {
        this.maxWidth = width;
        this.maxHeight = height;
    }

    setQuality(quality: number) {
        if (quality >= 0 && quality <= 1) {
            this.quality = quality;
        } else {
            throw new Error('La calidad debe estar entre 0 y 1');
        }
    }

    getSupportedFormats(): string[] {
        return this.supportedFormats;
    }
}

// Exportar el optimizador de imágenes
export default new ImageOptimizer(); 