import React from 'react';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteIcon } from '@gqlapp/look-client-react';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
// eslint-disable-next-line import/no-named-default
import { default as LISTING_ROUTES } from '@gqlapp/listing-client-react/routes';
import { NO_IMG } from '@gqlapp/listing-common';

import EditCart from './EditCart';

const Position1 = styled.h4`
  position: absolute;
  bottom: ${props => props.bottom && `${parseInt(props.bottom)}px`};
  @media only screen and (max-width: 768px) {
    bottom: ${props => props.bottom && `${parseInt(props.bottom) - 35}px`};
  }
`;
const Position = styled.h4`
  position: absolute;
  bottom: ${props => props.bottom && `${parseInt(props.bottom)}px`};
  @media only screen and (max-width: 768px) {
    bottom: ${props => props.bottom && `${parseInt(props.bottom) - 15}px`};
  }
`;

const Ribbon = styled.div`
  width: ${props => (props.width ? props.width : '150px')};
  bottom: ${props => props.bottom && props.bottom};
  background: ${props => (props.color ? props.color : 'rgb(123, 159, 199)')};

  position: absolute;
  right: 0;
  z-index: 1;
  padding: 0.15em 0.5em;
  font-size: 1.3em;
  margin: 0 0 0 -0.625em;
  line-height: 1.875em;
  text-align: center;
  color: #e6e2c8;
  border-radius: 0 0.156em 0.156em 0;
  box-shadow: -1px 2px 3px rgba(0, 0, 0, 0.5);
`;
const Align = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;
  padding-right: 10px;
  margin: 12px 20px;
`;

const CartItemComponent = props => {
  const { item, onEdit, onDelete, currentUser } = props;
  // console.log('cart item', props);
  var coverGrid = {
    xs: { span: 24 },
    md: { span: 9 },
    xxl: { span: 6 }
  };

  var infoGrid = {
    xs: { span: 24 },
    md: { span: 15 },
    xxl: { span: 18 }
  };

  if (props.mobile) {
    coverGrid = null;
    infoGrid = null;
    coverGrid = { span: 24 };
    infoGrid = { span: 24 };
  }

  return (
    <Row span={24} style={{ paddingRight: '10px' }}>
      <Align>
        <Row type="flex" justify="space-around" align="middle" gutter={12}>
          {onEdit && (
            <Col span={8}>
              <EditCart modalId={item.modalId} currentUser={currentUser} onEdit={onEdit} item={item} />
            </Col>
          )}

          <Col span={8}>
            {onDelete && (
              <DeleteIcon
                title="Are you sure to delete this order?"
                onClick={() => props.onDelete(item.id)}
                size="lg"
              />
            )}
          </Col>
        </Row>
      </Align>
      <Link target="_blank" to={`${LISTING_ROUTES.listingDetailLink}${item.modalId}`}>
        <Ribbon bottom={props.mobile ? '70px' : '105px'} width="120px" color="#df0303">
          {item.orderOptions.quantity}
        </Ribbon>
        <Ribbon bottom={props.mobile ? '15px' : '30px'}>&#8377; {` ${item.cost * item.orderOptions.quantity}`}</Ribbon>
        <Card
          // type={props.inner && 'inner'}
          // style={
          //   (props.componentStyle && props.componentStyle) || {
          //     boxShadow: '0px 1px 24px rgba(0, 0, 0, 0.12)'
          //     // maxHeight: '250px',
          //   }
          // }
          // className="order-cart-item"
          bodyStyle={{
            padding: '0px'
          }}
        >
          <Row>
            <Col
              {...coverGrid}
              align="center"
              style={{ maxHeight: props.mobile ? '130px' : '250px', overflow: 'hidden' }}
            >
              <img alt="" src={item.imageUrl || NO_IMG} height="100%" />
            </Col>
            <Col {...infoGrid}>
              <Card
                style={{ height: props.mobile ? '180px' : '250px', borderWidth: '0px' }}
                title={<h3>{item.title}</h3>}
              >
                <br />
                <h3>
                  <Position1 bottom={'100'}>
                    <span>Quantity: </span>
                  </Position1>
                </h3>

                <br />
                <br />
                <Position bottom={'30'}>
                  <strong>
                    <span>Amount</span> &#8377; {`${item.cost} X ${item.orderOptions.quantity}`}
                  </strong>
                </Position>
              </Card>
            </Col>
          </Row>
        </Card>
      </Link>
    </Row>
  );
};

CartItemComponent.propTypes = {
  item: PropTypes.object,
  currentUser: PropTypes.object,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onSubmit: PropTypes.func,
  mobile: PropTypes.func
};

export default CartItemComponent;
