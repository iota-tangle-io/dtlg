import * as React from "react";
import {RouteComponentProps, withRouter} from "react-router";
import {inject, observer} from 'mobx-react';
import {ApplicationStore} from "../stores/AppStore";
import DevTools from 'mobx-react-devtools';
import {Route, Switch} from 'react-router-dom';
import {NotFound} from "./NotFound";
import {Nav} from './Nav';
import {Dashboard} from "./Dashboard";

declare var __DEVELOPMENT__;

interface Props extends RouteComponentProps<any> {
    appStore: ApplicationStore;
}

@inject("appStore")
@observer
class app extends React.Component<Props, {}> {
    componentWillMount() {

    }

    render() {
        return (
            <div>
                <Nav></Nav>
                <div className={"container"}>
                    <Switch>
                        <Route exact path={"/"} component={Dashboard}/>
                        <Route component={NotFound}/>
                    </Switch>
                </div>

                {__DEVELOPMENT__ ? <DevTools/> : <span></span>}
            </div>
        );
    }
}

export var App = withRouter(app);