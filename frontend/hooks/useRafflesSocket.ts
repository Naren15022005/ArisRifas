import { useEffect, useRef } from 'react';

import { getBackendBaseUrl } from '../lib/backend';

type PurchaseEvent = { raffleId: number; purchaseId: number; quantity: number };

type RaffleEvent = any;

export default function useRafflesSocket(
  onPurchase: (ev: PurchaseEvent) => void,
  onRaffleUpdated?: (raffle: RaffleEvent) => void,
) {
  const sockRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const { io } = await import('socket.io-client');
        const base = getBackendBaseUrl();
        const url = base.replace(/\/$/, '');
        // connect to namespace /raffles
        const socket = io(url + '/raffles', { transports: ['websocket'] });
        sockRef.current = socket;

        socket.on('connect', () => {
          if (!mounted) return;
          console.log('Connected to raffles socket', socket.id);
        });

        socket.on('purchase:reserved', (payload: PurchaseEvent) => {
          try {
            onPurchase(payload);
          } catch (err) {
            console.warn('onPurchase handler error', err);
          }
        });

        if (onRaffleUpdated) {
          socket.on('raffle:updated', (raffle: RaffleEvent) => {
            try {
              onRaffleUpdated(raffle);
            } catch (err) {
              console.warn('onRaffleUpdated handler error', err);
            }
          });
        }
      } catch (err) {
        console.warn('Socket init failed (socket.io-client missing?)', err);
      }
    }
    init();
    return () => {
      mounted = false;
      try {
        sockRef.current?.disconnect?.();
      } catch (e) {
        /* ignore */
      }
    };
  }, [onPurchase]);
}
