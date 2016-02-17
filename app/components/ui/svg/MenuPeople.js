import React, { Component } from 'react';

export default class MenuPeople extends Component {
  render () {
    return (
      <g {...this.props}>
        <path
          d="M19.59,17a3.61,3.61,0,0,0-.77.09,5.73,5.73,0,0,1,.67.93,0.61,0.61,0,0,1,.08,0A2.2,2.2,0,0,1,22,20.26V23h1V20.26A3.18,3.18,0,0,0,19.59,17Z"/>
        <path d="M19.59,16a2,2,0,1,0-2-2A2,2,0,0,0,19.59,16Zm0-3a1,1,0,1,1-1,1A1,1,0,0,1,19.59,13Z"/>
        <path d="M14,15a3,3,0,1,0-3-3A3,3,0,0,0,14,15Zm0-5a2,2,0,1,1-2,2A2,2,0,0,1,14,10Z"/>
        <path
          d="M14,16a4.76,4.76,0,0,0-5,4.8V23h1V20.8A3.75,3.75,0,0,1,14,17a3.75,3.75,0,0,1,4,3.8V23h1V20.8A4.76,4.76,0,0,0,14,16Z"/>
      </g>
    );
  }
}
