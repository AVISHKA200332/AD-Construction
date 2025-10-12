import React from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">🛒 Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">🛒</div>
            <div className="text-xl font-medium">Your cart is empty</div>
          </div>
        ) : (
          <>
            <table className="w-full mb-6 text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cart.map(item => (
                  <tr key={item._id ?? item._cartId}>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">Rs. {Number(item.unitPrice).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold">Rs. {(item.unitPrice * item.quantity).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeFromCart(item._id ?? item._cartId)} className="text-red-500 hover:underline text-xs">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">Rs. {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={clearCart} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Clear Cart</button>
              <button onClick={() => navigate('/checkout')} className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-lg">Checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
