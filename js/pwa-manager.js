/**
 * Nixite PWA Manager
 *
 * Handles Progressive Web App features:
 * - Service worker registration
 * - Install prompts
 * - Update notifications
 * - Offline detection
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
    }

    /**
     * Initialize PWA features
     */
    async initialize() {
        // Check for PWA support
        if (!this.isPWASupported()) {
            console.log('PWA features not supported in this browser');
            return;
        }

        // Register service worker
        await this.registerServiceWorker();

        // Setup install prompt
        this.setupInstallPrompt();

        // Setup online/offline detection
        this.setupOnlineDetection();

        // Check for updates periodically
        this.setupUpdateCheck();

        console.log('✓ PWA Manager initialized');
    }

    /**
     * Check if PWA is supported
     */
    isPWASupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            this.swRegistration = registration;
            console.log('Service Worker registered successfully');

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.updateAvailable = true;
                        this.showUpdateNotification();
                    }
                });
            });

            // Listen for controller change (new SW activated)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (this.updateAvailable) {
                    window.location.reload();
                }
            });

        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing
            e.preventDefault();

            // Stash the event so it can be triggered later
            this.deferredPrompt = e;

            // Show install button
            this.showInstallButton();

            console.log('Install prompt ready');
        });

        // Detect if already installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showNotification('Nixite installed successfully!', 'success');
        });

        // Check if running as installed app
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('Running as installed PWA');
            document.body.classList.add('pwa-installed');
        }
    }

    /**
     * Show install button
     */
    showInstallButton() {
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('pwa-install-btn');

        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.className = 'btn btn-primary pwa-install-btn';
            installBtn.innerHTML = '📱 Install App';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                box-shadow: var(--shadow-xl);
                animation: slideInUp 0.3s ease;
            `;

            installBtn.addEventListener('click', () => this.promptInstall());

            document.body.appendChild(installBtn);
        }

        installBtn.style.display = 'block';
    }

    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    /**
     * Prompt user to install
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('Install prompt not available');
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await this.deferredPrompt.userChoice;

        console.log(`User ${outcome} the install prompt`);

        if (outcome === 'accepted') {
            this.hideInstallButton();
        }

        // Clear the deferred prompt
        this.deferredPrompt = null;
    }

    /**
     * Setup online/offline detection
     */
    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showOnlineIndicator();
            this.showNotification('Back online!', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
            this.showNotification('You are offline. Some features may be limited.', 'warning');
        });

        // Initial state
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }

    /**
     * Show online indicator
     */
    showOnlineIndicator() {
        document.body.classList.remove('offline');
        document.body.classList.add('online');

        const indicator = this.getOrCreateIndicator();
        indicator.className = 'connection-indicator online';
        indicator.textContent = '● Online';
    }

    /**
     * Show offline indicator
     */
    showOfflineIndicator() {
        document.body.classList.remove('online');
        document.body.classList.add('offline');

        const indicator = this.getOrCreateIndicator();
        indicator.className = 'connection-indicator offline';
        indicator.textContent = '● Offline';
    }

    /**
     * Get or create connection indicator
     */
    getOrCreateIndicator() {
        let indicator = document.getElementById('connection-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'connection-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 600;
                z-index: 2000;
                transition: all 0.3s ease;
            `;

            document.body.appendChild(indicator);
        }

        return indicator;
    }

    /**
     * Setup automatic update check
     */
    setupUpdateCheck() {
        // Check for updates every hour
        setInterval(() => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        }, 60 * 60 * 1000);

        // Check on focus
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.swRegistration) {
                this.swRegistration.update();
            }
        });
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <strong>Update Available!</strong>
                <p>A new version of Nixite is ready.</p>
                <div class="update-actions">
                    <button class="btn btn-primary btn-sm" id="update-btn">Update Now</button>
                    <button class="btn btn-secondary btn-sm" id="later-btn">Later</button>
                </div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: var(--shadow-xl);
            z-index: 2000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Update button
        document.getElementById('update-btn').addEventListener('click', () => {
            if (this.swRegistration && this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            notification.remove();
        });

        // Later button
        document.getElementById('later-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Clear all caches
     */
    async clearCaches() {
        if (!this.swRegistration) return;

        try {
            const channel = new MessageChannel();

            return new Promise((resolve) => {
                channel.port1.onmessage = (event) => {
                    resolve(event.data.success);
                };

                this.swRegistration.active.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [channel.port2]
                );
            });
        } catch (error) {
            console.error('Failed to clear caches:', error);
            return false;
        }
    }

    /**
     * Get service worker version
     */
    async getVersion() {
        if (!this.swRegistration) return null;

        try {
            const channel = new MessageChannel();

            return new Promise((resolve) => {
                channel.port1.onmessage = (event) => {
                    resolve(event.data.version);
                };

                this.swRegistration.active.postMessage(
                    { type: 'GET_VERSION' },
                    [channel.port2]
                );
            });
        } catch (error) {
            console.error('Failed to get version:', error);
            return null;
        }
    }

    /**
     * Request push notification permission
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    /**
     * Subscribe to push notifications
     */
    async subscribeToPushNotifications() {
        if (!this.swRegistration) {
            console.log('Service Worker not registered');
            return null;
        }

        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'YOUR_PUBLIC_VAPID_KEY_HERE' // Replace with actual VAPID key
                )
            });

            console.log('Push subscription:', subscription);
            return subscription;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            return null;
        }
    }

    /**
     * Convert URL-safe base64 to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    /**
     * Show notification (uses window.nixiteUI if available)
     */
    showNotification(message, type = 'info') {
        if (window.nixiteUI && window.nixiteUI.showNotification) {
            window.nixiteUI.showNotification('', message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Get PWA status
     */
    getStatus() {
        return {
            supported: this.isPWASupported(),
            registered: !!this.swRegistration,
            installed: window.matchMedia('(display-mode: standalone)').matches,
            online: this.isOnline,
            updateAvailable: this.updateAvailable,
            installable: !!this.deferredPrompt
        };
    }
}

// Create global instance
window.pwaManager = new PWAManager();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaManager.initialize();
    });
} else {
    window.pwaManager.initialize();
}

// Add CSS for connection indicator
const style = document.createElement('style');
style.textContent = `
    .connection-indicator.online {
        background: var(--success);
        color: white;
    }

    .connection-indicator.offline {
        background: var(--danger);
        color: white;
    }

    @keyframes slideInUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .update-notification .update-content {
        text-align: center;
    }

    .update-notification strong {
        display: block;
        margin-bottom: 8px;
        color: var(--primary);
    }

    .update-notification p {
        margin-bottom: 16px;
        color: var(--gray-600);
    }

    .update-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .btn-sm {
        padding: 6px 12px;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PWAManager };
}
