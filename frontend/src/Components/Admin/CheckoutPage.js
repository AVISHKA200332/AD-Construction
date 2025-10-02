import React, { useState } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from './invoicePdfUtil';
import inventoryService from '../../services/inventoryService';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderId] = useState(() => Math.floor(Math.random() * 1000000));
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow up to 10 digits, numbers only
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setCustomer({ ...customer, phone: digits });
    } else {
      setCustomer({ ...customer, [name]: value });
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    // Update inventory for each item in cart
    try {
      await Promise.all(
        cart.map(item =>
          inventoryService.orderItem(item._id, item.quantity)
        )
      );
    } catch (err) {
      // Optionally handle error (show error message)
      console.error('Error updating inventory:', err);
    }
    // Save order data before clearing cart
    setOrderData({
      orderId,
      customer: { ...customer },
      cart: [...cart],
      total
    });
    setShowInvoice(true);
    clearCart();
  };

  if (showInvoice && orderData) {
    const { orderId, customer, cart, total } = orderData;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-t-8 border-blue-600 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">INVOICE</h2>
              <div className="text-gray-500 text-sm">Order #{orderId}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-700">AD Construction</div>
              <div className="text-xs text-gray-400">Colombo, Sri Lanka</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-700">Billed To:</div>
            <div>{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.email} | {customer.phone}</div>
            <div className="text-sm text-gray-500">{customer.address}</div>
          </div>
          <table className="w-full mb-6 text-sm">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-right">Unit Price</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cart.map(item => (
                <tr key={item._id}>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">Rs. {Number(item.unitPrice).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">Rs. {(item.unitPrice * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mb-2">
            <div className="text-lg font-bold">Total: <span className="text-blue-600">Rs. {total.toLocaleString()}</span></div>
          </div>
          <div className="flex justify-between items-center mt-8 gap-3">
            <div className="text-xs text-gray-400">Thank you for your business!</div>
            <button
              onClick={() => generateInvoicePDF({ orderId, customer, cart, total })}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-lg"
            >
              Download PDF
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border-t-8 border-blue-600">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Checkout</h2>
        <form onSubmit={handleCheckout}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input type="text" name="name" value={customer.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input type="email" name="email" value={customer.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={customer.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={10}
              pattern="\d{10}"
              title="Please enter a 10-digit phone number"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <textarea name="address" value={customer.address} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">Rs. {total.toLocaleString()}</span>
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-lg text-lg">Complete Order & Generate Invoice</button>
        </form>
      </div>
    </div>
  );
}
