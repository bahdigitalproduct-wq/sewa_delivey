'use client';

import { Order, OrderStatus } from '@/types';
import OrderCardAdmin from './OrderCardAdmin';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanBoardProps {
  orders: Order[];
  onStatusChange: (id: string, newStatus: OrderStatus) => void;
}

const columns: { id: OrderStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'En attente', color: 'border-yellow-200 bg-yellow-50/50' },
  { id: 'confirmed', title: 'Confirmé', color: 'border-blue-200 bg-blue-50/50' },
  { id: 'en_route', title: 'En route', color: 'border-sewa-red/30 bg-red-50/50' },
  { id: 'delivered', title: 'Livré', color: 'border-green-200 bg-green-50/50' },
];

export default function KanbanBoard({ orders, onStatusChange }: KanbanBoardProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
      {columns.map((column) => {
        const columnOrders = orders.filter((o) => o.status === column.id);
        
        return (
          <div 
            key={column.id} 
            className={`min-w-[320px] max-w-[320px] flex flex-col gap-4 p-4 rounded-3xl border-2 snap-center ${column.color}`}
          >
            <div className="flex justify-between items-center px-2">
              <h2 className="font-black text-gray-900">{column.title}</h2>
              <span className="bg-white text-gray-900 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                {columnOrders.length}
              </span>
            </div>

            <div className="flex flex-col gap-4 min-h-[200px]">
              <AnimatePresence>
                {columnOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <OrderCardAdmin order={order} onStatusChange={onStatusChange} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnOrders.length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400 text-sm font-medium">
                  Aucune commande
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
