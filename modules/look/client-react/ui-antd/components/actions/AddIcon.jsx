import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

class AddIcon extends React.Component {
  render() {
    const { color = 'default', type, size, ...props } = this.props;

    let buttonSize = 'default';

    if (size === 'sm') {
      buttonSize = 'small';
    } else if (size === 'lg') {
      buttonSize = 'large';
    }
    let style = { ...props.style };

    if (color === 'default') {
      style = {
        ...style,
        border: '1px solid #1890ff',
        color: '#1890ff'
      };
    }
    return (
      <Button type={color} htmlType={type} size={buttonSize} icon="plus" shape="circle" style={style} {...props} />
    );
  }
}

AddIcon.propTypes = {
  color: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string
};

export default AddIcon;
