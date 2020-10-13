import React from 'react';
import { Steps, Spin, Col, Row } from 'antd';
import { PropTypes } from 'prop-types';

import settings from '@gqlapp/config';
import { PageLayout, MetaTags } from '@gqlapp/look-client-react';

import ListingFormComponent from './ListingFormComponent.web';

const { Step } = Steps;

const AddListingView = ({ t, loading, onSubmit, currentUser }) => {
  const [step, setStep] = React.useState(0);
  const steps = [
    {
      title: 'Details'
    },
    {
      title: 'Flags'
    },
    {
      title: 'Media'
    }
  ];
  return (
    <PageLayout type="forms">
      <MetaTags title={t('listAdd.title')} description={`${settings.app.name} - ${t('listAdd.meta')}`} />

      {loading ? (
        <div align="center">
          <br />
          <br />
          <br />
          <Spin size="large" />
        </div>
      ) : (
        <>
          <br />
          <br />
          <Row justify="center">
            <Col
              xl={{ span: 24, offset: 0 }}
              lg={{ span: 24, offset: 0 }}
              md={{ span: 24, offset: 0 }}
              sm={{ span: 24, offset: 0 }}
              xs={{ span: 24, offset: 6 }}
            >
              <Steps current={step}>
                {steps.map(item => (
                  <Step key={item.title} title={item.title} />
                ))}
              </Steps>
            </Col>
          </Row>
          <br />
          <br />
          <div align="center">
            <ListingFormComponent
              step={step}
              setStep={setStep}
              cardTitle="Add Listing"
              t={t}
              onSubmit={onSubmit}
              currentUser={currentUser}
            />
          </div>
        </>
      )}
    </PageLayout>
  );
};

AddListingView.propTypes = {
  t: PropTypes.func,
  loading: PropTypes.bool,
  currentUser: PropTypes.object,
  onSubmit: PropTypes.func
};

export default AddListingView;
