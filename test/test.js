import assert from 'assert';
import * as webService from "../api/services/webService.js";

/**
 * Imports web service to check if its response code returned matched with the 
 * successful error code : 200
 */

describe("Check whether API returns 200",()=>{  
  
    it("To check if response returned is 200", async ()=>{
       assert.equal(200, await webService.httpResponseFetch())  //to check if there is an error
    });
});



