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
    formControl: {},
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
class nodeselector extends React.Component<Props & WithStyles, {}> {
    changeNode = (e: any) => {
        this.props.spammerStore.changeNode(e.target.value);
    }

    updateNode = (e: any) => {
        if (e.key !== 'Enter') return true;
        this.props.spammerStore.updateNode();
    }

    render() {
        let classes = this.props.classes;
        let {node, disable_controls, updating_node, node_updated, node_valid} = this.props.spammerStore;
        return (
            <FormControl className={classes.formControl}>
                <TextField
                    disabled={updating_node}
                    id="name"
                    label="Node"
                    className={classes.textField}
                    value={node}
                    onChange={this.changeNode}
                    onKeyDown={this.updateNode}
                    margin="normal"
                />
                <FormHelperText error={!node_valid} style={{fontSize: 14}}>
                    {
                        node_updated ?
                            <span style={{color: "#40d803"}}>Node updated.</span>
                            :
                            updating_node ?
                                <span>
                                    Updating...<CircularProgress className="button_loader" size={10}/>
                                </span>
                                :
                                node_valid ?
                                    <span style={{color: "#196486"}}>Hit enter in the field to update the node.</span>
                                    :
                                    "Node URL not valid"

                    }
                </FormHelperText>
            </FormControl>
        );
    }
}

export var NodeSelector = withStyles(styles)(nodeselector);