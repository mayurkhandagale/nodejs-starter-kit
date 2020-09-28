import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button, Card, Divider } from 'antd';

import CartItemComponent from './CartItemComponent';
import { TotalPrice } from './CheckoutCartView';

const OrderCardComponent = props => {
  const { getCart, SubmitButton, product, showBtn, btnDisabled, onSubmit, buttonText } = props;

  return (
    <Card align="left" style={{ height: '100%' }}>
      <h3 className="OrderHead">Order summary</h3>
      <br />
      <hr />
      <br />
      {getCart &&
        getCart.orderDetails &&
        getCart.orderDetails.length !== 0 &&
        getCart.orderDetails.map((item, key) => (
          <>
            <CartItemComponent inner={true} key={key} item={item} />
            <Divider />
          </>
        ))}
      <hr />
      <br />
      <h3 className="OrderHead">
        <u>Cart Summary</u>
      </h3>
      {/* {paid === true ? (
          <h3 className="lightText">
            Total amount{' '}
            <strong className="rightfloat">
              &#8377;
              {` ${TotalPrice(getCart && getCart.orderDetails.length !== 0 && getCart.orderDetails)}`}
            </strong>
          </h3>
        ) : ( */}
      <br />
      <div style={{ lineHeight: '12px' }}>
        <h3 className="rentAmount">
          Total amount
          <h2 style={{ float: 'right' }}>
            &#8377;
            {` ${TotalPrice(getCart && getCart.orderDetails.length !== 0 && getCart.orderDetails)}`}
          </h2>
        </h3>
      </div>
      {/* )} */}
      {getCart.paid === true ? (
        <h4 className="lightText">
          You paid <strong className="colorFloat"> &#8377; {TotalPrice(getCart)}</strong>
          <h6 className="PaidMethodColor">{product.youPaid.method}</h6>
        </h4>
      ) : null}
      <br />
      <div align="right">
        {showBtn &&
          (SubmitButton ? (
            <SubmitButton />
          ) : (
            <Button type="primary" onClick={onSubmit} disabled={btnDisabled} size="large">
              {buttonText}
              <Icon type="arrow-right" />
            </Button>
          ))}
      </div>
    </Card>
  );
};

OrderCardComponent.propTypes = {
  getCart: PropTypes.object,
  SubmitButton: PropTypes.Component,
  product: PropTypes.object,
  showBtn: PropTypes.bool,
  btnDisabled: PropTypes.bool,
  onSubmit: PropTypes.func,
  buttonText: PropTypes.string
};

export default OrderCardComponent;
