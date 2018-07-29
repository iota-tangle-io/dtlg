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
import Select from "@material-ui/core/Select";
import {StyleRulesCallback, Theme} from "@material-ui/core/styles";
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import {WithStyles} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from '@material-ui/core/CircularProgress';
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
        padding: 16,
    },
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 2,
    },
    formControl: {
        width: '100%',
    },
    textField: {
        width: 300
    },
    nodeSelect: {
        width: 'auto',
    },
    nodeSelectForm: {
        display: 'inline',
        verticalAlign: 'center',
    },
    infoPoW: {
        color: "#1a25c9",
        fontWeight: 'bold',
    },
    button: {
        marginRight: theme.spacing.unit * 2,
        marginLeft: theme.spacing.unit * 2,
    },
});

@inject("spammerStore")
@observer
class powselector extends React.Component<Props & WithStyles, {}> {

    openDialog = () => {
        this.props.spammerStore.openPoWDialog();
    }

    closeDialog = () => {
        this.props.spammerStore.closePoWDialog();
    }

    changePoW = (e: any) => {
        this.props.spammerStore.changePoW(e.target.value);
    }

    updatePoW = () => {
        this.props.spammerStore.updatePoW();
    }

    render() {
        let classes = this.props.classes;
        let {previous_state, pow_dialog_open, available_pows, pow, updating_pow} = this.props.spammerStore;
        let options = available_pows.map(pow => <option key={pow} value={pow}>{pow}</option>);
        return (
            <span>

                <Button className={classes.button} onClick={this.openDialog}
                        disabled={updating_pow} variant="raised"
                >
                    <i className="fas fa-bolt icon_margin_right"></i>
                    Change PoW Method
                </Button>

                <Dialog
                    open={updating_pow || pow_dialog_open}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Change PoW</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            When creating a new transaction in IOTA, a little bit of proof of work
                            must be done by the issuer. PoW methods in their preferable order:
                            SSE, C, Go.
                            <br/>
                            <span className={classes.infoPoW}>Currently using {previous_state.pow}</span>.
                            <br/><br/>
                            Please select the wanted proof of work method (not all methods might be available):
                            <br/><br/>
                        </DialogContentText>

                        <form className={classes.container}>
                            <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="age-native-simple">Method</InputLabel>
                                <Select
                                    fullWidth
                                    native
                                    value={pow}
                                    disabled={updating_pow}
                                    onChange={this.changePoW}
                                    input={<Input id="age-native-simple"/>}
                                >
                                    {options}
                                </Select>
                            </FormControl>
                        </form>

                        {
                            updating_pow &&
                            <DialogContentText>
                                <br/>
                                Updating PoW method, this might take a while...<br/>
                                <br/>
                            </DialogContentText>
                        }

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.updatePoW} disabled={updating_pow} color="primary">
                            Change PoW
                            {
                                updating_pow &&
                                <CircularProgress className="button_loader" size={20}/>
                            }
                        </Button>
                        <Button onClick={this.closeDialog} disabled={updating_pow} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </span>
        );
    }
}

export var PoWSelector = withStyles(styles)(powselector);