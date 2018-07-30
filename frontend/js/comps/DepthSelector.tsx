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
class depthselector extends React.Component<Props & WithStyles, {}> {
    changeDepth = (e: any) => {
        this.props.spammerStore.changeDepth(parseInt(e.target.value));
    }

    updateDepth = (e: any) => {
        if (e.key !== 'Enter') return true;
        this.props.spammerStore.updateDepth();
    }

    render() {
        let classes = this.props.classes;
        let {depth, disable_controls, updating_depth, depth_updated} = this.props.spammerStore;
        return (
            <FormControl className={classes.formControl}>
                <TextField
                    disabled={updating_depth}
                    type="number"
                    id="name"
                    label="Depth"
                    className={classes.textField}
                    value={depth}
                    onChange={this.changeDepth}
                    onKeyDown={this.updateDepth}
                    margin="normal"
                />
                <FormHelperText style={{fontSize: 14}}>
                    {
                        depth_updated ?
                            <span style={{color: "#40d803"}}>Depth updated.</span>
                            :
                            updating_depth ?
                                <span>
                                    Updating...<CircularProgress className="button_loader" size={10}/>
                                </span>
                                :
                                <span style={{color: "#196486"}}>Hit enter in the field to update the depth.</span>
                    }
                </FormHelperText>
            </FormControl>
        );
    }
}

export var DepthSelector = withStyles(styles)(depthselector);