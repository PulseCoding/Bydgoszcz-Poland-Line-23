var globalMD;
var db = firebase.firestore();
var countError = 0;
var flag = false;

function barcodeSetToArk() {
	"use strict";
	var pubnub = new PubNub({
		publishKey: 'pub-c-00bd1ac0-2eb7-4a70-9aeb-335c72b1ced5',
		subscribeKey: 'sub-c-4dd746bc-287a-11e8-9322-6e836ba663ef',
		uuid: 'barcodeSetToArkToClient',
		ssl: true
	})

	var publishConfig = {
		channel: 'barcodeSetter',
		message: {
			type: 'barcodeSetting',
			barcodeInner: $('#exampleInputEmail1')[0].value,
			barcodeOuter : document.getElementById('outerBox').value
		}
	};
	pubnub.publish(publishConfig, function(status, response) {
		if (status.error) {
			countError++;
			if (countError < 3){
					barcodeSetToArk();
			} else if (!flag) {
				$('#demo-show-pubnubError').click();
				flag = true;
			}
		} else {
			flag = false;
		}
	});
}
var pubnub = new PubNub({
	publishKey: 'pub-c-00bd1ac0-2eb7-4a70-9aeb-335c72b1ced5',
	subscribeKey: 'sub-c-4dd746bc-287a-11e8-9322-6e836ba663ef',
	uuid: 'barcodeSetToArkToClient',
	ssl: true
})
pubnub.subscribe({
	channels: ['barcodeSetter']
})
pubnub.addListener({
	status: function(statusEvent) {
		if (statusEvent.category === "PNConnectedCategory") {
			null
		}
	},
	message: function(message) {
		if (message.message.type == "barcodeSetted") {
			if (message.message.status == 'received') {
				$('#demo-show-toast').click();
			} else {
				$('#demo-show-wontSetBarcode').click();
			}
		}
	},
	presence: function(presenceEvent) {
		null
	}
})

function getMasterData() {
	if (!masterDataRequested) {
		masterDataRequested = true;
		if (!globalMD) {
			var docRef = db.collection("masterData").doc("line23");

			docRef.get().then(function(doc) {
				if (doc.exists) {
					globalMD = doc.data().content;
					editableMasterData();
				} else {
					console.log("No such document!");
				}
			}).catch(function(error) {
				$('#demo-show-pubnubError').click();
			});
		} else {
			editableMasterData();
		}
	}
}

function editableMasterData() {
	var str = createTable();
	$('#tableStarted').empty();
	$('#tableStarted').append(str);
	var table = $('#example').dataTable({
		"bLengthChange": false,
		"bFilter": true,
		"bInfo": false,
		"responsive": true,
		"bAutoWidth": true,
		"pageLength": 5,
		createdRow: function(row, data, rowIndex) {
			$.each($('td', row), function(colIndex) {
				$(this).attr('contenteditable', "true");
			});
		}
	});
	$('#example tbody').on('click', 'tr', function() {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');
			var row = $(this)[0]._DT_RowIndex;
			var data = $(this)[0].innerText.split('\t');
			if (data.length == 5 && data[0] != '' && data[2] != '' && data[3] != '' && data[4] != '' && data[1] != '') {
				table.fnUpdate(data,row);
			} else {
				$('#demo-show-fillField').click()
			}

		} else {
			table.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});

	$('#button').click(function() {
		var row = $('.selected')[0]._DT_RowIndex;
		table.fnDeleteRow(row);
	});
	$('#addRowMD').on('click', function() {
		table.fnAddDataAndDisplay(['','','','',''])
	});
	$('#uploadMD').on('click', function() {
		$('.selected').click()
		var data = table.fnGetData(),
			arr = []
		for (var i = 0; i < data.length; i++) {
			arr[i] = {
				du: data[i][0],
				name: data[i][1],
				ean: data[i][2],
				itfShrink: data[i][3],
				itfOuter: data[i][4]
			}
		}
		globalMD = arr;
		updateMasterData()
	});
}

function updateMasterData() {
	db.collection("masterData").doc('line23').set({
			content: globalMD
		})
		.then(function() {
			$('#demo-show-mdUpdated').click()
		})
		.catch(function(error) {
			$('#demo-show-mdUpdatedError').click()
		});
}

function createTable() {
	var str = '<table id="example" class="hover cell-border" style="width:100%">' +
		'<thead>' +
		'<tr>' +
		'<th>DU CODE</th>' +
		'<th>NAME</th>' +
		'<th>EAN CODE</th>' +
		'<th>ITF (SHRINK UNIT)</th>' +
		'<th>IFT (OUTER)</th>' +
		'</tr>' +
		'</thead>' +
		'<tbody>'
	for (let i = 0; i < globalMD.length; i++) {
		str += '<tr>' +
			'<td contenteditable="true">' + globalMD[i].du + '</td>' +
			'<td contenteditable="true">' + globalMD[i].name + '</td>' +
			'<td contenteditable="true">' + globalMD[i].ean + '</td>' +
			'<td contenteditable="true">' + globalMD[i].itfShrink + '</td>' +
			'<td contenteditable="true">' + globalMD[i].itfOuter + '</td>' +
			'</tr>'
	}
	str += '</tbody>' +
		'</table>'
	return str
}

function handleFileSelect(evt) {
	var reader = new FileReader();
	reader.onload = function(e) {
		globalMD = toJSON(e.target.result.toString());
		$('#demo-show-loaded').click();
	}
	reader.readAsBinaryString(evt.target.files[0]);
}

document.getElementById('fileCSV').addEventListener('change', handleFileSelect, false);

function validateMasterData(arr) {
	let goods = 0
	for (let i in arr) {
		if (arr[i] != '' && arr[i] != null && arr[0] != 0 && arr[2] != 0)
			goods++
	}
	if (goods == 5)
		return true
	return false
}

function toJSON(masterData) {
	masterData = masterData.replace(/\n/g, '').split('\r')
	let mD = [],
		j = 0
	for (let i in masterData) {
		if (i == 0) i++
			if (validateMasterData(masterData[i].split(','))) {
				var beforeData = masterData[i].split(',')
				mD[j++] = {
					du: beforeData[0].replace(/[^\d]/g, ''),
					name: beforeData[1],
					ean: beforeData[2],
					itfShrink: beforeData[3],
					itfOuter: beforeData[4].replace('nn', 0).replace('ITF on shrinked TU', 0).replace('na', 0)
				}
			}
	}
	return mD
}
