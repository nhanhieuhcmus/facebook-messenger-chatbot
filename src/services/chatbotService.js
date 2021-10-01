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
            text: `Xin chào ${username}. Cảm ơn bạn đã liên hệ chúng mình!!`,
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
                        title: "Hi bạn!",
                        subtitle: "Thử một vài gợi ý nhé!!",
                        image_url: GET_STARTED_IMAGE,
                        buttons: [
                            {
                                type: "postback",
                                title: "Hướng dẫn",
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
            text: `Danh sách tính năng nổi bật nè!!`,
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
                        subtitle: "Tình hình dịch bệnh COVID19 hôm nay",
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
                        title: "Thời gian",
                        subtitle: "Xem thông tin thời gian",
                        image_url: TIME_MENU_IMAGE,
                        buttons: [
                            {
                                type: "postback",
                                title: "Thời gian",
                                payload: "DATETIME",
                            },
                        ],
                    },
                    {
                        title: "Thời tiết",
                        subtitle: "Thông tin chi tiết hôm nay",
                        image_url: WEATHER_MENU_IMAGE,
                        buttons: [
                            {
                                type: "postback",
                                title: "Thời tiết",
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
Nhiệt độ: ${Math.round(res.data.main.temp_max) - 273}°C / ${
                Math.round(res.data.main.temp_min) - 273
            }°C 
Áp suất: ${res.data.main.pressure}
Độ ẩm: ${res.data.main.humidity} 
Sức gió: ${res.data.wind.speed}
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
Múi giờ: ${timeObj.utc_offset},
Ngày: ${currentDate},
Giờ: ${currentTime},
Tuần của năm: ${timeObj.week_number},
Ngày của năm: ${timeObj.day_of_year}`,
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
Tổng nhiễm bệnh: ${res.data.cases.toLocaleString()}
Tổng phục hồi: ${res.data.recovered.toLocaleString()}
Tổng tử vong: ${res.data.deaths.toLocaleString()}
Nhiễm bệnh hôm nay: ${res.data.todayCases.toLocaleString()}
Phục hồi hôm nay: ${res.data.todayRecovered.toLocaleString()}
Tử vong hôm nay: ${res.data.todayDeaths.toLocaleString()}`,
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
