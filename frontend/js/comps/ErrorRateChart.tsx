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
export class ErrorRateChart extends React.Component<Props, {}> {
    xFormat = (tickItem) => {
        return dateformat(new Date(tickItem), 'HH:MM:ss')
    }
    tooltipFormat = (val) => {
        return dateformat(new Date(val), 'dd.mm.yy HH:MM:ss')
    }

    render() {
        let errorRate = this.props.spammerStore.errorRate;
        return (

            <div>
                <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={errorRate} syncId="error_rate">
                        <XAxis dataKey="ts" tickFormatter={this.xFormat}/>
                        <YAxis/>
                        <CartesianGrid strokeDasharray="2 2"/>
                        <Tooltip labelFormatter={this.tooltipFormat}/>
                        <Legend/>
                        <Line type="linear" isAnimationActive={false} name="Error Rate" dataKey="value"
                              fill="#db172a" stroke="#db172a" dot={false} activeDot={{r: 8}}/>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        );
    }
}