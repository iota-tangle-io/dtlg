import {Collection, Model} from "./BackOn";
import {observable, ObservableMap} from "mobx";

export class Config extends Model {

    constructor(attrs?: any) {
        super(attrs);
        this.url = '/api/config';
        this.noIDInURI = true;
    }
}