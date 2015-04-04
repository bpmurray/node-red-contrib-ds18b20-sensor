/**
 * Copyright 2015 Brendan Murray
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Dependency - file system access
var fs = require('fs');


module.exports = function(RED) {
   "use strict";

   // The main node definition - most things happen in here
   function ds18b20Sensor(config) {

      // Create a RED node
      RED.nodes.createNode(this, config);

      // Store local copies of the node configuration (as defined in the .html)
      var node = this;

      // The root path of the sensors
      var W1PATH = "/sys/bus/w1/devices";

      var reading;

      // Get the list of devices 
      this.devList = function() {

         // Read the directory list
         var dirList = fs.readdirSync(W1PATH);

         // Get all the IDs - extra work, but that's OK
         for (var iX=0; iX<dirList.length; iX++) {
            var dir = dirList[iX];
            if (dir.indexOf("28-") == 0 && dir.length == 15) {
               // Format the name
               dirList[iX] = dir.substr(13,2)+dir.substr(11,2)+dir.substr(9,2)
                           + dir.substr(7,2)+dir.substr(5,2)+dir.substr(3,2);
            } else {
               // Not the correct format name - drop it!
               dirList[iX] = null;
            }
         }
         return dirList;
      }


      // Read the data & return a message object
      this.read = function(inMsg) {

         // File read options
         var fsOptions = { "encoding":"utf8", "flag":"r" };

         var sensors = (inMsg.topic == undefined)? devList()
                                                 : [ inMsg.topic ];

         var msgList = [];
         for (var iX=0; iX<sensors.length; iX++) {
            var dev = sensors[iX];
            var msg = inMsg;

            // Is it a DS18B20 directory?
            if (dev !== null) {
               var dir = dev.substr(13,2) + dev.substr(11,2) + dev.substr(9,2)
                       + dev.substr(7,2) + dev.substr(5,2) + dev.substr(1,2);
               var fData = fs.readFileSync(W1PATH + "/28-" + dir + "/w1_slave",
                                           fsOptions).trim();
               var tBeg = fData.indexOf("t=")+2;
               var tEnd = tBeg+1;
               while (tEnd<fData.length &&
                      fData[tEnd]>='0' && fData[tEnd]<='9') {
                  tEnd++;
               }
   
               // Extract the temperature
               var temp = fData.substring(tBeg, tEnd);

               msg.topic = dev;
               msg.payload = temp/1000.0;
               msgList.push(msg);
            }
         }
         return msgList;

      };

      // respond to inputs....
      this.on('input', function (msg) {
         var arr = this.read(msg);
         
         if (arr) {
            node.send([ arr ]);
         }
      });

   }

   // Register the node by name.
   RED.nodes.registerType("ds18b20", ds18b20Sensor);
}

