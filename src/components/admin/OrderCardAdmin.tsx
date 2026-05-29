'use client';

import { Order, OrderStatus } from '@/types';
import { MapPin, Phone, Clock, ArrowRight, User, CircleDollarSign, Zap } from 'lucide-react';

interface OrderCardAdminProps {
  order: Order;
  onStatusChange: (id: string, newStatus: OrderStatus) => void;
}

const statusTranslations: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  en_route: 'En route',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

const urgencyColors: Record<string, string> = {
  standard: 'bg-gray-100 text-gray-800',
  express: 'bg-orange-100 text-orange-800',
  vip: 'bg-purple-100 text-purple-800',
};

export default function OrderCardAdmin({ order, onStatusChange }: OrderCardAdminProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' });
  };

  const nextStatusOptions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['en_route', 'cancelled'],
    en_route: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  const availableNextStatuses = nextStatusOptions[order.status];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden group hover:shadow-md transition-shadow">
      {/* Liseré indicateur d'urgence */}
      {order.urgency === 'vip' && <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />}
      {order.urgency === 'express' && <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />}

      {/* Header Card */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">#{order.id.split('-')[0]}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" /> {formatTime(order.created_at)}
          </span>
        </div>
        <div className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${urgencyColors[order.urgency] || urgencyColors.standard}`}>
          {order.urgency}
        </div>
      </div>

      {/* Addresses */}
      <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl">
        <div className="flex items-start gap-2">
          <div className="w-6 flex flex-col items-center gap-1 pt-1">
            <div className="w-2 h-2 rounded-full border-2 border-sewa-red" />
            <div className="w-0.5 h-6 bg-gray-200" />
            <MapPin className="w-3 h-3 text-sewa-yellow" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-xs">
              <p className="font-bold text-gray-900 truncate max-w-[200px]">{order.sender_address.name}</p>
              <p className="text-gray-500 truncate max-w-[200px]">{order.sender_address.address}</p>
              <p className="text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {order.sender_address.phone}</p>
            </div>
            <div className="text-xs border-t border-gray-200 pt-2">
              <p className="font-bold text-gray-900 truncate max-w-[200px]">{order.receiver_address.name}</p>
              <p className="text-gray-500 truncate max-w-[200px]">{order.receiver_address.address}</p>
              <p className="text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {order.receiver_address.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Price / Actions */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-bold">{order.payment_method}</span>
          <span className="font-black text-gray-900 flex items-center gap-1">
            {order.price.toLocaleString('fr-GN')} GNF
          </span>
        </div>

        <div className="flex gap-2">
          {availableNextStatuses.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(order.id, status)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1
                ${status === 'cancelled' 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-900 text-white hover:bg-black shadow-md'
                }
              `}
            >
              {status === 'cancelled' ? 'Annuler' : statusTranslations[status]}
              {status !== 'cancelled' && <ArrowRight className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
