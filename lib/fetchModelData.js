var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.responseType = "json"; //specify return type of XMLHttpRequest.response.
      xhr.onreadystatechange = function () { //called on each readyState change.
        if (this.readyState != 4) { //ignore all except DONE state, which === 4.
          return;
        }
        if (this.status != 200) { //OK status code === 200. error code !== 200.
          //call reject handler on fail
          return reject({status: this.status, statusText: this.statusText});
        }
        //call resolve handler on success
        return resolve({data: this.response});
      }
      xhr.open("GET", url);
      xhr.send();
  });
}

export default fetchModel;
