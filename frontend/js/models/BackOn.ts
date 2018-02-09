import axios, {AxiosPromise, AxiosResponse} from 'axios';

// back-on logger
const logPrefix = 'BackOn';
let log = (...msgs) => {
    console.info(`${logPrefix}: `, ...msgs);
};
let logWarn = (...msgs) => {
    console.warn(`${logPrefix}: `, ...msgs);
};
let logError = (...msgs) => {
    console.error(`${logPrefix}: `, ...msgs);
};

// used by models in backend requests
const httpOK = 200;
const contentTypeJSON = 'application/json; charset=utf-8';
const contentTypeHeaderName = 'content-type';

/**
 * defines an option set for model requests.
 */
interface ReqOptions {
    /** use a http POST request */
    usePost?: boolean;
    /** use a http PATCH request */
    usePatch?: boolean;
    /** verify that the response data is JSON */
    mustContentTypeBeJSON?: boolean;
}

/**
 * defines an abstract model, which is able to be stored
 * to the local IndexedDB database or backend.
 *
 * this class must be extended.
 */
export abstract class Model {

    /** the IndexedDB's object store name for this model.*/
    static Name: string;

    /** the root URI path which will be used when doing backend requests.*/
    url: string;

    /** defines wether the ID of the model is appended to the backend requests URIs*/
    noIDInURI: true;

    /** the id of the model which is used to store and retrieve it.*/
    id: any;

    constructor(attrs?: any) {
        // add the given attributes to this instance
        Object.assign(this, attrs);
    }

    /**
     * validates the given model before I/O is executed.
     * any positive return value indicates a failed validation.
     */
    validate(reject: (any) => void): any {
        return null;
    }

    /**
     * generates a unique key which is then used as the id of the model
     */
    generateID() {
        this.id = Date.now().toString();
    }

    /**
     * fetches the model from the backend and initializes this instance
     * with the retrieved data.
     */
    fetch(options: ReqOptions = {usePost: false, mustContentTypeBeJSON: true}) {
        return new Promise((resolve, reject) => {
            let uri = this.noIDInURI ? this.url : `${this.url}/${this.id}`;
            let req: AxiosPromise = options.usePost ? axios.post(uri, this) : axios.get(uri);
            req.then((res) => {
                if (res.status !== httpOK) {
                    reject(res);
                    return;
                }

                if (options.mustContentTypeBeJSON && this.checkJSONContentType(res, reject)) {
                    return;
                }
                Object.assign(this, res.data);
                resolve(res);
            }).catch((err) => reject(err));
        });
    }

    /**
     * deletes the given model from the backend.
     */
    delete(options: ReqOptions = {mustContentTypeBeJSON: false}) {
        return new Promise((resolve, reject) => {
            if (this.preCheck(true, reject)) return;
            let uri = this.noIDInURI ? this.url : `${this.url}/${this.id}`;
            axios.delete(uri).then((res) => {
                if (res.status !== httpOK) {
                    reject(res);
                    return;
                }
                if (options.mustContentTypeBeJSON && this.checkJSONContentType(res, reject)) {
                    return;
                }
                resolve(res);
            }).catch((err) => reject(err));
        });
    }

    /**
     * creates the model on the backend.
     */
    create(options: ReqOptions = {mustContentTypeBeJSON: true}) {
        return new Promise((resolve, reject) => {
            if (this.preCheck(false, reject)) return;
            axios.post(`${this.url}`, this).then((res) => {
                if (res.status !== httpOK) {
                    reject(res);
                    return;
                }
                if (options.mustContentTypeBeJSON && this.checkJSONContentType(res, reject)) {
                    return;
                }
                Object.assign(this, res.data);
                resolve(res);
            }).catch((err) => reject(err));
        });
    }

    /**
     * updates the model on the backend.
     */
    update(options: ReqOptions = {mustContentTypeBeJSON: true}) {
        return new Promise((resolve, reject) => {
            if (this.preCheck(true, reject)) return;
            let uri = this.noIDInURI ? this.url : `${this.url}/${this.id}`;
            let req: AxiosPromise = options.usePatch ? axios.patch(uri, this) : axios.put(uri, this);
            req.then((res) => {
                if (res.status !== httpOK) {
                    reject(res);
                    return;
                }
                if (options.mustContentTypeBeJSON && this.checkJSONContentType(res, reject)) {
                    return;
                }
                Object.assign(this, res.data);
                resolve(res);
            }).catch((err) => reject(err));
        });
    }

    /**
     * returns a JSON.stringify string
     */
    toString() {
        return JSON.stringify(this);
    }

    /**
     * checks wether the ID is set and executes the validation method.
     */
    private preCheck(checkID: boolean, reject: (any) => void): any {
        if (checkID && !this.noIDInURI && !this.id) {
            reject(new Error('id is not defined'));
            return true;
        }
        return this.validate(reject);
    }

    /**
     * checks wether the response's content type is JSON.
     */
    private checkJSONContentType(res: AxiosResponse, reject: (any) => void): any {
        let resContentType: string = res.headers[contentTypeHeaderName];
        if (resContentType.toLowerCase() !== contentTypeJSON) {
            reject(new Error(`invalid content type returned: ${resContentType}`));
        }
        return resContentType.toLowerCase() !== contentTypeJSON;
    }
}

/**
 * defines a collection of models.
 */
export abstract class Collection<T extends Model> {


    /** the object store name */
    static StoreName: string;

    /** an array containing the loaded models */
    models: Array<T>;

    /** the URL at which the collection can be fetched at */
    url: string;

    // used to create instances of the underlying type
    private model: new (attrs: any) => T;

    constructor(model: { new (): T }, models?: Array<T>, options?: any) {
        this.models = models ? models : [];
        this.model = model;
        if (options) {
            Object.assign(this, options);
        }
        ;
    }

    /**
     * returns the model on the specified index of the collection.
     */
    get (index: number) {
        return this.models[index];
    }

    remove(id: any) {
        let index = this.models.findIndex(obj => obj.id === id)
        this.models.splice(index, 1);
    }

    /**
     * returns the model with the given id.
     * @param id
     */
    id(id: any) {
        return this.models.find(m => m.id === id);
    }

    set (obj: any) {
        let index = this.models.findIndex(o => o.id === obj.id);
        this.models[index] = obj;
    }

    /**
     * fetches the models from the backend and initializes this collection
     * with the retrieved data.
     */
    fetch(options: ReqOptions = {usePost: false, mustContentTypeBeJSON: true}) {
        return new Promise((resolve, reject) => {
            let req: AxiosPromise = options.usePost ? axios.post(this.url, this) : axios.get(this.url);
            req.then((res) => {
                if (res.status !== httpOK) {
                    reject(res);
                    return;
                }
                if (!Array.isArray(res.data)) {
                    reject(new Error('response data is not of type array'));
                    return;
                }
                for (var i = 0; i < res.data.length; i++) {
                    let ele = res.data[i];
                    this.models.push(new this.model(ele));
                }
                resolve();
            }).catch((err) => reject(err));
        });
    }

    /**
     * returns a JSON.stringify string
     */
    toString() {
        return JSON.stringify(this);
    }
}