interface JSONLDData {
    '@context': string;
    '@type': string;
    [key: string]: any;
}

interface MetaData {
    title: string;
    description: string;
    keywords: string;
    image: string;
}

interface BreadcrumbItem {
    url: string;
    name: string;
}

interface FAQItem {
    question: string;
    answer: string;
}

interface ProductData {
    name: string;
    description: string;
    image: string;
    price: number;
    availability: string;
}

interface ServiceData {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    radius: number;
}

interface WebPageData {
    title: string;
    description: string;
    mainEntity: any;
}

type PageType = 'Product' | 'Service' | 'WebPage';
type PageData = ProductData | ServiceData | WebPageData;

class SEOManager {
    private jsonLdData: JSONLDData;

    constructor() {
        this.jsonLdData = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'RealPrint',
            url: window.location.origin,
            logo: `${window.location.origin}/img/RealPrint logo.png`,
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+34-123-456-789',
                contactType: 'customer service'
            },
            sameAs: [
                'https://www.facebook.com/realprint',
                'https://www.twitter.com/realprint',
                'https://www.instagram.com/realprint'
            ]
        };
    }

    generatePageSpecificJSONLD(pageType: PageType, data: PageData): JSONLDData {
        const baseData: JSONLDData = {
            '@context': 'https://schema.org',
            '@type': pageType,
            url: window.location.href,
            publisher: {
                '@type': 'Organization',
                name: 'RealPrint',
                logo: {
                    '@type': 'ImageObject',
                    url: `${window.location.origin}/img/RealPrint logo.png`
                }
            }
        };

        switch (pageType) {
            case 'Product':
                const productData = data as ProductData;
                return {
                    ...baseData,
                    '@type': 'Product',
                    name: productData.name || '',
                    description: productData.description || '',
                    image: productData.image || '',
                    offers: {
                        '@type': 'Offer',
                        price: productData.price || 0,
                        priceCurrency: 'EUR',
                        availability: productData.availability || 'https://schema.org/InStock'
                    }
                };
            case 'Service':
                const serviceData = data as ServiceData;
                return {
                    ...baseData,
                    '@type': 'Service',
                    name: serviceData.name || '',
                    description: serviceData.description || '',
                    provider: {
                        '@type': 'Organization',
                        name: 'RealPrint'
                    },
                    areaServed: {
                        '@type': 'GeoCircle',
                        geoMidpoint: {
                            '@type': 'GeoCoordinates',
                            latitude: serviceData.latitude || 40.4168,
                            longitude: serviceData.longitude || -3.7038
                        },
                        geoRadius: serviceData.radius || 100000
                    }
                };
            case 'WebPage':
                const webPageData = data as WebPageData;
                return {
                    ...baseData,
                    '@type': 'WebPage',
                    name: webPageData.title || '',
                    description: webPageData.description || '',
                    mainEntity: webPageData.mainEntity || null
                };
            default:
                return baseData;
        }
    }

    addJSONLD(data: JSONLDData): void {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    }

    updateMetaTags(metaData: MetaData): void {
        const { title, description, keywords, image } = metaData;
        
        // Actualizar título
        document.title = title;
        
        // Actualizar meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);
        
        // Actualizar meta keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywords);
        
        // Actualizar Open Graph
        this.updateOpenGraph({
            title,
            description,
            image
        });
    }

    updateOpenGraph(data: { title: string; description: string; image: string }): void {
        const { title, description, image } = data;
        
        // Actualizar og:title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', title);
        
        // Actualizar og:description
        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (!ogDescription) {
            ogDescription = document.createElement('meta');
            ogDescription.setAttribute('property', 'og:description');
            document.head.appendChild(ogDescription);
        }
        ogDescription.setAttribute('content', description);
        
        // Actualizar og:image
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            ogImage = document.createElement('meta');
            ogImage.setAttribute('property', 'og:image');
            document.head.appendChild(ogImage);
        }
        ogImage.setAttribute('content', image);
    }

    generateBreadcrumbs(items: BreadcrumbItem[]): void {
        const breadcrumbList = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@id': item.url,
                    name: item.name
                }
            }))
        };
        
        this.addJSONLD(breadcrumbList);
    }

    generateFAQ(faqItems: FAQItem[]): void {
        const faqPage = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map(item => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer
                }
            }))
        };
        
        this.addJSONLD(faqPage);
    }
}

// Inicializar gestor SEO
const seoManager = new SEOManager();

// Exportar el gestor SEO
export default seoManager; 