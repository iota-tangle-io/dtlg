import * as React from 'react';
import {inject, observer} from "mobx-react";
import {
    Area,
    AreaChart,
    Brush,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {SpammerStore} from "../stores/SpammerStore";
import dateformat from 'dateformat';

interface Props {
    spammerStore?: SpammerStore;
}

@inject("spammerStore")
@observer
export class ConfirmationRateChart extends React.Component<Props, {}> {
    xFormat = (tickItem) => {
        return dateformat(new Date(tickItem), 'HH:MM:ss')
    }
    tooltipFormat = (val) => {
        return dateformat(new Date(val), 'dd.mm.yy HH:MM:ss')
    }

    render() {
        let confirmationRate = this.props.spammerStore.confirmationRate;
        return (

            <div>
                <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={confirmationRate} syncId="confirmation_rate">
                        <XAxis dataKey="ts" tickFormatter={this.xFormat}/>
                        <YAxis/>
                        <CartesianGrid strokeDasharray="2 2"/>
                        <Tooltip labelFormatter={this.tooltipFormat}/>
                        <Legend/>
                        <Line type="linear" isAnimationActive={false} name="Confirmation Rate" dataKey="value"
                              fill="#000000" stroke="#000000" dot={false} activeDot={{r: 8}}/>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        );
    }
}