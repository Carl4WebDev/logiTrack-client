
const OrdersTable = ({ orders, onCreateShipment }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">Order ID</th>
            <th className="p-3 text-left">Customer Name</th>
            <th className="p-3 text-left">Address</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="p-3">{order.id}</td>
              <td className="p-3">{order.customer}</td>
              <td className="p-3">{order.address}</td>
              <td className="p-3">
                <button
                  onClick={() => onCreateShipment(order)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Create Shipment
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
