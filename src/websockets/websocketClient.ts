// src/websockets/websocketClient.ts

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

class WebSocketClient {
  private echo: Echo<any> | null = null;
  private subscribedChannels: Map<string, any> = new Map();

  /**
   * Websocket host. Prefer VITE_REVERB_HOST; otherwise fall back to the API
   * host rather than "localhost" — an unset variable in a production build
   * used to point every browser at its own machine, which can never connect.
   */
  private resolveHost(): string {
    const configured = import.meta.env.VITE_REVERB_HOST;
    if (configured) return configured;
    try {
      return new URL(import.meta.env.VITE_API_URL ?? '').hostname || 'localhost';
    } catch {
      return 'localhost';
    }
  }

  /** Defaults to the page's own protocol so an https page never tries plain ws. */
  private resolveScheme(): string {
    return (
      import.meta.env.VITE_REVERB_SCHEME ??
      (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http')
    );
  }

  initialize(): void {
    if (this.echo) {
      return;
    }

    window.Pusher = Pusher;

    const scheme = this.resolveScheme();

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY ?? "tasks_key",
      wsHost: this.resolveHost(),
      wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
      wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      },
    });

    window.Echo = this.echo;
  }

  subscribe<T = any>(
    channelName: string,
    eventName: string,
    callback: (data: T) => void
  ): void {
    if (!this.echo) {
      console.error('WebSocket not initialized. Call initialize() first.');
      return;
    }

    if (this.subscribedChannels.has(channelName)) {
      return;
    }

    const channel = this.echo.channel(channelName);
    const echoEventName = eventName.startsWith('.') ? eventName : `.${eventName}`;
    
    channel.listen(echoEventName, callback);
    
    channel.error((error: any) => {
      console.error(`WebSocket error on ${channelName}:`, error);
    });

    this.subscribedChannels.set(channelName, channel);
  }

  unsubscribe(channelName: string): void {
    if (!this.echo) return;

    if (this.subscribedChannels.has(channelName)) {
      this.echo.leave(channelName);
      this.subscribedChannels.delete(channelName);
    }
  }

  isSubscribed(channelName: string): boolean {
    return this.subscribedChannels.has(channelName);
  }

  disconnect(): void {
    if (!this.echo) return;

    this.subscribedChannels.forEach((_, channelName) => {
      this.echo?.leave(channelName);
    });
    
    this.subscribedChannels.clear();
    this.echo = null;
  }

  getEcho(): Echo<any> | null {
    return this.echo;
  }
}

export const websocketClient = new WebSocketClient();
