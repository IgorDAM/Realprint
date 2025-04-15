declare interface File {
    name: string;
    type: string;
    size: number;
}

declare interface Image {
    width: number;
    height: number;
    src: string;
    onload: (() => void) | null;
    onerror: ((error: Event) => void) | null;
}

declare interface Canvas {
    width: number;
    height: number;
    getContext(contextId: '2d'): CanvasRenderingContext2D | null;
    toBlob(callback: (blob: Blob) => void, type?: string, quality?: number): void;
}

declare interface Blob {
    size: number;
    type: string;
}

declare interface CanvasRenderingContext2D {
    drawImage(image: Image, dx: number, dy: number, dWidth: number, dHeight: number): void;
}

declare interface JSONLDData {
    '@context': string;
    '@type': string;
    [key: string]: any;
}

declare interface MetaData {
    title: string;
    description: string;
    keywords: string;
    image: string;
}

declare interface BreadcrumbItem {
    url: string;
    name: string;
}

declare interface FAQItem {
    question: string;
    answer: string;
}

declare interface ProductData {
    name: string;
    description: string;
    image: string;
    price: number;
    availability: string;
}

declare interface ServiceData {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    radius: number;
}

declare interface WebPageData {
    title: string;
    description: string;
    mainEntity: any;
}

declare type PageType = 'Product' | 'Service' | 'WebPage';
declare type PageData = ProductData | ServiceData | WebPageData; 