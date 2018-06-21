import React, { Component } from 'react';
 
// Vote component - represents a single vote
export default class Vote extends Component {
  render() {
    return (
      <li>{this.props.vote.text}</li>
    );
  }
}