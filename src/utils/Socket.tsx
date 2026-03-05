import WebSocket, { WebSocketServer } from "ws";
import { SALONG_LAYOUT } from "../pages/BookingPage";

interface SeatUpdate {
    seatId: number;
    occupied: boolean;
}

interface ServerMessage {
    type: "init" | "update";
    seats?: Record<number, boolean>;
    seatId?: number;
    occupied?: boolean;
}

interface Seat {
    id: number;
}

export function webSocket(port: number) {

    const wss = new WebSocketServer({ port });
    const clients = new Set<WebSocket>();
    const seats: Record<string, boolean> = {};

    Object.values(SALONG_LAYOUT).forEach(salon => {
        salon.seatsPerRow.forEach((seatsInRow, rowIndex) => {
            for (let seat = 1; seat <= seatsInRow; seat++) {
                const seatId = rowIndex * 100 + seat;
                seats[seatId] = false;
            }
        });
    });

    // broadcast function
    const broadcast = (message: ServerMessage) => {
        const msg = JSON.stringify(message);

        clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(msg);
            }
        });
    };

    // client connecting
    wss.on("connection", (ws) => {

        clients.add(ws);

        ws.send(JSON.stringify({ type: "init", seats }));

        ws.on("message", (message) => {

            const data: SeatUpdate = JSON.parse(message.toString());

            seats[data.seatId] = data.occupied;

            broadcast({
                type: "update",
                seatId: data.seatId,
                occupied: data.occupied
            });
        });

        ws.on("close", () => clients.delete(ws));
    });

    return {
        updateSeat: (seatId: number, occupied: boolean) => {
            seats[seatId] = occupied;

            broadcast({
                type: "update",
                seatId,
                occupied
            });
        },

        getActiveClients: () =>
            Array.from(clients).filter(c => c.readyState === WebSocket.OPEN)
    };
}