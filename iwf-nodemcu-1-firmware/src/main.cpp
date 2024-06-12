#include "Arduino.h"

#include "ESP8266WiFi.h"
#include "ESP8266WiFiMulti.h"
#include "ESP8266HTTPClient.h"
#include "WiFiClient.h"
#include "WiFiClientSecureBearSSL.h"

#define PIN_LED D0

void handleLedResponse(String response);
String splitString(String data, char separator, int index);

ESP8266WiFiMulti wiFiMulti;
HTTPClient http;
WiFiClient wifiClient;

bool ledIsOn = false;

void setup()
{
  Serial.begin(115200);

  Serial.println("\n\n-----------\nInit wi-fi STATION mode...");

  // init pins
  pinMode(PIN_LED, OUTPUT);

  // set wifi mode
  WiFi.mode(WIFI_STA);

  // connect to wi-fi network
  wiFiMulti.addAP("VIVOFIBRA-49D1", "v7zHN2sJeX");

  // wait for connection
  int count = 0;
  while (wiFiMulti.run() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);

    if (count >= 20)
    {
      Serial.println("wi-fi connection time out");
      return;
    }

    count++;
  }

  Serial.print("\nConnected as ");
  Serial.println(WiFi.localIP());
}

void loop()
{
  // run every 1000 miliseconds
  if (millis() % 1000 == 0)
  {
    if (WiFi.isConnected())
    {
      std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);

      // Ignore SSL certificate validation
      client->setInsecure();

      String url = "https://iwf-nodemcu-1.vercel.app/api/led?raw=1";

      // init url
      http.begin(*client, url);

      Serial.println("[HTTP] begin in " + url);

      // make http get
      int httpCode = http.GET();

      if (httpCode > 0)
      {
        Serial.println("[HTTP] GET " + String(httpCode));

        // response example: isOn=1;otherProp=23;anotherProp=a
        String response = http.getString();
        Serial.println("[HTTP] response: " + response);

        handleLedResponse(response);
      }
      else
      {
        Serial.println("[HTTP] GET failed, error: (" + String(httpCode) + ") " + http.errorToString(httpCode));
      }

      // end http
      http.end();
    }
    else
    {
      Serial.println("wi-fi not connected");
    }
  }
}

void handleLedResponse(String response)
{
  bool responseLedIsOn = splitString(splitString(response, ';', 0), '=', 1) == "1";

  if (ledIsOn != responseLedIsOn)
  {
    ledIsOn = responseLedIsOn;
    digitalWrite(PIN_LED, ledIsOn ? LOW : HIGH);

    Serial.println("ledIsOn=" + String(ledIsOn));
  }
}

String splitString(String data, char separator, int index = 0)
{
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length();

  for (int i = 0; i <= maxIndex && found <= index; i++)
  {
    if (data.charAt(i) == separator || i == maxIndex)
    {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }
  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}