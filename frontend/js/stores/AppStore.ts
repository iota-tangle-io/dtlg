import {observable, action} from 'mobx';

export class ApplicationStore {
    @observable name = "spamalot-slave";

    @action updateName = (name: string) => {
        this.name = name;
    }
}

export let AppStoreInstance =  new ApplicationStore();