import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Button,
  Overlay,
  Popover,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap';

import Text from './Text';
import Textarea from './Textarea';
import Select from './Select';
import Checklist from './Checklist';


export default class Editable extends Component {
  constructor(props){
      super(props);
      this.state = {
        dataType : props.dataType ? props.dataType : "text",
        name : props.name,
        mode : props.mode ? props.mode : "inline",
        disabled : props.disabled ? props.disabled : false,
        showButtons : props.showButtons != undefined ? props.showButtons : true,
        validate : props.validate ? props.validate : undefined,
        display : props.display ? props.display : undefined,

        // only used when mode is popup
        title : props.title ? props.title : null,
        placement : props.placement ? props.placement : "right",
        //Input
        bsInputClass :props.bsInputClass ? props.bsInputClass : "",
        bsInputSize :props.bsInputSize ? props.bsInputSize : "sm",
        //Select & checklist
        options : props.options ? props.options : null,
        //checklist
        optionsInline : props.inline ? props.inline : false,
        //Required for customize input
        customComponent :props.customComponent ? props.customComponent : null,
        onInputChange : props.onInputChange ?  props.onInputChange : null,
        //for internal use
        editable: false,
        valueUpdated : false,
      };

      this.setInitialValue(props);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.value != this.value){
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue(props) {
    this.validation = {};
    this.value = props.value;
  }

  setEditable = (editable) => {
    if(!this.state.disabled) this.setState({editable});
  }

  onSubmit = () => {
    this.validation = this.getValidationState();
    if(this.validation.type === "error"){
      this.setState({ valueUpdated : false});
    }else {
      if(this.props.onSubmit) {
        this.props.onSubmit(this.newValue);
      }

      this.value = this.newValue;
      this.setEditable(false)
      this.setState({ valueUpdated : true});
    }
  }

  onCancel = () => {
    if(this.props.onCancel) {
      this.props.onCancel();
    }

    this.setEditable(false);
    //reset validation
    this.validation = {};

  }

  setValueToAnchor(value, event){
    this.newValue = value;
    //To trigger onInputChange event:user defined
    if(this.props.onInputChange){
      this.props.onInputChange(event);
    }
  }

  getValueForAnchor(){
    const { dataType, options } = this.props;
    var value = this.value;

    if(dataType == "select" || dataType == "checklist"){
      if( options == null ) {
        throw("Please specify options for "+dataType+" data type");
      }
      if(value && !_.isEmpty(value)){
        const option = _.find(options, {'value' : value});
        if(option && option.text) {
          value = option.text
        }else {
          throw("No option found for specified value:"+ value)
        }
      }
    }

    if(value){
      if(this.props.display){
        return this.props.display(value);
      } else if(this.props.seperator && _.isArray(value)){
        return _.join(value, this.props.seperator);
      }else if(_.isArray(value)){
        return _.join(value, ',');
      }else if(_.isObject(value)){
        let tmp = '';
        _.forOwn(value, function(value, key) {
          tmp += key +":"+ value +" ";
        } );
        return tmp;
      }
    }

    return value;
  }

  getValidationState(){
    if(this.props.validate){
      const validate = this.props.validate(this.newValue)
      if(validate){
        return {type : 'error', msg : validate };
      }
    }
    return {type : undefined, msg : undefined };
  }
  getButtons(){
    if(this.state.showButtons){
      return (
        <div className="editable-btn" key={this.props.name+"editable-btn"}>
          <Button bsStyle="success" bsSize="xsmall" onClick={this.onSubmit.bind(this)} key={"btn-success"+this.props.name}>
            <i className="fa fa-check" key={"icon-fa-check"+this.props.name}></i></Button>
          <Button bsStyle="danger" bsSize="xsmall" onClick={this.onCancel.bind(this)} key={"btn-danger"+this.props.name}>
              <i className="fa fa-times" key={"icon-fa-times"+this.props.name}></i>
          </Button>
        </div>
      )
    }
    return null;
  }
  getContent(){
    const { editable, title, validate, showButtons,
            defaultValue, dataType, placement, mode, name
          } = this.state;

    const componetProps = {
      key: "editable-name-"+this.state.name,
      setValueToAnchor: this.setValueToAnchor.bind(this),
      value: this.value || defaultValue ,
      onSubmit: this.onSubmit.bind(this),
      setEditable: this.setEditable.bind(this),
      validation: this.validation,
    };
    const content = [];
    if (editable) {
      switch (dataType) {
        case 'text':
          content.push(<Text {...componetProps} {...this.state} />);
          break;
        case 'textarea':
          content.push(<Textarea {...componetProps} {...this.state} />);
          break;
        case 'select':
          content.push(<Select {...componetProps} {...this.state} />);
          break;
        case 'checklist':
          content.push(<Checklist {...componetProps} {...this.state} />);
          break;
        case 'custom':
          const customComponentContent = this.state.customComponent(componetProps, this.state)
          content.push(customComponentContent);
          break;
        default: throw('Please set valid dataType:'+dataType)

      }

      content.push(this.getButtons());
      if(mode == 'popup'){
        return (
          <div>
            <Overlay
                rootClose={true}
                onHide={() => { this.setEditable(false) } }
                show={editable}
                target={() => ReactDOM.findDOMNode(this.editableAnchor)}
                {...this.props}>
              <Popover id={"popover-positioned-"+placement} title={title} key={this.props.name}>
                {content}
              </Popover>
            </Overlay>
          </div>
        );
      }
      return content;
    }
  }

  render() {
    const { editable, title, validate, showButtons,
            defaultValue, dataType, mode, disabled } = this.state;
    const editableContainerClass = (disabled) ? "editable-disabled" : "editable-container";
    return (
      <div className={editableContainerClass} key={this.props.name} >
        { !(mode == 'inline' && editable)
            ? (<a ref={ref => this.editableAnchor = ref}
                  onClick={this.setEditable.bind(this, true)}
                  href="javascript:;"
                >
                  { this.getValueForAnchor() }
                </a>
              )
            : null
        }
        {this.getContent()}
      </div>
    );
  }
}

Editable.defaultProps = {
  showButtons : true,
  dataType : "text",
  mode : "inline",
  disabled : false,
  //depend on mode
  placement : "right",
};

Editable.propTypes = {
    dataType : PropTypes.string.isRequired,
    name : PropTypes.string.isRequired,
    mode : PropTypes.string,
    showButtons : PropTypes.bool,
    disabled : PropTypes.bool,
    validate : PropTypes.func,
    display: PropTypes.func,
    onInputChange : PropTypes.func,

    // only used when mode is popup
    title : PropTypes.string,
    placement : PropTypes.string,
    // for input type text
    bsInputClass :PropTypes.string,
    bsInputSize :PropTypes.string,
};
