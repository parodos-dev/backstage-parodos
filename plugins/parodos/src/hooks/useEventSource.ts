import { useEffect, useState } from 'react';

type EventSourceOptions = {
  init?: EventSourceInit;
  event?: string;
};

export function useEventSource(
  url: string | URL,
  { event = 'message', init }: EventSourceOptions = {},
) {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url, init);
    // eventSource.addEventListener(event ?? 'message', handler);

    eventSource.onmessage = (e) => console.log({e: e.data});
    setData(null);

    function handler(e: MessageEvent) {
      console.log(e)
      setData(e.data || 'UNKNOWN_EVENT_DATA');
    }

    return () => {
      // eventSource.removeEventListener(event ?? 'message', handler);
      eventSource.close();
    };
  }, [url, event, init]);

  return data;
}
