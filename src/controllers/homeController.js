require("dotenv").config();
import request from "request";
import { normalizeString, datetime, weather } from "../../helpers/index";
import { callGiphyAPI } from "../../api/index";

import chatbotService from "../services/chatbotService";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const getHomePage = (req, res) => {
    return res.render("homepage.ejs");
};
// Creates the endpoint for your webhook
const postWebhook = (req, res) => {
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
};

// Adds support for GET requests to our webhook
const getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN || "nhanhieuhcmus";

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
};

// // Handles messages events
async function handleMessage(senderPsid, receivedMessage) {
    let response;
    // Checks if the message contains text
    if (receivedMessage.text) {
        console.log("User message: ", receivedMessage.text);

        // Create the payload for a basic text message, which
        // will be added to the body of your request to the Send API

        // reply by my scenario

        // Time
        if (
            datetime.includes(
                normalizeString(receivedMessage.text.toLowerCase())
            )
        ) {
            response = await chatbotService.getTimeData("Asia/Jakarta");
            callSendAPI(senderPsid, response);
        }
        // Weather
        else if (
            weather.includes(
                normalizeString(receivedMessage.text.toLowerCase())
            )
        ) {
            response = await chatbotService.getWeatherData(1566083);
            callSendAPI(senderPsid, response);
        }
        // Top 1 Youtube
        else if (
            [
                "top 1 youtube",
                "top 1 trending",
                "top 1 trending youtube",
            ].includes(normalizeString(receivedMessage.text.toLowerCase()))
        ) {
            callSendAPI(senderPsid, {
                text: `[TOP 1 TRENDING ON YOUTUBE]:
https://youtu.be/YEh6DJRzrd0`,
            });
        }
        // GIF
        else if (
            ["gif", "giphy"].includes(
                normalizeString(receivedMessage.text.toLowerCase())
            )
        ) {
            response = await chatbotService.getGiphyData("joke");
            await callSendAPI(senderPsid, response);
        }
        // Covid-19 summary
        else if (
            [
                "covid",
                "covid19",
                "tinh hinh covid19",
                "thong ke covid19",
            ].includes(normalizeString(receivedMessage.text.toLowerCase()))
        ) {
            response = await chatbotService.getCovidData();
            callSendAPI(senderPsid, response);
        } else {
            response = await chatbotService.getSimsimiData(
                receivedMessage.text
            );
            callSendAPI(senderPsid, response);
        }

        // handle other message
    } else if (receivedMessage.attachments) {
        console.log(">>>check vo duoc toi attachment");
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
        callSendAPI(senderPsid, response);
    }
}

// Handles messaging_postbacks events
async function handlePostback(senderPsid, receivedPostback) {
    let response;

    // Get the payload for the postback
    let payload = receivedPostback.payload;
    console.log(">>>check response payload: ", payload);
    switch (payload) {
        case "GET_STARTED":
        case "RESTART_BOT":
            await chatbotService.handleGetStarted(senderPsid);
            break;
        case "COVID19":
            response = await chatbotService.getCovidData();
            break;
        case "DATETIME":
            response = await chatbotService.getTimeData("Asia/Jakarta");
            break;
        case "WEATHER":
            response = await chatbotService.getWeatherData(1566083);
            break;
        case "README":
            response = {
                text: `https://github.com/nhanhieuhcmus/facebook-messenger-chatbot#readme`,
            };
            break;
        case "MENU":
            await chatbotService.handleSendMainMenu(senderPsid);
            break;
        default:
            response = { text: `Oops! I don't know how to reply "${payload}"` };
    }
    // Send the message to acknowledge the postback
    callSendAPI(senderPsid, response);
}

// Sends response messages via the Send API
async function callSendAPI(senderPsid, response) {
    // Mark as seen
    await chatbotService.sendMarkReadMessage(senderPsid);
    await chatbotService.sendTypingOn(senderPsid);
    // The page access token we have generated in your app settings

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

// const setupProfile = async (req, res) => {
//     // Construct the message body
//     let requestBody = {
//         get_started: {
//             payload: "GET_STARTED",
//         },
//         whitelisted_domains: ["https://nhanhieu-chat-bot.herokuapp.com/"],
//     };

//     // Send the HTTP request to the Messenger Platform
//     await request(
//         {
//             uri: `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
//             qs: { access_token: PAGE_ACCESS_TOKEN },
//             method: "POST",
//             json: requestBody,
//         },
//         (err, _res, _body) => {
//             if (!err) {
//                 console.log("OK!");
//             } else {
//                 console.error("Unable to send message:" + err);
//             }
//         }
//     );
//     return res.status(200).send("Setup succesfully!");
// };

const setupPersistentMenu = async (req, res) => {
    let requestBody = {
        persistent_menu: [
            {
                locale: "default",
                composer_input_disabled: false,
                call_to_actions: [
                    {
                        type: "postback",
                        title: "Talk to an agent",
                        payload: "TALK_AGENT",
                    },
                    {
                        type: "postback",
                        title: "Restart bot",
                        payload: "RESTART_BOT",
                    },
                    // {
                    //     type: "web_url",
                    //     title: "Shop now",
                    //     url: "https://www.originalcoastclothing.com/",
                    //     webview_height_ratio: "full",
                    // },
                ],
            },
        ],
    };

    // Send the HTTP request to the Messenger Platform
    await request(
        {
            uri: `https://graph.facebook.com/v12.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: "POST",
            json: requestBody,
        },
        (err, _res, _body) => {
            if (!err) {
                console.log("OK!");
            } else {
                console.error("Unable to send message:" + err);
            }
        }
    );
    return res.status(200).send("Setup succesfully!");
};

module.exports = {
    getHomePage,
    postWebhook,
    getWebhook,
    // setupProfile,
    setupPersistentMenu,
};
