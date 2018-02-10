import * as React from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router";
import {
    AreaChart, Area, ReferenceLine,
    LineChart, ComposedChart, Brush, XAxis, Line, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {SpammerStore} from "../stores/SpammerStore";
import {StyleRulesCallback, Theme} from "material-ui/styles";
import {WithStyles, TextField} from "material-ui";
import withStyles from "material-ui/styles/withStyles";
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from "material-ui/Button";

interface Props {
    spammerStore?: SpammerStore;
}

const styles: StyleRulesCallback = (theme: Theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    paper: {
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
});

@withRouter
@inject("spammerStore")
@observer
class nodeentermodel extends React.Component<Props & WithStyles, {}> {

    handleClose = () => {
        this.props.spammerStore.closeEnterNodeModal();
    }

    handleNodeChange = (e: any) => {
        this.props.spammerStore.changeNode(e.target.value);
    }

    render() {
        let classes = this.props.classes;
        let {enter_node_modal_open, node, node_valid} = this.props.spammerStore;
        return (
            <Dialog
                open={enter_node_modal_open}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Setup Node</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter an IRI node URL which DTLG will be using for tip selection
                        and transaction broadcasting. The schema is http://host_address:port.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="IRI Node Address"
                        type="email"
                        value={node}
                        onChange={this.handleNodeChange}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button disabled={!node_valid} onClick={this.handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export var NodeEnterModal = withStyles(styles)(nodeentermodel);