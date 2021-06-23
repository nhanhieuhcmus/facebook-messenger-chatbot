// Use dotenv to read .env vars into Node
require("dotenv").config();

const e = require("express");
// Use helper functions
const {
  lowerCaseArray,
  normalizeString,
  normalizeArray,
  girlfriend,
  crush,
  datetime,
  locations,
  weather,
} = require("./helpers");

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  { urlencoded, json } = require("body-parser"),
  app = express();

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond when a GET request is made to the homepage
app.get("/", function (_req, res) {
  res.send("Hello! Server running okay!");
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "nhanhieuhcmus";

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      // console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log("Sender PSID: " + senderPsid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Handles messages events
function handleMessage(senderPsid, receivedMessage) {
  let response;
  // Checks if the message contains text
  if (receivedMessage.text) {
    console.log("User message: ", receivedMessage.text);

    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send API

    // reply by my scenario
    if (
      normalizeArray(lowerCaseArray(girlfriend)).includes(
        normalizeString(receivedMessage.text.toLowerCase())
      )
    ) {
      response = {
        text: "Haizz ổng làm méo gì đã có đâu =]]",
      };
      console.log("Sent to user:", response);
      callSendAPI(senderPsid, response);
    } else if (
      [
        "biet nhan hieu dang crush ai hong",
        "biet nhan hieu thich ai hong",
        "biet crush nhan hieu la ai hong",
      ].includes(normalizeString(receivedMessage.text.toLowerCase()))
    ) {
      response = {
        text: "Biết chứ !!",
      };
      console.log("Sent to user:", response);
      callSendAPI(senderPsid, response);
    } else if (
      normalizeArray(lowerCaseArray(crush)).includes(
        normalizeString(receivedMessage.text.toLowerCase())
      )
    ) {
      response = {
        text: "Là...Là ai thì còn lâu mí nói :)(",
      };
      console.log(response);
      callSendAPI(senderPsid, response);
    } else if (
      normalizeArray(lowerCaseArray(datetime)).includes(
        normalizeString(receivedMessage.text.toLowerCase())
      )
    ) {
      callTimeApi("Asia/Jakarta", (error, response, body) => {
        const timeObj = JSON.parse(body);
        const dt = new Date(timeObj.datetime);
        const currentDate = dt.toLocaleDateString();
        const currentTime = dt.toTimeString();
        response = {
          text: `${timeObj.timezone}, 
Múi giờ: ${timeObj.utc_offset},
Ngày: ${currentDate},
Giờ: ${currentTime},
Tuần của năm: ${timeObj.week_number},
Ngày của năm: ${timeObj.day_of_year}`,
        };
        console.log("Sent to user:", response);
        callSendAPI(senderPsid, response);
      });
    } else if (
      normalizeArray(lowerCaseArray(weather)).includes(
        normalizeString(receivedMessage.text.toLowerCase())
      )
    ) {
      callWeatherAPI(1566083, (error, response, body) => {
        const data = JSON.parse(body);
        const weather = data.weather;
        const main = data.main;
        response = {
          text: `
${data.name}
${weather[0].description}
Nhiệt độ: ${main.temp_min} / ${main.temp_min} 
Áp suất: ${main.pressure}
Độ ẩm: ${main.humidity} 
Sức gió: ${data.wind.speed}
          `,
        };
        console.log("Sent to user:", response);
        callSendAPI(senderPsid, response);
      });
    } else if (
      ["top 1 youtube", "top 1 trending", "top 1 trending youtube"].includes(
        normalizeString(receivedMessage.text.toLowerCase())
      )
    ) {
      callSendAPI(senderPsid, {
        text: `[TOP 1 TRENDING ON YOUTUBE]:
https://youtu.be/YEh6DJRzrd0`,
      });
    } else if (
      ["funny", "funny gif", "funny giphy"].includes(
        normalizeString(receivedMessage.text.toLowerCase())
      )
    ) {
      callGiphyAPI((error, response, body) => {
        let json = JSON.parse(body);
        response = {
          text: `CHECK THIS FUNNY =]:
${json.data[0].embed_url}`,
        };
        console.log("Sent to user:", response);
        callSendAPI(senderPsid, response);
      });
    } else {
      // reply by Simsimi
      callSimsimiApi(receivedMessage.text, (error, response, body) => {
        if (!error) {
          let responseMessage = body.atext;
          console.log("Simsimi message:", responseMessage);
          response = {
            text: responseMessage,
          };
          console.log("Sent to user:", response);
          callSendAPI(senderPsid, response);
        } else {
          console.error("Simsimi error:" + error);
        }
      });
    }

    // handle other message
  } else if (receivedMessage.attachments) {
    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this your picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachmentUrl,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes",
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no",
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response message
  // callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload
  if (payload === "yes") {
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response);
}

// Call simsimi API
function callSimsimiApi(message, callback) {
  const KEY = "x090RnUYqwfRiG6IINhBkcE-4v.tQYqbA.ynmH70";
  const options = {
    method: "POST",
    url: "https://wsapi.simsimi.com/190410/talk/",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": KEY,
    },
    body: {
      utext: message,
      lang: "vn",
    },
    // can be replace json: true by adding JSON.stringify({}) in body
    json: true,
  };
  request(options, callback);
}

// Sends response messages via the Send API
function callSendAPI(senderPsid, response) {
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // Construct the message body
  let requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, _res, _body) => {
      if (!err) {
        console.log("Message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

// Call datetime API
function callTimeApi(timezone, callback) {
  request(
    {
      method: "GET",
      url: `http://worldtimeapi.org/api/timezone/${timezone}`,
    },
    callback
  );
}

// Call openweathermap API
function callWeatherAPI(id, callback) {
  const KEY = "fc67fea66fb1a31132ff7cd90de05b80";
  request(
    {
      method: "GET",
      url: `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${KEY}`,
    },
    callback
  );
}
function callGiphyAPI(callback) {
  request(
    {
      method: "GET",
      url: "https://api.giphy.com/v1/gifs/search?api_key=IofBamRUQNllEy80fCRNfcIZpwlltZZb&q=funny&limit=1&offset=0&rating=g&lang=en",
    },
    callback
  );
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
