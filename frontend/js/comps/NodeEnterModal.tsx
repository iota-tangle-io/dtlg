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
import {StyleRulesCallback, Theme} from "@material-ui/core/styles";
import {TextField, WithStyles} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from "@material-ui/core/Button";

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