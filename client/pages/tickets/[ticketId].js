import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId: ticket.id },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  const onPurchase = () => {
    doRequest();
  };

  return (
    <div>
      <div className='mt-5'>
        <h4>Title: {ticket.title}</h4>
        <p>Price: ${ticket.price}</p>
        {errors}
        <button onClick={onPurchase} className='btn btn-primary'>
          Purchase
        </button>
      </div>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;

  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
