import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Order = {
  id: string;
  status: "waiting" | "pending" | "completed";
  assignedTo?: string;
};

let socket: Socket;

export function useSocket() {
  const [waitingOrders, setWaiting] = useState<Order[]>([]);
  const [pendingOrders, setPending] = useState<Order[]>([]);
  const [completedOrders, setCompleted] = useState<Order[]>([]);

  useEffect(() => {
    socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected");
    });

    socket.on("waitingUpdate", (orders: Order[]) => {
      setWaiting(orders);
    });

    socket.on("pendingUpdate", (orders: Order[]) => {
      setPending(orders);
    });

    socket.on("completedUpdate", (orders: Order[]) => {
      setCompleted(orders);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { waitingOrders, pendingOrders, completedOrders };
}
