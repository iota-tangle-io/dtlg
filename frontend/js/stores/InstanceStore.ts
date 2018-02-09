import {action, computed, observable, ObservableMap, runInAction} from "mobx";
import {AllInstances, Instance} from "../models/Instance";

export class InstanceStore {
    @observable instances: ObservableMap<Instance> = observable.map();

    @action
    async fetchInstances() {
        try {
            let instances = new AllInstances();
            await instances.fetch()
            runInAction('fetchInstances', () => {
                instances.models.sort((a, b) => a.name > b.name ? 1 : -1);
                instances.models.forEach(inst => this.instances.set(inst.id.toString(), inst));
            });
        } catch (err) {
            console.error(err)
        }
    }

    @computed
    get instancesArray(): Array<Instance> {
        let array = [];
        this.instances.forEach(inst => array.push(array));
        return array;
    }


}

// maybe should've picked another name
export let InstanceStoreInstance = new InstanceStore();