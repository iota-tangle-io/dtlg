import * as React from 'react';
import {Nav} from './Nav';

interface Props {}

export class Home extends React.Component<Props,{}> {
    render() {
        return (
            <div className={'container'}>
                <Nav></Nav>
            </div>
        )
    }
}