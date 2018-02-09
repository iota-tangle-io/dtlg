import * as React from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router";
import {
    AreaChart, Area, ReferenceLine,
    LineChart, ComposedChart, Brush, XAxis, Line, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {SpammerStore} from "../stores/SpammerStore";
import dateformat from 'dateformat';

interface Props {
    spammerStore?: SpammerStore;
}

@withRouter
@inject("spammerStore")
@observer
export class TPSChart extends React.Component<Props, {}> {
    xFormat = (val) => {
        return dateformat(new Date(val), 'HH:MM:ss')
    }
    tooltipFormat = (val) => {
        return dateformat(new Date(val), 'dd.mm.yy HH:MM:ss')
    }
    tooltipValFormat = (val) => {
        return "TPS: " + Math.floor(val * 100) / 100;

    }
    render() {
        let tpsData = this.props.spammerStore.tps;
        return (
            <div>
                <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={tpsData} syncId="tps">
                        <XAxis dataKey="ts" tickFormatter={this.xFormat}/>
                        <YAxis/>
                        <CartesianGrid strokeDasharray="2 2"/>
                        <Tooltip labelFormatter={this.tooltipFormat} formatter={this.tooltipValFormat}/>
                        <Legend/>
                        <Line type="linear" isAnimationActive={false} name="TPS" dataKey="value"
                              fill="#27da9f" stroke="#27da9f" dot={false} activeDot={{r: 4}}/>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        );
    }
}