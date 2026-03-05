import { useEffect, useState, useRef } from "react";

interface ServerMessage {
    type: "init" | "update";
    seats?: Record<string, boolean>;
    seatId?: string;
    occupied?: boolean;
}

export function useSeatWebSocket(url: string) {
    const [seats, setSeats] = useState<Record<string, boolean>>({});
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => console.log("WS connected");
        ws.onclose = () => console.log("WS disconnected");

        ws.onmessage = (event) => {
            const data: ServerMessage = JSON.parse(event.data);

            if (data.type === "init" && data.seats) setSeats(data.seats);
            if (data.type === "update")
                setSeats((prev) => ({ ...prev, [data.seatId!]: data.occupied! }));
        };

        return () => ws.close();
    }, [url]);

    const sendUpdate = (seatId: string, occupied: boolean) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ seatId, occupied }));
        }
    };

    return { seats, sendUpdate };
}