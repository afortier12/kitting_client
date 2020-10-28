import {server as http} from "../http-common.js";

class KitDataService {

    getAll = async() => {
        try{
            let response = await http.get("/kits")
            return response
        } catch (err) {
            toastr.error("API call failed: "+ err)
            return null; 
        }
    }

    get = async(id) => {
        try {
            return http.get(`/kit/${id}`);
        } catch (err) {
            toastr.error("API call failed: "+ err)
            return null; 
        }
    }

    findByTitle = async(name) => {
        try {
            return http.get(`/kit?name=${name}`);
        } catch (err) {
            toastr.error("API call failed: "+ err)
            return null; 
        }

    }
}

export const dataservice = new KitDataService();