/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.93262503239181, "KoPercent": 0.06737496760818865};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9923382568886585, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "deleteCharacters"], "isController": false}, {"data": [1.0, 500, 1500, "getCharacterId"], "isController": false}, {"data": [1.0, 500, 1500, "editCharacter"], "isController": false}, {"data": [1.0, 500, 1500, "createCharacter"], "isController": false}, {"data": [0.9626997476871321, 500, 1500, "getCharacters"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 115770, 78, 0.06737496760818865, 255.39154357778423, 1, 32525, 118.0, 151.0, 157.0, 29226.980000000003, 3426.567217190552, 8243.348356660303, 626.3434165593737], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["deleteCharacters", 22878, 0, 0.0, 83.70657400122379, 1, 184, 91.0, 125.0, 139.0, 153.0, 769.7846567967699, 187.1839643968708, 160.87296538526246], "isController": false}, {"data": ["getCharacterId", 23034, 0, 0.0, 82.85473647651304, 1, 238, 91.0, 123.0, 139.0, 152.0, 772.8492819755738, 177.36287232837876, 96.60616024694673], "isController": false}, {"data": ["editCharacter", 22962, 0, 0.0, 84.16479400749053, 1, 238, 93.0, 127.0, 140.0, 153.0, 771.6763005780347, 177.0936822615607, 177.0936822615607], "isController": false}, {"data": ["createCharacter", 23116, 0, 0.0, 89.78015227548094, 1, 294, 96.0, 134.0, 144.0, 162.0, 774.7427690451452, 177.7974128179777, 177.04082808258204], "isController": false}, {"data": ["getCharacters", 23780, 78, 0.3280067283431455, 914.0123633305283, 1, 32525, 99.0, 141.0, 154.0, 29226.980000000003, 703.8418279760847, 7609.246317816551, 87.2928829618777], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 32,342 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,401 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,355 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,459 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,251 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,427 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,368 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,310 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,380 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,264 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,226 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,941 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,490 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,387 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,993 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,525 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,284 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,428 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,512 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,265 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,246 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,923 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,337 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 2, 2.5641025641025643, 0.0017275632720048372], "isController": false}, {"data": ["The operation lasted too long: It took 31,914 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,440 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,959 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,997 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,000 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,917 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,007 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,962 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,391 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,306 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,926 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,383 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,468 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,335 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,916 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,001 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,509 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,285 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,392 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,944 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,475 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,267 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,462 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,950 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,299 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,424 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,351 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,456 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,932 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,969 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,457 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,516 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,274 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,255 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,040 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,406 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,454 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 2, 2.5641025641025643, 0.0017275632720048372], "isController": false}, {"data": ["The operation lasted too long: It took 31,920 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,376 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,003 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,224 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,911 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,288 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31,975 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,493 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,396 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,033 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,514 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,014 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,410 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,303 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,341 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32,455 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 1.2820512820512822, 8.637816360024186E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 115770, 78, "The operation lasted too long: It took 32,337 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 2, "The operation lasted too long: It took 32,454 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 2, "The operation lasted too long: It took 32,342 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,401 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,355 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["getCharacters", 23780, 78, "The operation lasted too long: It took 32,337 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 2, "The operation lasted too long: It took 32,454 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 2, "The operation lasted too long: It took 32,342 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,401 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,355 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
