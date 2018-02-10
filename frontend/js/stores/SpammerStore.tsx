///<reference path="../../../node_modules/mobx/lib/api/computed.d.ts"/>
import {action, computed, observable, ObservableMap, runInAction} from "mobx";
import dateformat from 'dateformat';
import validUrl from 'valid-url';

let MsgType = {
    START: 1,
    STOP: 2,
    METRIC: 3,
    STATE: 4,
    CHANGE_NODE: 5,
};

class StateMsg {
    running: boolean;
    node: string;
}

class WsMsg {
    msg_type: number;
    data: any;
    ts: Date;
}

let MetricType = {
    INC_MILESTONE_BRANCH: 0,
    INC_MILESTONE_TRUNK: 1,
    INC_BAD_TRUNK: 2,
    INC_BAD_BRANCH: 3,
    INC_BAD_TRUNK_AND_BRANCH: 4,
    INC_FAILED_TX: 5,
    INC_SUCCESSFUL_TX: 6,
    SUMMARY: 7,
}

export class TXData {
    hash: string;
    count: number;
    created_on: Date;
}

export class MetricSummary {
    txs_succeeded: number = 0;
    txs_failed: number = 0;
    bad_branch: number = 0;
    bad_trunk: number = 0;
    bad_trunk_and_branch: number = 0;
    milestone_trunk: number = 0;
    milestone_branch: number = 0;
    tps: number = 0;
    error_rate: number = 0;
}

export class Metric {
    id: string;
    kind: number;
    data: any;
    ts: Date;
}

export class SpammerStore {
    @observable running: boolean = false;
    @observable connected: boolean = false;
    @observable metrics: ObservableMap<Metric> = observable.map();
    @observable txs: ObservableMap<Metric> = observable.map();
    @observable last_metric: MetricSummary = new MetricSummary();
    @observable disable_controls: boolean = false;
    @observable starting: boolean = false;
    @observable stopping: boolean = false;
    @observable previous_state: StateMsg = new StateMsg();
    @observable enter_node_modal_open: boolean = false;

    @observable node: string = "";
    @observable node_valid: boolean = false;
    @observable updating_node: boolean = false;
    @observable node_updated: boolean = false;
    first_node_update_done: boolean = false;

    ws: WebSocket = null;
    nextMetricID: number = 0;

    async connect() {
        // pull metrics from server
        this.ws = new WebSocket(`ws://${location.host}/api/spammer`);

        this.ws.onmessage = (e: MessageEvent) => {
            let obj: WsMsg = JSON.parse(e.data);

            switch (obj.msg_type) {
                case MsgType.METRIC:
                    let metric: Metric = obj.data;
                    metric.ts = obj.ts;

                    switch (metric.kind) {

                        case MetricType.SUMMARY:
                            runInAction('add metric', () => {
                                this.nextMetricID++;
                                this.metrics.set(this.nextMetricID.toString(), metric);
                                this.last_metric = metric.data;
                            });
                            break;

                        case MetricType.INC_SUCCESSFUL_TX:
                            runInAction('add tx', () => {
                                let tx: TXData = metric.data;
                                this.txs.set(tx.hash, metric);
                            });
                            break;
                    }

                    break;

                case MsgType.STATE:
                    let stateMsg: StateMsg = obj.data;
                    runInAction('update state', () => {
                        // unblock after start/stop happened
                        if (this.running !== stateMsg.running) {
                            this.disable_controls = false;
                        }
                        if (this.running && !stateMsg.running) {
                            this.stopping = false;
                            this.starting = false;
                        }
                        if (!this.running && stateMsg.running) {
                            this.starting = false;
                            this.stopping = false;
                        }
                        if (this.previous_state.node !== stateMsg.node) {
                            this.disable_controls = false;
                            this.updating_node = false;
                            this.node_updated = true;
                        }

                        if (!this.node && stateMsg.node && !this.first_node_update_done) {
                            this.node = stateMsg.node;
                            this.first_node_update_done = true;
                        }

                        if (!stateMsg.node) {
                            this.disable_controls = true;
                            this.enter_node_modal_open = true;
                        } else {
                            this.enter_node_modal_open = false;
                        }

                        this.previous_state = stateMsg;
                        this.running = stateMsg.running;
                    });
                    break;
                default:
                    console.log(obj);
            }
        };

        this.ws.onopen = (e) => {
            runInAction('websocket open', () => {
                this.connected = true;
            });
        };

        this.ws.onclose = (e) => {
            runInAction('websocket closed', () => {
                this.connected = false;
            });
        };
    }

    @action
    closeEnterNodeModal() {
        this.enter_node_modal_open = false;
        this.updateNode();
    }

    @action
    changeNode(nodeURL: string) {
        this.node = nodeURL;
        this.node_updated = false;
        this.node_valid = validUrl.isWebUri(this.node) ? true : false;
    }

    @action
    updateNode() {
        if (!this.connected) return;
        let msg = new WsMsg();
        msg.msg_type = MsgType.CHANGE_NODE;
        msg.data = this.node;
        this.disable_controls = true;
        this.updating_node = true;
        this.ws.send(JSON.stringify(msg));
    }

    @action
    start() {
        if (!this.connected) return;
        let msg = new WsMsg();
        msg.msg_type = MsgType.START;
        this.disable_controls = true;
        this.starting = true;
        this.ws.send(JSON.stringify(msg));
    }

    @action
    stop() {
        if (!this.connected) return;
        let msg = new WsMsg();
        msg.msg_type = MsgType.STOP;
        this.disable_controls = true;
        this.stopping = true;
        this.ws.send(JSON.stringify(msg));
    }

    @computed
    get tps(): Array<any> {
        let a = [];
        this.metrics.forEach(metric => {
            a.push({
                ts: new Date(metric.ts).getTime(),
                value: metric.data.tps,
            });
        });
        a.sort((a, b) => a.ts < b.ts ? -1 : 1);
        return a;
    }

    @computed
    get errorRate(): Array<any> {
        let a = [];
        this.metrics.forEach(metric => {
            let d: MetricSummary = metric.data;
            a.push({
                ts: new Date(metric.ts).getTime(),
                value: d.error_rate,
            });
        });
        a.sort((a, b) => a.ts < b.ts ? -1 : 1);
        return a;
    }

    @computed
    get transactions(): Array<any> {
        let a = [];
        this.txs.forEach(metricTxs => {
            let data: TXData = metricTxs.data;
            data.created_on = metricTxs.ts;
            a.push(data);
        });
        a.sort((a, b) => a.created_on > b.created_on ? -1 : 1);
        return a;
    }

}

export let SpammerStoreInstance = new SpammerStore();