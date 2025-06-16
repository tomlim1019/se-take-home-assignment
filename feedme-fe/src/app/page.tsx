"use client";

import { useSocket } from "@/app/useSocket";
import { useState } from "react";

export default function Home() {
  const { waitingOrders, pendingOrders, completedOrders } = useSocket();
  const [loading, setLoading] = useState(false);

  const callApi = async (endpoint: string) => {
    try {
      setLoading(true);
      await fetch(`http://localhost:8000/${endpoint}`, { method: "POST" });
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderList = (
    orders: any[],
    title: string,
    color: string,
    showAssigned = false
  ) => (
    <section className="bg-white p-4 rounded-2xl shadow">
      <h2 className={`text-xl font-semibold text-${color}-600 mb-2`}>
        {title}
      </h2>
      {orders.length === 0 ? (
        <p className="text-gray-400">No order</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id} className="text-gray-800">
              <strong>{order.id}</strong>
              {showAssigned && order.assignedTo ? (
                <> → {order.assignedTo}</>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">
        〽️ McDonald's Order Tracking System
      </h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          onClick={() => callApi("add-normal")}
          disabled={loading}
        >
          New Normal Order
        </button>
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded-xl"
          onClick={() => callApi("add-vip")}
          disabled={loading}
        >
          New VIP Order
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
          onClick={() => callApi("add-bot")}
          disabled={loading}
        >
          + Bot
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-xl"
          onClick={() => callApi("remove-bot")}
          disabled={loading}
        >
          - Bot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderOrderList(waitingOrders, "ORDER", "gray")}
        {renderOrderList(pendingOrders, "PENDING", "yellow", true)}
        {renderOrderList(completedOrders, "COMPLETED", "green")}
      </div>
    </main>
  );
}
