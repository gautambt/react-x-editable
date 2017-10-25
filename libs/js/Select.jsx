import React, {Component} from 'react';
import {
  FormGroup,
  HelpBlock,
  FormControl
} from 'react-bootstrap';
export default class Select extends Component {
  constructor(props){
    super(props);
    this.state = {
      value : props.value,
      options : this.setInitialOptions()
    };
  }
  setInitialOptions = () => {
    const options = this.props.options;
    return options;
  }
  getValue = () =>{
    return this.state.value;
  }
  setValue = (e) =>{
    this.setState({ value: e.target.value });
    this.props.setValueToAnchor(e.target.value, e);
  }
  onBlur(e){
    if( !this.props.showButtons ){
      this.setValue(e);
      this.props.onSubmit();
    }
  }
  getOptions(){
    if( this.props.options == null ) {
      throw("Please specify options for select element");
    }
    const options = this.props.options.map( option =>
      (<option value={option.value} key={"option-"+option.value}>{option.text}</option>)
    );
    return options;
  }
  handleKeyDown(target) {
    if(target.keyCode == 13){
      this.setValue(target);
      this.props.onSubmit();
    }else if(target.keyCode == 27){
      this.props.setEditable(false)
    }
  }
  render(){
    return (
        <FormGroup controlId="formControlsSelect" validationState={this.props.validation.type} >
            <FormControl
                componentClass="select"
                placeholder="select"
                bsSize="small"
                key={"form-control-"+this.props.name}
                value={ this.getValue() }
                onChange={this.setValue.bind(this)}
                onBlur={this.onBlur.bind(this)}
                onKeyDown={this.handleKeyDown.bind(this)}
            >
              {this.getOptions()}
            </FormControl>
            <HelpBlock>{this.props.validation.msg}</HelpBlock>
          </FormGroup>
        )
  }
}
