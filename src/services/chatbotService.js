import { clearCache } from "ejs";
import request from "request";
import {
    callWeatherAPI,
    callTimeApi,
    callCovidApi,
    callGiphyAPI2,
    callSimsimiApi,
} from "../../api";
require("dotenv").config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GET_STARTED_IMAGE =
    "https://chatfuel.vn/wp-content/uploads/2021/04/cong-cu-chatbo-thinh-hanh.jpg";

const TIME_MENU_IMAGE =
    "https://langgo.edu.vn/public/files/upload/default/images/ielts/ielts-speaking-part-2-luyen-noi-troi-chay-topic-describe-a-time-2.jpg";

const WEATHER_MENU_IMAGE =
    "https://themeegg.com/wp-content/uploads/2018/02/Weather-Forecast-Landing-page.jpg";

const COVID_MENU_IMAGE =
    "https://dph.georgia.gov/sites/dph.georgia.gov/files/styles/3_2_2106px_x_1404px/public/2021-04/GettyImages-1210455332.jpg?h=32b23554&itok=1VqRSPk7";

async function callSendAPI(senderPsid, response) {
    let requestBody = {
        recipient: {
            id: senderPsid,
        },
        message: response,
    };

    await sendMarkReadMessage(senderPsid);
    await sendTypingOn(senderPsid);

    request(
        {
            uri: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
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

const sendTypingOn = (senderPsid) => {
    let requestBody = {
        recipient: {
            id: senderPsid,
        },
        sender_action: "typing_on",
    };

    request(
        {
            uri: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
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
};
const sendMarkReadMessage = (senderPsid) => {
    let requestBody = {
        recipient: {
            id: senderPsid,
        },
        sender_action: "mark_seen",
    };

    request(
        {
            uri: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
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
};

function getUsername(senderPsid) {
    return new Promise((resolve, reject) => {
        request(
            {
                uri: `https://graph.facebook.com/${senderPsid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
                method: "GET",
            },
            (err, _res, _body) => {
                if (!err) {
                    const body = JSON.parse(_body);
                    const username = `${body.first_name} ${body.last_name}`;
                    resolve(username);
                } else {
                    console.error("Unable to send message:" + err);
                    reject(err);
                }
            }
        );
    });
}

const handleGetStarted = async (senderPsid) => {
    try {
        const username = await getUsername(senderPsid);
        console.log(">>>check username: ", username);
        const response1 = {
            text: `Xin ch??o ${username}. C???m ??n b???n ???? li??n h??? ch??ng m??nh!!`,
        };
        const response2 = getStartedTemplate();
        // send first messsage (when clicking get started button)
        await callSendAPI(senderPsid, response1);
        // set menu
        await callSendAPI(senderPsid, response2);
    } catch (error) {
        throw error;
    }
};

const getStartedTemplate = () => {
    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [
                    {
                        title: "Hi b???n!",
                        subtitle: "Th??? m???t v??i g???i ?? nh??!!",
                        image_url: GET_STARTED_IMAGE,
                        buttons: [
                            {
                                type: "postback",
                                title: "H?????ng d???n",
                                payload: "README",
                            },
                            {
                                type: "postback",
                                title: "Menu",
                                payload: "MENU",
                            },
                        ],
                    },
                ],
            },
        },
    };
};
const getImageTemplate = (image_url) => {
    return {
        attachment: {
            type: "image",
            payload: {
                url: image_url,
                is_reusable: true,
            },
        },
    };
};

const handleSendMainMenu = async (senderPsid) => {
    try {
        const username = await getUsername(senderPsid);
        console.log(">>>check username: ", username);
        const response1 = {
            text: `Danh s??ch t??nh n??ng n???i b???t n??!!`,
        };
        const response2 = getMainMenuTemplate();
        // send first messsage (when clicking get started button)
        await callSendAPI(senderPsid, response1);
        // set menu
        await callSendAPI(senderPsid, response2);
    } catch (error) {
        throw error;
    }
};

const getMainMenuTemplate = () => {
    return {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [
                    {
                        title: "Covid 19",
                        subtitle: "T??nh h??nh d???ch b???nh COVID19 h??m nay",
                        image_url: COVID_MENU_IMAGE,
                        buttons: [
                            {
                                type: "postback",
                                title: "Covid 19",
                                payload: "COVID19",
                            },
                        ],
                    },
                    {
                        title: "Th???i gian",
                        subtitle: "Xem th??ng tin th???i gian",
                        image_url: TIME_MENU_IMAGE,
                        buttons: [
                            {
                                type: "postback",
                                title: "Th???i gian",
                                payload: "DATETIME",
                            },
                        ],
                    },
                    {
                        title: "Th???i ti???t",
                        subtitle: "Th??ng tin chi ti???t h??m nay",
                        image_url: WEATHER_MENU_IMAGE,
                        buttons: [
                            {
                                type: "postback",
                                title: "Th???i ti???t",
                                payload: "WEATHER",
                            },
                        ],
                    },
                ],
            },
        },
    };
};

const getWeatherData = async (id) => {
    // 1566083
    const res = await callWeatherAPI(id);
    let response;
    if (res) {
        response = {
            text: `
${res.data.name}
${res.data.weather[0].description}
Nhi???t ?????: ${Math.round(res.data.main.temp_max) - 273}??C / ${
                Math.round(res.data.main.temp_min) - 273
            }??C 
??p su???t: ${res.data.main.pressure}
????? ???m: ${res.data.main.humidity} 
S???c gi??: ${res.data.wind.speed}
  `,
        };
    }
    return response;
};

const getTimeData = async (timezone) => {
    const res = await callTimeApi(timezone);
    let response;
    if (res) {
        const timeObj = res.data;
        const dt = new Date(timeObj.datetime);
        const currentDate = dt.toLocaleDateString();
        const currentTime = dt.toTimeString();

        response = {
            // do not use code formatter here or it will not display properly
            text: `${timeObj.timezone}, 
M??i gi???: ${timeObj.utc_offset},
Ng??y: ${currentDate},
Gi???: ${currentTime},
Tu???n c???a n??m: ${timeObj.week_number},
Ng??y c???a n??m: ${timeObj.day_of_year}`,
        };
    }
    return response;
};

const getGiphyData = async (subject) => {
    const res = await callGiphyAPI2(subject);
    let response;
    if (res) {
        const gif = res.data.data[0].images.original.url;
        response = getImageTemplate(gif);
    }
    return response;
};

const getCovidData = async () => {
    const res = await callCovidApi();
    let response;
    if (res) {
        response = {
            text: `
T???ng nhi???m b???nh: ${res.data.cases.toLocaleString()}
T???ng ph???c h???i: ${res.data.recovered.toLocaleString()}
T???ng t??? vong: ${res.data.deaths.toLocaleString()}
Nhi???m b???nh h??m nay: ${res.data.todayCases.toLocaleString()}
Ph???c h???i h??m nay: ${res.data.todayRecovered.toLocaleString()}
T??? vong h??m nay: ${res.data.todayDeaths.toLocaleString()}`,
        };
    }
    return response;
};

const getSimsimiData = async (message) => {
    const res = await callSimsimiApi(message);
    console.log(">>>check res simsimi: ", res);
    let response;
    if (res) {
        response = {
            text: res.data.atext,
        };
    }
    return response;
};

module.exports = {
    handleGetStarted,
    getCovidData,
    getWeatherData,
    getTimeData,
    getSimsimiData,
    handleSendMainMenu,
    sendMarkReadMessage,
    sendTypingOn,
    getGiphyData,
};
