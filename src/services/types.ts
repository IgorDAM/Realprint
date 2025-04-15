declare global {
    interface Window {
        cacheManager: {
            getStats(): Promise<any>;
        };
        errorHandler: {
            getErrors(): Promise<any[]>;
        };
        monitor: {
            getMetrics(): Promise<any>;
            trackError(error: { type: string; message: string; timestamp: string }): void;
        };
        backupManager: {
            performBackup(): Promise<void>;
            setBackupInterval(interval: number): void;
            setMaxBackups(max: number): void;
            destroy(): void;
        };
    }
}

export interface Settings {
    [key: string]: string;
}

export interface BackupData {
    timestamp: string;
    userData: Array<{
        key: string;
        data: string;
    }>;
    settings: Settings;
    cache: any;
    errors: any[];
    metrics: any;
}

export interface CacheEntry {
    key: string;
    value: any;
    timestamp: number;
    expiration: number;
    priority: number;
    tags: string[];
}

export interface CacheStats {
    size: number;
    maxSize: number;
    entries: CacheEntry[];
}

export interface ErrorData {
    type: string;
    message: string;
    timestamp: string;
    stack?: string;
    context?: any;
}

export interface Metrics {
    performance: {
        loadTime: number;
        firstPaint: number;
        firstContentfulPaint: number;
    };
    errors: ErrorData[];
    usage: {
        clicks: number;
        keyPresses: number;
        navigation: string[];
        sessionDuration: number;
    };
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    preferences: {
        language: string;
        theme: string;
        notifications: boolean;
    };
}

export interface SecurityData {
    token: string;
    expires: number;
    permissions: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface Feedback {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    context?: any;
}

export interface Localization {
    language: string;
    translations: {
        [key: string]: string;
    };
}

export interface State {
    user: UserData | null;
    security: SecurityData | null;
    settings: Settings;
    localization: Localization;
    feedback: Feedback[];
}

export interface PerformanceMetrics {
    loadTime: number;
    firstPaint: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
    domContentLoaded: number;
    windowLoad: number;
}

export interface AccessibilityMetrics {
    contrastRatio: number;
    fontSize: number;
    focusableElements: number;
    keyboardNavigation: boolean;
    screenReader: boolean;
}

export interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => ValidationResult;
}

export interface FormData {
    [key: string]: any;
}

export interface FormValidation {
    rules: {
        [key: string]: ValidationRules;
    };
    messages: {
        [key: string]: string;
    };
}

export interface Logger {
    log(message: string, context?: any): void;
    error(message: string, error?: Error): void;
    warn(message: string, context?: any): void;
    info(message: string, context?: any): void;
    debug(message: string, context?: any): void;
}

export interface Config {
    apiUrl: string;
    environment: 'development' | 'production' | 'testing';
    debug: boolean;
    features: {
        [key: string]: boolean;
    };
}

export interface AuthData {
    token: string;
    user: UserData;
    expires: number;
}

export interface ConnectionStatus {
    online: boolean;
    lastCheck: number;
    latency: number;
}

export interface RateLimit {
    count: number;
    reset: number;
    limit: number;
}

export interface TwoFactorAuth {
    enabled: boolean;
    method: 'email' | 'sms' | 'authenticator';
    secret?: string;
}

export interface EmailVerification {
    verified: boolean;
    lastSent: number;
    attempts: number;
}

export interface XSSProtection {
    enabled: boolean;
    rules: {
        [key: string]: RegExp;
    };
}

export interface PasswordRecovery {
    token: string;
    expires: number;
    email: string;
}

export interface DashboardMetrics {
    users: number;
    orders: number;
    revenue: number;
    errors: number;
    performance: PerformanceMetrics;
}

export interface UserRole {
    name: string;
    permissions: string[];
    level: number;
}

export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: number;
    read: boolean;
}

export interface Session {
    id: string;
    user: UserData;
    startTime: number;
    lastActivity: number;
    ip: string;
    userAgent: string;
}

export interface AuditLog {
    id: string;
    action: string;
    user: string;
    timestamp: number;
    details: any;
}

export interface SystemStatus {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
    requests: number;
    errors: number;
}

export interface BackupConfig {
    interval: number;
    maxBackups: number;
    compression: boolean;
    encryption: boolean;
    storage: 'local' | 'remote';
}

export interface CacheConfig {
    maxSize: number;
    defaultExpiration: number;
    cleanupInterval: number;
    compression: boolean;
}

export interface SecurityConfig {
    minPasswordLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
}

export interface MonitoringConfig {
    interval: number;
    metrics: string[];
    alerts: {
        [key: string]: {
            threshold: number;
            action: string;
        };
    };
}

export interface ErrorConfig {
    maxLogs: number;
    retentionDays: number;
    notifyOnCritical: boolean;
    criticalLevels: string[];
}

export interface LocalizationConfig {
    defaultLanguage: string;
    fallbackLanguage: string;
    availableLanguages: string[];
    autoDetect: boolean;
}

export interface PerformanceConfig {
    minify: boolean;
    cache: boolean;
    compression: boolean;
    cdn: boolean;
    monitoring: boolean;
}

export interface AccessibilityConfig {
    contrast: number;
    minFontSize: number;
    keyboardNavigation: boolean;
    screenReader: boolean;
    ariaLabels: boolean;
}

export interface ValidationConfig {
    strict: boolean;
    sanitize: boolean;
    customRules: {
        [key: string]: ValidationRules;
    };
}

export interface FeedbackConfig {
    maxEntries: number;
    retentionDays: number;
    notifyOnCritical: boolean;
    categories: string[];
}

export interface StateConfig {
    persistence: boolean;
    encryption: boolean;
    compression: boolean;
    maxSize: number;
}

export interface LoggerConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: string;
    output: 'console' | 'file' | 'remote';
    maxSize: number;
}

export interface ConfigFile {
    backup: BackupConfig;
    cache: CacheConfig;
    security: SecurityConfig;
    monitoring: MonitoringConfig;
    error: ErrorConfig;
    localization: LocalizationConfig;
    performance: PerformanceConfig;
    accessibility: AccessibilityConfig;
    validation: ValidationConfig;
    feedback: FeedbackConfig;
    state: StateConfig;
    logger: LoggerConfig;
} 