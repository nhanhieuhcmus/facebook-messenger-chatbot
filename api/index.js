const request = require("request");
import axios from "axios";

// Call openweathermap API

const callWeatherAPI = (id) => {
    const KEY = "fc67fea66fb1a31132ff7cd90de05b80";
    return axios.get(
        `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${KEY}`
    );
};

// Call a random funny GIF
function callGiphyAPI(callback) {
    request(
        {
            method: "GET",
            url: "https://api.giphy.com/v1/gifs/search?api_key=IofBamRUQNllEy80fCRNfcIZpwlltZZb&q=funny&limit=1&offset=0&rating=g&lang=en",
        },
        callback
    );
}

const callGiphyAPI2 = (subject) => {
    const KEY = "IofBamRUQNllEy80fCRNfcIZpwlltZZb";
    return axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${KEY}&q=${subject}&limit=1&offset=0&rating=g&lang=en`)
}


// Call datetime API
const callTimeApi = (timezone) => {
    return axios.get(`http://worldtimeapi.org/api/timezone/${timezone}`);
};

// Covid-19 Summary API

const callCovidApi = () => {
    return axios.get(`https://disease.sh/v3/covid-19/countries/VN`);
};

// Call Simsimi API
// function callSimsimiApi(message, callback) {
//     const KEY = "x090RnUYqwfRiG6IINhBkcE-4v.tQYqbA.ynmH70";
//     const options = {
//         method: "POST",
//         url: "https://wsapi.simsimi.com/190410/talk/",
//         headers: {
//             "Content-Type": "application/json",
//             "x-api-key": KEY,
//         },
//         body: {
//             utext: message,
//             lang: "vn",
//         },
//         // can be replace json: true by adding JSON.stringify({}) in body
//         json: true,
//     };
//     request(options, callback);
// }

const callSimsimiApi = (message) => {
    const KEY = "x090RnUYqwfRiG6IINhBkcE-4v.tQYqbA.ynmH70";

    const option = {
        headers: {
            "Content-Type": "application/json",
            "x-api-key": KEY,
        },
    };
    const body = {
        utext: message,
        lang: "vn",
    };
    return axios.post(`https://wsapi.simsimi.com/190410/talk/`, body, option);
};

module.exports = {
    callWeatherAPI,
    callGiphyAPI,
    callGiphyAPI2,
    callTimeApi,
    callCovidApi,
    callSimsimiApi,
};
