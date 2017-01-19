/**
 * Copyright 2015, 2016 Brendan Murray
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

// See https://www.maximintegrated.com/en/app-notes/index.mvp/id/187 for
// a description of the 1-wire protocol.

// Dependency - file system access
var fs = require('fs');
var _ = require('underscore');


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
      
      // The devices list file
      var W1DEVICES = "/sys/devices/w1_bus_master1/w1_master_slaves";
      
      // Save the default device ID
      this.topic = config.topic;

      // If we are to return an array
      this.returnArray = false;

      // Load information from the devices list
      this.loadDeviceData = function() {
         var deviceList = [];
         var fsOptions = { "encoding":"utf8", "flag":"r" };
         var devs = fs.readFileSync(W1DEVICES, fsOptions).split("\n");
         for (var iX=0; iX<devs.length; iX++) {
            if (devs[iX] !== undefined && devs[iX] !== "") {
               var fData = fs.readFileSync(W1PATH + "/" + devs[iX] +
                                           "/w1_slave", fsOptions).trim();
               // Extract the numeric part
               var tBeg = fData.indexOf("t=")+2;
               if (tBeg >= 0) {
                  var tEnd = tBeg+1;
                  while (tEnd<fData.length &&
                         fData[tEnd]>='0' && fData[tEnd]<='9') {
                     tEnd++;
                  }
                  var temp   = fData.substring(tBeg, tEnd);
                  var tmpDev = devs[iX].substr(13,2) + devs[iX].substr(11,2) +
                               devs[iX].substr(9,2)  + devs[iX].substr(7,2)  +
                               devs[iX].substr(5,2)  + devs[iX].substr(3,2);
   
                  deviceList.push({
                      "family": devs[iX].substr(0,2),
                      "id":     tmpDev.toUpperCase(),
                      "file":   devs[iX],
                      "temp":   temp/1000.0
                  });
               }
            }
         }
         return deviceList;
      }

      // Return the deviceList entry, given a device ID
      this.findDevice = function(deviceList, devId) {
         devId = devId.toUpperCase();
         for (var iX=0; iX<deviceList.length; iX++) {
            if (devId === deviceList[iX].file.substr(3).toUpperCase() ||
                devId === deviceList[iX].id) {
               return deviceList[iX];
            }
         }
         // If it's not in the normalised form
         var tmpDev = devId.substr(13,2) + devId.substr(11,2) +
                      devId.substr(9,2)  + devId.substr(7,2)  +
                      devId.substr(5,2)  + devId.substr(3,2);
         for (var iX=0; iX<deviceList.length; iX++) {
            if (devId === deviceList[iX].file.substr(3).toUpperCase() ||
                devId === deviceList[iX].id) {
               return deviceList[iX];
            }
         }
         
         return null;
      }


      // Read the data & return a message object
      this.read = function(inMsg) {
         // Retrieve the full set of data
         var deviceList = this.loadDeviceData();

         var msgList = [];
         var msg;

         if (this.topic != undefined && this.topic != "") {
            // Split a list into devices (or 1 if only 1)
            var sList = this.topic.split(" ");
            var retArr = [];
            for (var iX=0; iX<sList.length; iX++) {
               // Set up the returned message
               var dev = this.findDevice(deviceList, sList[iX]);
               // If we're returning an array, stre the device
               if (this.returnArray) { // || sList.length > 1) {
                  retArr.push(dev);
               } else {
                  // Not an array - build a message
                  msg = _.clone(inMsg);
                  if (dev !== null) {  // Device not found!
                     msg.topic = dev.id;
                     msg.family  = dev.family;
                     msg.payload = dev.temp;
                     msg.file    = dev.file;
                     msgList.push(msg);
                  }
               }
            }
            if (this.returnArray ) {
              msg = _.clone(inMsg);
              msg.topic   = "";
              msg.payload = retArr;
              msgList.push(msg);
            }
         } else {
            if (this.returnArray ) {
              msg     = _.clone(inMsg);
              msg.topic   = "";
              msg.payload = deviceList;
              msgList.push(msg);
            } else {
               // Not an array - build a message
               for (var iX=0; iX<deviceList.length; iX++) {
                  msg = _.clone(inMsg);
                  msg.topic   = deviceList[iX].id;
                  msg.family  = deviceList[iX].family;
                  msg.payload = deviceList[iX].temp;
                  msg.file    = deviceList[iX].file;
                  msgList.push(msg);
               }
            }
         }
         return msgList;

      };

      // respond to inputs....
      this.on('input', function (msg) {
         this.topic = config.topic;
         if (msg.topic !== undefined && msg.topic !== "") {
            this.topic = msg.topic;
         }
         this.returnArray = msg.array | config.array;

         var arr = this.read(msg);
         
         if (arr) {
            node.send([ arr ]);
         }
      });

   }

   // Register the node by name.
   RED.nodes.registerType("rpi-ds18b20", ds18b20Sensor);
}

