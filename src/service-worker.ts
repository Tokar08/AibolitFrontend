import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
declare let __WB_MANIFEST: any;

if (Array.isArray(__WB_MANIFEST)) {
    precacheAndRoute(__WB_MANIFEST);
}

registerRoute(
    ({ request }) => request.destination === 'image',
    new StaleWhileRevalidate()
);