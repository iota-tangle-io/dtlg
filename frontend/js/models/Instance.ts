import {Collection, Model} from "./BackOn";

export class Instance extends Model {
    address: string;
    api_token: string;
    name: string;
    desc: string;
    tags: Array<string>;
    online: boolean;
    created_on: Date;
    updated_on: Date;

    constructor(attrs?: any) {
        super(attrs);
        this.url = '/api/instances/id';
    }
}

export class Instances extends Collection<Instance> {
    constructor(models?: Array<Instance>, options?: any) {
        super(Instance, models, options);
    }
}

export class AllInstances extends Instances {
    constructor(models?: Array<Instance>, options?: any) {
        super(models, options);
        this.url = `/api/instances`;
    }
}
