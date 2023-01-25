const mqtt = require("mqtt");
const consola = require("consola");
const Influx = require("influx");
require('dotenv').config()

const mqttOptions = {
  // clientId: "data_db", 
  clean: true,
  // host: process.env.MQTT_HOST,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  // protocol: process.env.MQTT_PROTOCOL || "tls",
};

const test_msg = { 
  "measurement":"mac_id", 
  "instant_KW": getRandomArbitrary(20, 45),  
  "instant_KVA": getRandomArbitrary(10, 20),  
  "avg_PF": getRandomArbitrary(30, 50),  
  "avg_PF": getRandomArbitrary(0, 1),  
  "max_KVA": getRandomArbitrary(0, 1),  
  "last_month_PF": 0.999,  
  "monthly_lag_KVARh": 1233,  
  "monthly_led_KVARh": 50,  
  "KWH": 50,  
  "KVAH": 50,  
  "last_month_amount": 50,  
  "predicted_month_amount": 50  
}
  // "temperature": getRandomArbitrary(20,25),  
  // "humidity": getRandomArbitrary(50,55), 
  // "ph": getRandomArbitrary(100,150),
  // "ec": getRandomArbitrary(800,850), 
  // "tds": getRandomArbitrary(200,250), 
  // "water_pump_status": getRandomArbitrary1(0,1), 
  // "nutrition_pump_status": getRandomArbitrary1(0,1), 
  // "ph_down_pump_status": getRandomArbitrary1(0,1), 
  // "light_status": getRandomArbitrary1(0,1), 
  // "light_rgb": "333333", 
  // "light_intensity": getRandomArbitrary(50,100), 
  // "vpd": getRandomArbitrary(50,100) 

function getRandomArbitrary(min, max) {
    return Math.random().toFixed(1) * (max - min) + min;
}

function getRandomArbitrary1(min, max) {
    return Math.random().toFixed(0) * (max - min) + min;
}

const client = mqtt.connect(process.env.MQTT_HOST, mqttOptions);

client.on("connect", () => {
  consola.success("Connected to MQTT broker");
});

client.on("offline", () => {
  consola.warn("MQTT broker connection failed");
  // process.exit(1);
});

client.on("error", (error) => {
  consola.error("MQTT Client Error:", error);
  // process.exit(1);
});

// { "measurement":"mac_id", "temperature": 21.1,"humidity": 37, "ph": 10, "ec": 54, "tds": 41, "water_pump_status": 0, "nutrition_pump_status": 0, "ph_down_pump_status": 0, "light_status": 0, "light_rgb": "#333333", "light_intensity": 80 }

setInterval(() => {
    if (client.connected == true) {
        // var topic = req.body.mac_id + "/" + "cmd"   
        var topic = "gateway" + "/" + "data"   
        
        // var msg = `{"action":"ota","url":"${req.body.server_url}/api/file/download/${req.body.bin_file}"}`
        
        // var msg = `{ "measurement":"mac_id", "temperature": ${getRandomArbitrary(20,25)},"humidity": ${getRandomArbitrary(50,55)}, "ph": ${getRandomArbitrary(100,150)}, "ec": ${getRandomArbitrary(800,850)}, "tds": ${getRandomArbitrary(200,250)}, "water_pump_status": ${getRandomArbitrary1(0,1)}, "nutrition_pump_status": ${getRandomArbitrary1(0,1)}, "ph_down_pump_status": ${getRandomArbitrary1(0,1)}, "light_status": ${getRandomArbitrary1(0,1)}, "light_rgb": "333333", "light_intensity": ${getRandomArbitrary(50,100)}, "vpd": ${getRandomArbitrary(50,100)} }`
        var msg = `{ 
  "measurement":"mac_id", 
  "instant_KW": ${getRandomArbitrary(20, 45)},  
  "instant_KVA": ${getRandomArbitrary(10, 20)},  
  "avg_PF": ${getRandomArbitrary(30, 50)},  
  "avg_PF": ${getRandomArbitrary(0, 1)},  
  "max_KVA": ${getRandomArbitrary(0, 1)},  
  "last_month_PF": 0.999,  
  "monthly_lag_KVARh": 1233,  
  "monthly_led_KVARh": 50,  
  "KWH": 50,  
  "KVAH": ${getRandomArbitrary(30, 50)},  
  "last_month_amount": 50,  
  "predicted_month_amount": 50  
}`
        // var msg =  JSON.stringify(test_msg)
        // consola.log(msg)
        client.publish(topic, msg);
        // res.status(200).send({ message: "OTA initiated" });
    } else {
        // res.status(400).send({ message: "Broker not connected" });
    }
}, 5000);