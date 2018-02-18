import * as React from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router";
import {
    AreaChart, Area, ReferenceLine,
    LineChart, ComposedChart, Brush, XAxis, Line, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {SpammerStore} from "../stores/SpammerStore";
import Select from "material-ui/Select";
import {StyleRulesCallback, Theme} from "material-ui/styles";
import Input, {InputLabel} from 'material-ui/Input';
import {FormControl, FormHelperText} from 'material-ui/Form';
import {MenuItem} from 'material-ui/Menu';
import {WithStyles, TextField} from "material-ui";
import withStyles from "material-ui/styles/withStyles";
import {CircularProgress} from 'material-ui/Progress';


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
                <FormHelperText error={!node_valid}>
                    {
                        node_updated ?
                            "Node updated."
                            :
                            updating_node ?
                                <span>
                                    Updating...<CircularProgress className="button_loader" size={10}/>
                                </span>
                                :
                                node_valid ?
                                    "Hit enter to save."
                                    :
                                    "Node URL not valid!"

                    }
                </FormHelperText>
            </FormControl>
        );
    }
}

export var NodeSelector = withStyles(styles)(nodeselector);