import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  //The graph with ratio and bounds will visually help the trader to predict the stock span and the alert will help making the quick decision
  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {  //The task is to track their ratio along with upper bound and lower bound we need to make changes in schema
      price_abc: 'float',  //Price of stock abc to calculate ratio
      price_def: 'float',  //Price of stock def to calculate ratio
      ratio: 'float',    
      timestamp: 'date',
      upper_bound: 'float',  //To set upper bound for tracking the ratio
      lower_bound: 'float',  //To set lower bound for tracking the ratio
      trigger_alert: 'float', //An alert that is generated when bounds are crossed
      // stock: 'string',
      // top_ask_price: 'float',
      // top_bid_price: 'float',
      // timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      //elem.setAttribute('column-pivots', '["stock"]');  //Not required as we need ratio only not the prices
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio","lower_bound","upper_bound","trigger_alert"]'); //Ratio, lower bound, upper bound and alert are added in column attribute
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]as unknown as TableData);
    }
  }
}

export default Graph;
