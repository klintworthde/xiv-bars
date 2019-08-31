/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import XIVAPI from 'xivapi-js';
import { storeAction, updateTooltip } from '../../actions';
import styles from './styles.scss';

function mapDispatchToProps(dispatch) {
  return {
    storeAction: action => dispatch(storeAction(action)),
    updateTooltip: action => dispatch(updateTooltip(action))
  };
}

const api = new XIVAPI();

class Action extends Component {
  constructor(props) {
    super(props);
    this.el = React.createRef();
    this.state = {
      hovering: false,
      dragging: false
    };
  }

  async getTooltip(action, event) {
    const content = await api.data.get('Action', action.ID);
    const elRect = this.el.current.getBoundingClientRect();
    const position = {
      left: elRect.left,
      right: elRect.left + elRect.width,
      top: elRect.top,
      bottom: elRect.top + elRect.height
    };

    const details = {
      content,
      position
    };

    this.props.updateTooltip({ event, details, visible: true });
  }

  hideTooltip() {
    this.props.updateTooltip({ event: null, details: null, visible: false });
  }

  handleMouseLeave() {
    this.setState({ hovering: false });
    this.hideTooltip();
  }

  handleMouseMove(action, event) {
    const { hovering } = this.state;
    const targetId = event.currentTarget.getAttribute('data-action-id');

    if (action.ID.toString() === targetId.toString() && !hovering) {
      this.setState({ hovering: true });
      this.getTooltip(action, event);
    }
  }

  handleDragStart(selectedAction) {
    this.setState({ dragging: true });
    this.hideTooltip();
    this.props.storeAction({ selectedAction });
  }

  handleDragEnd() {
    this.setState({ dragging: false });
  }

  render() {
    const { action, slotted } = this.props;
    const { dragging } = this.state;

    return (
      <React.Fragment>
        <div
          className={`${styles.action} ${dragging ? styles.dragging : ''}`}
          draggable
          onDragStart={() => { this.handleDragStart(action); }}
          onDragEnd={() => { this.handleDragEnd(); }}
          onMouseMove={(event) => { this.handleMouseMove(action, event); }}
          onMouseLeave={() => { this.handleMouseLeave(); }}
          ref={this.el}
          data-action-id={action.ID}
          data-slotted={slotted}
        >
          <img src={action.Icon} alt={action.Name} />
        </div>
      </React.Fragment>
    );
  }
}

export default connect(null, mapDispatchToProps)(Action);

Action.propTypes = {
  action: PropTypes.shape().isRequired,
  storeAction: PropTypes.func.isRequired,
  updateTooltip: PropTypes.func.isRequired,
  slotted: PropTypes.bool
};

Action.defaultProps = {
  slotted: false
};
