import * as React from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router";
import {
    AreaChart, Area, ReferenceLine,
    LineChart, ComposedChart, Brush, XAxis, Line, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Divider from "material-ui/Divider";
import {SpammerStore, TXData} from "../stores/SpammerStore";


interface Props {
    spammerStore?: SpammerStore;
}

@withRouter
@inject("spammerStore")
@observer
export class TXLog extends React.Component<Props, {}> {
    render() {
        let txs = this.props.spammerStore.transactions;
        let entries = [];
        txs.forEach(tx => {
            entries.push(<TX key={tx.hash} tx={tx}></TX>)
        });
        return (
            <div>
                <h3>Transactions ({txs.length})</h3>
                <Divider/>
                <br/>
                <div className={'tx_log'}>
                    {entries}
                </div>
            </div>
        );
    }
}

class TX extends React.Component<{ tx: TXData }, {}> {
    render() {
        let tx = this.props.tx;
        return (
            <span className={'log_entry'}>
              TX
                <a href={`https://thetangle.org/transaction/${tx.hash}`} target="_blank">
                    <i className="fas fa-external-link-alt log_link"></i>
                </a>
              |{' '}{tx.hash}
          </span>
        );
    }
}