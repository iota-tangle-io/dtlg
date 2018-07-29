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
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import {TextField, WithStyles} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from '@material-ui/core/CircularProgress';

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
        marginLeft: 10,
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
});

@inject("spammerStore")
@observer
class addresselector extends React.Component<Props & WithStyles, {}> {
    changeAddress = (e: any) => {
        this.props.spammerStore.changeAddress(e.target.value);
    }

    updaterAddress = (e: any) => {
        if (e.key !== 'Enter') return true;
        this.props.spammerStore.updateAddress();
    }

    render() {
        let classes = this.props.classes;
        let {address, updating_node, address_updated} = this.props.spammerStore;
        return (
            <FormControl className={classes.formControl}>
                <TextField
                    disabled={updating_node}
                    id="name"
                    label="Target Address"
                    className={classes.textField}
                    value={address}
                    onChange={this.changeAddress}
                    onKeyDown={this.updaterAddress}
                    margin="normal"
                />
                <FormHelperText style={{fontSize: 14}}>
                    {
                        address_updated ?
                            <span style={{color: "#40d803"}}>Address updated.</span>
                            :
                            updating_node ?
                                <span>
                                    Updating...<CircularProgress className="button_loader" size={10}/>
                                </span>
                                :
                                <span
                                    style={{color: "#196486"}}>Hit enter in the field to update the target address.</span>
                    }
                </FormHelperText>
            </FormControl>
        );
    }
}

export var AddressSelector = withStyles(styles)(addresselector);