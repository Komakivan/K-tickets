const OrderIndex = ({ orders }) => {
  return (
    <div className='mt-5'>
      <div>My orders</div>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrderIndex;
