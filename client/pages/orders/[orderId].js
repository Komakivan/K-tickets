import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timer, setTimer] = useState(0);

  const { doRequest, errors } = useRequest({
    method: 'post',
    url: '/api/payments',
    body: { orderId: order.id },
    onSuccess: () => Router.push('/orders'),
  });

  console.log(errors);

  useEffect(() => {
    const remainingTime = () => {
      const timeLeft = new Date(order.expiresAt) - new Date();
      setTimer(Math.round(timeLeft / 1000));
    };

    remainingTime();
    const timerId = setInterval(remainingTime, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  return (
    <div className='mt-5'>
      <div>Order Id: {order.id}</div>
      {timer < 0 ? (
        <p>Sorry this order is expired</p>
      ) : (
        <>
          <p>Ticket Title: {order.ticket?.title}</p>
          <p>Time left to Pay: {timer} seconds</p>
          <StripeCheckout
            token={({ id }) => doRequest({ token: id })}
            stripeKey='pk_test_51NsooJSBw4VsGvboHQyj6K9pLm9lFyzDxYSWtDEUus4Ajv8ICGZ3aV9FMXRroaRhGEFGqlGHShWvXr9zs5MCqwZn00CpvjmLyo'
            amount={order.ticket?.price * 100}
            email={currentUser?.email}
          />
          {errors}
        </>
      )}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
