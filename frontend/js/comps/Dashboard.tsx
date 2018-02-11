import * as React from 'react';
import {inject, observer} from "mobx-react";
import Grid from "material-ui/Grid";
import {SpammerStore} from "../stores/SpammerStore";
import Button from "material-ui/Button";
import withStyles from "material-ui/styles/withStyles";
import {StyleRulesCallback, Theme} from "material-ui/styles";
import {WithStyles} from "material-ui";
import {TPSChart} from "./TPSChart";
import {ErrorRateChart} from "./ErrorRateChart";
import Paper from "material-ui/Paper";
import Divider from "material-ui/Divider";
import {TXLog} from "./TXLog";
import Chip from "material-ui/Chip";
import Avatar from "material-ui/Avatar";
import Select from "material-ui/Select";
import Input, {InputLabel} from 'material-ui/Input';
import {FormControl, FormHelperText} from 'material-ui/Form';
import {MenuItem} from 'material-ui/Menu';
import {NodeSelector} from "./NodeSelector";
import {SnackbarContent} from 'material-ui/Snackbar';
import Snackbar from 'material-ui/Snackbar';

import {CircularProgress} from 'material-ui/Progress';
import {NodeEnterModal} from "./NodeEnterModal";
import Tooltip from 'material-ui/Tooltip';

interface Props {
    spammerStore: SpammerStore;
}

const styles: StyleRulesCallback = (theme: Theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    paper: {
        padding: 16,
    },
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 2,
    },
    button: {
        marginRight: theme.spacing.unit * 2,
    },
    divider: {
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 3,
    },
    chip: {
        marginRight: theme.spacing.unit,
    },
    lastMetricInfo: {
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit,
    },
    formControl: {
        height: 80
    },
    nodeSelect: {
        width: 200,
    },
    nodeSelectForm: {
        display: 'inline',
        verticalAlign: 'center',
    },
    tooltip: {
        fontSize: 20,
    },
});

@inject("spammerStore")
@observer
class dashboard extends React.Component<Props & WithStyles, {}> {
    componentWillMount() {
        this.props.spammerStore.connect();
    }

    start = () => {
        this.props.spammerStore.start();
    }

    stop = () => {
        this.props.spammerStore.stop();
    }

    render() {
        let {running, connected, last_metric, node, disable_controls} = this.props.spammerStore;
        let {starting, stopping} = this.props.spammerStore;
        let classes = this.props.classes;

        if (!connected) {
            return (
                <Grid>
                    <h3>Waiting for WebSocket connection...</h3>
                </Grid>
            );
        }

        return (
            <Grid>
                <h1>Dashboard</h1>
                <Grid container className={classes.root}>
                    <Grid item xs={12} lg={12}>

                        <NodeEnterModal/>

                        <Button className={classes.button} onClick={this.start}
                                disabled={running || disable_controls} variant="raised"
                        >
                            <i className="fas fa-play icon_margin_right"></i>
                            {running ? "Running..." : "Start"}
                            {
                                starting &&
                                <CircularProgress className="button_loader" size={20}/>
                            }
                        </Button>

                        <Button onClick={this.stop} className={classes.button}
                                disabled={!running || disable_controls} variant="raised"
                        >
                            <i className="fas fa-stop icon_margin_right"></i>
                            {stopping ? "STOPPING..." : "Stop"}
                            {
                                stopping &&
                                <CircularProgress className="button_loader" size={20}/>
                            }
                        </Button>

                        <Snackbar
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            open={stopping || starting}
                            autoHideDuration={6000}
                            onClose={() => {
                            }}
                            SnackbarContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={
                                <span id="message-id" className={'start_stop_snackbar'}>
                                    {
                                        starting &&
                                        <span>
                                            Starting: this will take some time...{' '}
                                        </span>
                                    }
                                    {
                                        stopping &&
                                        <span>
                                            Stopping: waiting for current PoW cycle to finish... {' '}
                                        </span>
                                    }
                                    <CircularProgress color={"secondary"} className="start_stop_loader" size={20}/>
                                </span>
                            }
                        />

                        <NodeSelector/>

                        {
                            last_metric &&
                            <div className={classes.lastMetricInfo}>
                                <Tooltip id="tooltip-icon" classes={{popper: classes.tooltip}}
                                         className={classes.tooltip}
                                         title="Times a DTLG TX used another DTLG TX as branch"
                                         placement="top">
                                    <Chip label={"Branch " + last_metric.bad_branch} className={classes.chip}/>
                                </Tooltip>
                                <Tooltip id="tooltip-icon" title="Times a DTLG TX used another DTLG TX as trunk"
                                         placement="top">
                                    <Chip label={"Trunk " + last_metric.bad_trunk} className={classes.chip}/>
                                </Tooltip>
                                <Tooltip id="tooltip-icon"
                                         title="Times a DTLG TX used other DTLG TXs as trunk and branch"
                                         placement="top">
                                    <Chip label={"B&T " + last_metric.bad_trunk_and_branch} className={classes.chip}/>
                                </Tooltip>
                                <Tooltip id="tooltip-icon" title="Times a DTLG TX used a milestone as branch"
                                         placement="top">
                                    <Chip label={"Milestone Branch " + last_metric.milestone_branch}
                                          className={classes.chip}/>
                                </Tooltip>
                                <Tooltip id="tooltip-icon" title="Times a DTLG TX used a milestone as trunk"
                                         placement="top">
                                    <Chip label={"Milestone Trunk " + last_metric.milestone_trunk}
                                          className={classes.chip}/>
                                </Tooltip>
                                <Tooltip id="tooltip-icon" title="Amount of succeeded TXs" placement="top">
                                    <Chip label={"TX succeeded " + last_metric.txs_succeeded} className={classes.chip}/>
                                </Tooltip>
                                <Tooltip id="tooltip-icon" title="Amount of failed TXs to broadcast" placement="top">
                                    <Chip label={"TX failed " + last_metric.txs_failed} className={classes.chip}/>
                                </Tooltip>
                            </div>
                        }
                    </Grid>
                </Grid>

                <Grid container className={classes.root}>
                    <Grid item xs={12} lg={6}>
                        <Paper className={classes.paper}>
                            <h3>TPS {Math.floor(last_metric.tps * 100) / 100}</h3>
                            <Divider className={classes.divider}/>
                            <TPSChart/>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Paper className={classes.paper}>
                            <h3>Error Rate {Math.floor(last_metric.error_rate * 100) / 100}%</h3>
                            <Divider className={classes.divider}/>
                            <ErrorRateChart/>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid item xs={12} lg={12} className={classes.root}>
                    <Paper className={classes.paper}>
                        <TXLog/>
                    </Paper>
                </Grid>

            </Grid>
        );
    }
}

export var Dashboard = withStyles(styles)(dashboard);