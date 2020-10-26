import React, { Component } from 'react';
import styled from 'styled-components';
import { Steps, Col, Row } from 'antd';
import { PropTypes } from 'prop-types';

import { Heading } from '@gqlapp/look-client-react';

const CheckoutSteps = styled.div`
  text-align: center;
  text-shadow: 1px 0 0;
  font-size: 30px;
  margin-bottom: 19px;
`;

const Step = Steps.Step;

class CheckoutStepsComponent extends Component {
  render() {
    const { t } = this.props;
    return (
      <Col lg={24} md={24} align="left">
        <Col span={24}>
          <Row justify="center">
            <CheckoutSteps>
              <Heading type="3" align="center">
                {t('checkoutSteps.heading')}
              </Heading>
            </CheckoutSteps>
          </Row>
        </Col>
        <Row justify="center">
          <Col xl={{ span: 24, offset: 0 }} lg={24} xs={{ span: 24, offset: 6 }}>
            <Steps current={this.props.step} size="small">
              <Step title={<span className="font13">{t('checkoutSteps.step1')}</span>} />
              <Step title={<span className="font13">{t('checkoutSteps.step2')}</span>} />
              <Step title={<span className="font13">{t('checkoutSteps.step3')}</span>} />
            </Steps>
          </Col>
        </Row>
        <br />
        <br />
      </Col>
    );
  }
}
CheckoutStepsComponent.propTypes = {
  step: PropTypes.number,
  t: PropTypes.func
};
export default CheckoutStepsComponent;
