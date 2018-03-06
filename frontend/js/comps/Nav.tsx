import * as React from 'react';
import axios, {AxiosPromise, AxiosResponse} from 'axios';
import {inject, observer} from "mobx-react";
import {SpammerStore} from "../stores/SpammerStore";
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

interface Props {
    spammerStore?: SpammerStore;
}

@inject("spammerStore")
@observer
export class Nav extends React.Component<Props, {}> {
    shutdown = () => {
        this.props.spammerStore.shutdownApp();
    }

    render() {
        let app_shutdown = this.props.spammerStore.app_shutdown;
        return (
            <div className={'nav'}>
                <div className={'site_title'}>Distributed Tangle Load Generator</div>
                <div className={'shutdown_button'} onClick={this.shutdown}>
                    <i className="fas fa-power-off" ></i>
                </div>

                <Dialog
                    open={app_shutdown}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">DTLG shutdown</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            DTLG was successfully shutdown, you may close this tab now.
                        </DialogContentText>
                    </DialogContent>
                </Dialog>

            </div>
        );
    }
}