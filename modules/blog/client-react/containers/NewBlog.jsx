import React from 'react';

import { translate } from '@gqlapp/i18n-client-react';
import { message } from 'antd';
import NewBlogView from '../components/NewBlogView';
import { model } from '../demoData';

class NewBlog extends React.Component {
  onSubmit = value => {
    message.loading('Please wait...', 0);
    try {
      console.log(value);
    } catch (e) {
      message.destroy();
      message.error('Submission error. Please try again');
      throw Error(e);
    }
    message.destroy();
    message.success('Submission success');
  };

  render() {
    return <NewBlogView onSubmit={this.onSubmit} model={model} {...this.props} />;
  }
}

export default translate('blog')(NewBlog);
