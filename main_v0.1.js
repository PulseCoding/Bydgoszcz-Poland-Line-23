// ----------------------------------------------------//
// Se crean las instancias de las librerias a utilizar //
// ----------------------------------------------------//
try{
  var modbus = require('jsmodbus');
  var fs = require('fs');
  var PubNub = require('pubnub');
var mongoClient =  require('mongodb').MongoClient
//Asignar host, puerto y otros par ametros al cliente Modbus
var client = modbus.client.tcp.complete({
    'host': "192.168.20.21",
    'port': 502,
    'autoReconnect': true,
    'timeout': 60000,
    'logEnabled'    : true,
    'reconnectTimeout': 30000
}).connect();

var intId,timeStop=40,flagONS1=0,flagONS2=0,flagONS3=0,flagONS4=0,flagONS5=0,flagONS6=0,flagONS7=0,flagONS8=0,flagONS9=0,flagONS10=0,flagONS11=0,flagONS12=0;
var JarSorter,ctJarSorter=0,speedTempJarSorter=0,secJarSorter=0,stopCountJarSorter=0,flagStopJarSorter=0,flagPrintJarSorter=0,speedJarSorter=0,timeJarSorter=0;
var actualJarSorter=0,stateJarSorter=0;
var Filler,ctFiller=0,speedTempFiller=0,secFiller=0,stopCountFiller=0,flagStopFiller=0,flagPrintFiller=0,speedFiller=0,timeFiller=0;
var actualFiller=0,stateFiller=0;
var Capper,ctCapper=0,speedTempCapper=0,secCapper=0,stopCountCapper=0,flagStopCapper=0,flagPrintCapper=0,speedCapper=0,timeCapper=0;
var actualCapper=0,stateCapper=0;
var Depuck,ctDepuck=0,speedTempDepuck=0,secDepuck=0,stopCountDepuck=0,flagStopDepuck=0,flagPrintDepuck=0,speedDepuck=0,timeDepuck=0;
var actualDepuck=0,stateDepuck=0;
var CapSorter,ctCapSorter=0,speedTempCapSorter=0,secCapSorter=0,stopCountCapSorter=0,flagStopCapSorter=0,flagPrintCapSorter=0,speedCapSorter=0,timeCapSorter=0;
var actualCapSorter=0,stateCapSorter=0;
var Checkweigher1,ctCheckweigher1=0,speedTempCheckweigher1=0,secCheckweigher1=0,stopCountCheckweigher1=0,flagStopCheckweigher1=0,flagPrintCheckweigher1=0,speedCheckweigher1=0,timeCheckweigher1=0;
var actualCheckweigher1=0,stateCheckweigher1=0;
var Labeller,ctLabeller=0,speedTempLabeller=0,secLabeller=0,stopCountLabeller=0,flagStopLabeller=0,flagPrintLabeller=0,speedLabeller=0,timeLabeller=0;
var actualLabeller=0,stateLabeller=0;
var Casepacker,ctCasepacker=0,speedTempCasepacker=0,secCasepacker=0,stopCountCasepacker=0,flagStopCasepacker=0,flagPrintCasepacker=0,speedCasepacker=0,timeCasepacker=0;
var actualCasepacker=0,stateCasepacker=0;
var Shrinkwrapper,ctShrinkwrapper=0,speedTempShrinkwrapper=0,secShrinkwrapper=0,stopCountShrinkwrapper=0,flagStopShrinkwrapper=0,flagPrintShrinkwrapper=0,speedShrinkwrapper=0,timeShrinkwrapper=0;
var actualShrinkwrapper=0,stateShrinkwrapper=0;
var Taper,ctTaper=0,speedTempTaper=0,secTaper=0,stopCountTaper=0,flagStopTaper=0,flagPrintTaper=0,speedTaper=0,timeTaper=0;
var actualTaper=0,stateTaper=0;
var Checkweigher2,ctCheckweigher2=0,speedTempCheckweigher2=0,secCheckweigher2=0,stopCountCheckweigher2=0,flagStopCheckweigher2=0,flagPrintCheckweigher2=0,speedCheckweigher2=0,timeCheckweigher2=0;
var actualCheckweigher2=0,stateCheckweigher2=0;
var Paletizer,ctPaletizer=0,speedTempPaletizer=0,secPaletizer=0,stopCountPaletizer=0,flagStopPaletizer=0,flagPrintPaletizer=0,speedPaletizer=0,timePaletizer=0;
var actualPaletizer=0,statePaletizer=0;
var Barcode,secBarcode=0;
var BarcodeLabel,secBarcodeLabel=0,eanGlobal= '0', registerOutput = 11, itfOuterGlobal = '0';
var secEOL=0,secPubNub=0;
var publishConfig;

var files = fs.readdirSync("/home/oee/Pulse/BYD_L23_LOGS/"); //Leer documentos
var actualdate = Date.now(); //Fecha actual
var text2send=[];//Vector a enviar
var flagInfo2Send=0;
var i=0;


pubnub = new PubNub({
  publishKey : "pub-c-ac9f95b7-c3eb-4914-9222-16fbcaad4c59",
  subscribeKey : "sub-c-206bed96-8c16-11e7-9760-3a607be72b06",
  uuid: "L23"
});

function senderData(){
  pubnub.publish(publishConfig, function(status, response) {
});}
// --------------------------------------------------------- //
//Función que realiza las instrucciones de lectura de datos  //
// --------------------------------------------------------- //
var DoRead = function (){
  if(secPubNub>=60*5){

    function idle(){
      i=0;
      text2send=[];
      for ( k=0;k<files.length;k++){//Verificar los archivos
        var stats = fs.statSync("/home/oee/Pulse/BYD_L23_LOGS/"+files[k]);
        var mtime = new Date(stats.mtime).getTime();
        if (mtime< (Date.now() - (8*60*1000))&&files[k].indexOf("serialbox")==-1){
          flagInfo2Send=1;
          text2send[i]=files[k];
          i++;
        }
      }
    }
    idle();

    secPubNub=0;
    publishConfig = {
      channel : "BYD_Monitor",
      message : {
            line: "23",
            tt: Date.now(),
            machines:text2send
          }
    };
    senderData();
  }else{
    secPubNub++;
  }
    client.readHoldingRegisters(0,99).then(function(resp){
        var statesJarSorter           = switchData(resp.register[0],resp.register[1]),
            statesFiller              = switchData(resp.register[2],resp.register[3]),
            statesCapper              = switchData(resp.register[4],resp.register[5]),
            statesDepuck              = switchData(resp.register[6],resp.register[7]),
            statesCapSorter           = switchData(resp.register[8],resp.register[9]),
            statesCheckweigher1       = switchData(resp.register[10],resp.register[11]),
            statesLabeller            = switchData(resp.register[12],resp.register[13]),
            statesCasepacker          = switchData(resp.register[14],resp.register[15]),
            statesShrinkwrapper       = switchData(resp.register[16],resp.register[17]),
            statesTaper               = switchData(resp.register[18],resp.register[19]),
            statesCheckweigher2       = switchData(resp.register[20],resp.register[21]),
            statesPaletizer           = switchData(resp.register[22],resp.register[23]);
            console.log(resp.register[90])
            //Barcode -------------------------------------------------------------------------------------------------------------
            if(resp.register[66]==0&&resp.register[67]==0&&resp.register[68]==0&&resp.register[69]==0&&resp.register[70]==0&&resp.register[71]==0&&resp.register[72]==0&&resp.register[73]==0){
              Barcode='0';
            }else {
              var dig1=hex2a(assignment(resp.register[66]).toString(16));
              var dig2=hex2a(assignment(resp.register[67]).toString(16));
              var dig3=hex2a(assignment(resp.register[68]).toString(16));
              var dig4=hex2a(assignment(resp.register[69]).toString(16));
              var dig5=hex2a(assignment(resp.register[70]).toString(16));
              var dig6=hex2a(assignment(resp.register[71]).toString(16));
              var dig7=hex2a(assignment(resp.register[72]).toString(16));
              var dig8=hex2a(assignment(resp.register[73]).toString(16));
              Barcode=dig1+dig2+dig3+dig4+dig5+dig6+dig7+dig8;
            }
            if(isNaN(Barcode)){
              Barcode='0';
            }
            itfOuterGlobal = String(Barcode).replace(/[^\d]/g,'')
  	        if(secBarcode>=60&&!isNaN(Barcode)){
                writedataBarcode(Barcode,"pol_byd_Barcode_L23.log");
                secBarcode=0;
            }
            secBarcode++;
            //Barcode -------------------------------------------------------------------------------------------------------------
            //Barcode -------------------------------------------------------------------------------------------------------------
            if(resp.register[80]==0&&resp.register[81]==0&&resp.register[82]==0&&resp.register[83]==0&&resp.register[84]==0&&resp.register[85]==0&&resp.register[86]==0&&resp.register[87]==0){
              BarcodeLabel='0';
            }else {
              var digt1=hex2a(assignment(resp.register[80]).toString(16));
              var digt2=hex2a(assignment(resp.register[81]).toString(16));
              var digt3=hex2a(assignment(resp.register[82]).toString(16));
              var digt4=hex2a(assignment(resp.register[83]).toString(16));
              var digt5=hex2a(assignment(resp.register[84]).toString(16));
              var digt6=hex2a(assignment(resp.register[85]).toString(16));
              var digt7=hex2a(assignment(resp.register[86]).toString(16));
              var digt8=hex2a(assignment(resp.register[87]).toString(16));
              BarcodeLabel=digt1+digt2+digt3+digt4+digt5+digt6+digt7+digt8;
            }
            if(isNaN(BarcodeLabel)){
              BarcodeLabel='0';
            }
            if (BarcodeLabel != eanGlobal)
            	eanGlobal = String(BarcodeLabel).replace(/[^\d]/g,'')
  	        if(secBarcodeLabel>=60&&!isNaN(BarcodeLabel)){
                secBarcodeLabel=0;
            }
            secBarcodeLabel++;
            //Barcode -------------------------------------------------------------------------------------------------------------
          //JarSorter -------------------------------------------------------------------------------------------------------------
            ctJarSorter = joinWord(resp.register[25],resp.register[24]);
              if(flagONS1===0){
                speedTempJarSorter=ctJarSorter;
                flagONS1=1;
            }
            if (secJarSorter>=60){
                if(stopCountJarSorter===0||flagStopJarSorter==1){
                   flagPrintJarSorter=1;
                    secJarSorter=0;
                    speedJarSorter=ctJarSorter-speedTempJarSorter;
                    speedTempJarSorter=ctJarSorter;
                }
                if(flagStopJarSorter==1){
                    timeJarSorter=Date.now();
                }
            }
            secJarSorter++;
            if(ctJarSorter>actualJarSorter){
                stateJarSorter=1;//RUN
                if(stopCountJarSorter>=timeStop){
                    speedJarSorter=0;
                    secJarSorter=0;
                }
                timeJarSorter=Date.now();
                stopCountJarSorter=0;
                flagStopJarSorter=0;


            }else if(ctJarSorter==actualJarSorter){
                if(stopCountJarSorter===0){
                    timeJarSorter=Date.now();
                }
                stopCountJarSorter++;
                if(stopCountJarSorter>=timeStop){
                    stateJarSorter=2;//STOP
                    speedJarSorter=0;
                    if(flagStopJarSorter===0){
                        flagPrintJarSorter=1;
                        secJarSorter=0;
                    }
                    flagStopJarSorter=1;
                }
            }
            if(stateJarSorter==2){
                speedTempJarSorter=ctJarSorter;
            }

            actualJarSorter=ctJarSorter;
            if(stateJarSorter==2){
                if(statesJarSorter[5]==1){
                    stateJarSorter=3;//Wait
                }else{
                    if(statesJarSorter[4]==1){
                        stateJarSorter=4;//Block
                    }
                }
            }
            JarSorter = {
                ST: stateJarSorter,
                //CPQI: joinWord(resp.register[59],resp.register[58]),
                CPQO: joinWord(resp.register[25],resp.register[24]),
                //CPQR: joinWord(resp.register[57],resp.register[56]),
                SP: speedJarSorter
            };
            if(flagPrintJarSorter==1){
                for(var key in JarSorter){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_JarSorter_L23.log","tt="+timeJarSorter+",var="+key+",val="+JarSorter[key]+"\n");
                }
                flagPrintJarSorter=0;
            }
          //JarSorter -------------------------------------------------------------------------------------------------------------
          //Filler -------------------------------------------------------------------------------------------------------------
            ctFiller = joinWord(resp.register[27],resp.register[26]);
              if(flagONS2===0){
                speedTempFiller=ctFiller;
                flagONS2=1;
            }
            if (secFiller>=60){
                if(stopCountFiller===0||flagStopFiller==1){
                   flagPrintFiller=1;
                    secFiller=0;
                    speedFiller=ctFiller-speedTempFiller;
                    speedTempFiller=ctFiller;
                }
                if(flagStopFiller==1){
                    timeFiller=Date.now();
                }
            }
            secFiller++;
            if(ctFiller>actualFiller){
                stateFiller=1;//RUN
                if(stopCountFiller>=timeStop){
                    speedFiller=0;
                    secFiller=0;
                }
                timeFiller=Date.now();
                stopCountFiller=0;
                flagStopFiller=0;


            }else if(ctFiller==actualFiller){
                if(stopCountFiller===0){
                    timeFiller=Date.now();
                }
                stopCountFiller++;
                if(stopCountFiller>=timeStop){
                    stateFiller=2;//STOP
                    speedFiller=0;
                    if(flagStopFiller===0){
                        flagPrintFiller=1;
                        secFiller=0;
                    }
                    flagStopFiller=1;
                }
            }
            if(stateFiller==2){
                speedTempFiller=ctFiller;
            }

            actualFiller=ctFiller;
            if(stateFiller==2){
                if(statesFiller[5]==1){
                    stateFiller=3;//Wait
                }else{
                    if(statesFiller[4]==1){
                        stateFiller=4;//Block
                    }
                }
            }
            Filler = {
                ST: stateFiller,
                CPQI: joinWord(resp.register[27],resp.register[26]),
                //CPQO: joinWord(resp.register[25],resp.register[24]),
                //CPQR: joinWord(resp.register[57],resp.register[56]),
                SP: speedFiller
            };
            if(flagPrintFiller==1){
                for(var key in Filler){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Filler_L23.log","tt="+timeFiller+",var="+key+",val="+Filler[key]+"\n");
                }
                flagPrintFiller=0;
            }
          //Filler -------------------------------------------------------------------------------------------------------------
          //Capper -------------------------------------------------------------------------------------------------------------
            ctCapper = joinWord(resp.register[29],resp.register[28]);
              if(flagONS3===0){
                speedTempCapper=ctCapper;
                flagONS3=1;
            }
            if (secCapper>=60){
                if(stopCountCapper===0||flagStopCapper==1){
                   flagPrintCapper=1;
                    secCapper=0;
                    speedCapper=ctCapper-speedTempCapper;
                    speedTempCapper=ctCapper;
                }
                if(flagStopCapper==1){
                    timeCapper=Date.now();
                }
            }
            secCapper++;
            if(ctCapper>actualCapper){
                stateCapper=1;//RUN
                if(stopCountCapper>=timeStop){
                    speedCapper=0;
                    secCapper=0;
                }
                timeCapper=Date.now();
                stopCountCapper=0;
                flagStopCapper=0;


            }else if(ctCapper==actualCapper){
                if(stopCountCapper===0){
                    timeCapper=Date.now();
                }
                stopCountCapper++;
                if(stopCountCapper>=timeStop){
                    stateCapper=2;//STOP
                    speedCapper=0;
                    if(flagStopCapper===0){
                        flagPrintCapper=1;
                        secCapper=0;
                    }
                    flagStopCapper=1;
                }
            }
            if(stateCapper==2){
                speedTempCapper=ctCapper;
            }

            actualCapper=ctCapper;
            if(stateCapper==2){
                if(statesCapper[5]==1){
                    stateCapper=3;//Wait
                }else{
                    if(statesCapper[4]==1){
                        stateCapper=4;//Block
                    }
                }
            }
            Capper = {
                ST: stateCapper,
                CPQI: joinWord(resp.register[29],resp.register[28]),
                CPQO: joinWord(resp.register[31],resp.register[30]),
                CPQR: joinWord(resp.register[33],resp.register[32]),
                SP: speedCapper
            };
            if(flagPrintCapper==1){
                for(var key in Capper){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Capper_L23.log","tt="+timeCapper+",var="+key+",val="+Capper[key]+"\n");
                }
                flagPrintCapper=0;
            }
          //Capper -------------------------------------------------------------------------------------------------------------
          //Depuck -------------------------------------------------------------------------------------------------------------
            ctDepuck = joinWord(resp.register[35],resp.register[34]);
              if(flagONS4===0){
                speedTempDepuck=ctDepuck;
                flagONS4=1;
            }
            if (secDepuck>=60){
                if(stopCountDepuck===0||flagStopDepuck==1){
                   flagPrintDepuck=1;
                    secDepuck=0;
                    speedDepuck=ctDepuck-speedTempDepuck;
                    speedTempDepuck=ctDepuck;
                }
                if(flagStopDepuck==1){
                    timeDepuck=Date.now();
                }
            }
            secDepuck++;
            if(ctDepuck>actualDepuck){
                stateDepuck=1;//RUN
                if(stopCountDepuck>=timeStop){
                    speedDepuck=0;
                    secDepuck=0;
                }
                timeDepuck=Date.now();
                stopCountDepuck=0;
                flagStopDepuck=0;


            }else if(ctDepuck==actualDepuck){
                if(stopCountDepuck===0){
                    timeDepuck=Date.now();
                }
                stopCountDepuck++;
                if(stopCountDepuck>=timeStop){
                    stateDepuck=2;//STOP
                    speedDepuck=0;
                    if(flagStopDepuck===0){
                        flagPrintDepuck=1;
                        secDepuck=0;
                    }
                    flagStopDepuck=1;
                }
            }
            if(stateDepuck==2){
                speedTempDepuck=ctDepuck;
            }

            actualDepuck=ctDepuck;
            if(stateDepuck==2){
                if(statesDepuck[5]==1){
                    stateDepuck=3;//Wait
                }else{
                    if(statesDepuck[4]==1){
                        stateDepuck=4;//Block
                    }
                }
            }
            Depuck = {
                ST: stateDepuck,
                //CPQI: joinWord(resp.register[29],resp.register[28]),
                CPQO: joinWord(resp.register[35],resp.register[34]),
                //CPQR: joinWord(resp.register[33],resp.register[32]),
                SP: speedDepuck
            };
            if(flagPrintDepuck==1){
                for(var key in Depuck){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Depuck_L23.log","tt="+timeDepuck+",var="+key+",val="+Depuck[key]+"\n");
                }
                flagPrintDepuck=0;
            }
          //Depuck -------------------------------------------------------------------------------------------------------------
          //CapSorter -------------------------------------------------------------------------------------------------------------
            ctCapSorter = joinWord(resp.register[37],resp.register[36]);
              if(flagONS5===0){
                speedTempCapSorter=ctCapSorter;
                flagONS5=1;
            }
            if (secCapSorter>=60){
                if(stopCountCapSorter===0||flagStopCapSorter==1){
                   flagPrintCapSorter=1;
                    secCapSorter=0;
                    speedCapSorter=ctCapSorter-speedTempCapSorter;
                    speedTempCapSorter=ctCapSorter;
                }
                if(flagStopCapSorter==1){
                    timeCapSorter=Date.now();
                }
            }
            secCapSorter++;
            if(ctCapSorter>actualCapSorter){
                stateCapSorter=1;//RUN
                if(stopCountCapSorter>=timeStop){
                    speedCapSorter=0;
                    secCapSorter=0;
                }
                timeCapSorter=Date.now();
                stopCountCapSorter=0;
                flagStopCapSorter=0;


            }else if(ctCapSorter==actualCapSorter){
                if(stopCountCapSorter===0){
                    timeCapSorter=Date.now();
                }
                stopCountCapSorter++;
                if(stopCountCapSorter>=timeStop){
                    stateCapSorter=2;//STOP
                    speedCapSorter=0;
                    if(flagStopCapSorter===0){
                        flagPrintCapSorter=1;
                        secCapSorter=0;
                    }
                    flagStopCapSorter=1;
                }
            }
            if(stateCapSorter==2){
                speedTempCapSorter=ctCapSorter;
            }

            actualCapSorter=ctCapSorter;
            if(stateCapSorter==2){
                if(statesCapSorter[5]==1){
                    stateCapSorter=3;//Wait
                }else{
                    if(statesCapSorter[4]==1){
                        stateCapSorter=4;//Block
                    }
                }
            }
            CapSorter = {
                ST: stateCapSorter,
                //CPQI: joinWord(resp.register[29],resp.register[28]),
                CPQO: joinWord(resp.register[37],resp.register[36]),
                //CPQR: joinWord(resp.register[33],resp.register[32]),
                SP: speedCapSorter
            };
            if(flagPrintCapSorter==1){
                for(var key in CapSorter){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_CapSorter_L23.log","tt="+timeCapSorter+",var="+key+",val="+CapSorter[key]+"\n");
                }
                flagPrintCapSorter=0;
            }
          //CapSorter -------------------------------------------------------------------------------------------------------------
          //Checkweigher1 -------------------------------------------------------------------------------------------------------------
            ctCheckweigher1 = joinWord(resp.register[39],resp.register[38]);
              if(flagONS6===0){
                speedTempCheckweigher1=ctCheckweigher1;
                flagONS6=1;
            }
            if (secCheckweigher1>=60){
                if(stopCountCheckweigher1===0||flagStopCheckweigher1==1){
                   flagPrintCheckweigher1=1;
                    secCheckweigher1=0;
                    speedCheckweigher1=ctCheckweigher1-speedTempCheckweigher1;
                    speedTempCheckweigher1=ctCheckweigher1;
                }
                if(flagStopCheckweigher1==1){
                    timeCheckweigher1=Date.now();
                }
            }
            secCheckweigher1++;
            if(ctCheckweigher1>actualCheckweigher1){
                stateCheckweigher1=1;//RUN
                if(stopCountCheckweigher1>=timeStop){
                    speedCheckweigher1=0;
                    secCheckweigher1=0;
                }
                timeCheckweigher1=Date.now();
                stopCountCheckweigher1=0;
                flagStopCheckweigher1=0;


            }else if(ctCheckweigher1==actualCheckweigher1){
                if(stopCountCheckweigher1===0){
                    timeCheckweigher1=Date.now();
                }
                stopCountCheckweigher1++;
                if(stopCountCheckweigher1>=timeStop){
                    stateCheckweigher1=2;//STOP
                    speedCheckweigher1=0;
                    if(flagStopCheckweigher1===0){
                        flagPrintCheckweigher1=1;
                        secCheckweigher1=0;
                    }
                    flagStopCheckweigher1=1;
                }
            }
            if(stateCheckweigher1==2){
                speedTempCheckweigher1=ctCheckweigher1;
            }

            actualCheckweigher1=ctCheckweigher1;
            if(stateCheckweigher1==2){
                if(statesCheckweigher1[5]==1){
                    stateCheckweigher1=3;//Wait
                }else{
                    if(statesCheckweigher1[4]==1){
                        stateCheckweigher1=4;//Block
                    }
                }
            }
            Checkweigher1 = {
                ST: stateCheckweigher1,
                CPQI: joinWord(resp.register[39],resp.register[38]),
                CPQO: joinWord(resp.register[41],resp.register[40]),
                CPQR: joinWord(resp.register[43],resp.register[42]),
                SP: speedCheckweigher1
            };
            if(flagPrintCheckweigher1==1){
                for(var key in Checkweigher1){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Checkweigher1_L23.log","tt="+timeCheckweigher1+",var="+key+",val="+Checkweigher1[key]+"\n");
                }
                flagPrintCheckweigher1=0;
            }
          //Checkweigher1 -------------------------------------------------------------------------------------------------------------
          //Labeller -------------------------------------------------------------------------------------------------------------
            ctLabeller = joinWord(resp.register[45],resp.register[44]);
              if(flagONS7===0){
                speedTempLabeller=ctLabeller;
                flagONS7=1;
            }
            if (secLabeller>=60){
                if(stopCountLabeller===0||flagStopLabeller==1){
                   flagPrintLabeller=1;
                    secLabeller=0;
                    speedLabeller=ctLabeller-speedTempLabeller;
                    speedTempLabeller=ctLabeller;
                }
                if(flagStopLabeller==1){
                    timeLabeller=Date.now();
                }
            }
            secLabeller++;
            if(ctLabeller>actualLabeller){
                stateLabeller=1;//RUN
                if(stopCountLabeller>=timeStop){
                    speedLabeller=0;
                    secLabeller=0;
                }
                timeLabeller=Date.now();
                stopCountLabeller=0;
                flagStopLabeller=0;


            }else if(ctLabeller==actualLabeller){
                if(stopCountLabeller===0){
                    timeLabeller=Date.now();
                }
                stopCountLabeller++;
                if(stopCountLabeller>=timeStop){
                    stateLabeller=2;//STOP
                    speedLabeller=0;
                    if(flagStopLabeller===0){
                        flagPrintLabeller=1;
                        secLabeller=0;
                    }
                    flagStopLabeller=1;
                }
            }
            if(stateLabeller==2){
                speedTempLabeller=ctLabeller;
            }

            actualLabeller=ctLabeller;
            if(stateLabeller==2){
                if(statesLabeller[5]==1){
                    stateLabeller=3;//Wait
                }else{
                    if(statesLabeller[4]==1){
                        stateLabeller=4;//Block
                    }
                }
            }
            Labeller = {
                ST: stateLabeller,
                CPQI: joinWord(resp.register[45],resp.register[44]),
                CPQO: joinWord(resp.register[47],resp.register[46]),
                CPQR: joinWord(resp.register[49],resp.register[48]),
                SP: speedLabeller
            };
            if(flagPrintLabeller==1){
                for(var key in Labeller){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Labeller_L23.log","tt="+timeLabeller+",var="+key+",val="+Labeller[key]+"\n");
                }
                flagPrintLabeller=0;
            }
          //Labeller -------------------------------------------------------------------------------------------------------------
          //Casepacker -------------------------------------------------------------------------------------------------------------
            ctCasepacker = joinWord(resp.register[51],resp.register[50]);
              if(flagONS8===0){
                speedTempCasepacker=ctCasepacker;
                flagONS8=1;
            }
            if (secCasepacker>=60){
                if(stopCountCasepacker===0||flagStopCasepacker==1){
                   flagPrintCasepacker=1;
                    secCasepacker=0;
                    speedCasepacker=ctCasepacker-speedTempCasepacker;
                    speedTempCasepacker=ctCasepacker;
                }
                if(flagStopCasepacker==1){
                    timeCasepacker=Date.now();
                }
            }
            secCasepacker++;
            if(ctCasepacker>actualCasepacker){
                stateCasepacker=1;//RUN
                if(stopCountCasepacker>=timeStop){
                    speedCasepacker=0;
                    secCasepacker=0;
                }
                timeCasepacker=Date.now();
                stopCountCasepacker=0;
                flagStopCasepacker=0;


            }else if(ctCasepacker==actualCasepacker){
                if(stopCountCasepacker===0){
                    timeCasepacker=Date.now();
                }
                stopCountCasepacker++;
                if(stopCountCasepacker>=timeStop){
                    stateCasepacker=2;//STOP
                    speedCasepacker=0;
                    if(flagStopCasepacker===0){
                        flagPrintCasepacker=1;
                        secCasepacker=0;
                    }
                    flagStopCasepacker=1;
                }
            }
            if(stateCasepacker==2){
                speedTempCasepacker=ctCasepacker;
            }

            actualCasepacker=ctCasepacker;
            if(stateCasepacker==2){
                if(statesCasepacker[5]==1){
                    stateCasepacker=3;//Wait
                }else{
                    if(statesCasepacker[4]==1){
                        stateCasepacker=4;//Block
                    }
                }
            }
            Casepacker = {
                ST: stateCasepacker,
                CPQI: joinWord(resp.register[51],resp.register[50]),
                //CPQO: joinWord(resp.register[47],resp.register[46]),
                //CPQR: joinWord(resp.register[49],resp.register[48]),
                SP: speedCasepacker
            };
            if(flagPrintCasepacker==1){
                for(var key in Casepacker){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Casepacker_L23.log","tt="+timeCasepacker+",var="+key+",val="+Casepacker[key]+"\n");
                }
                flagPrintCasepacker=0;
            }
          //Casepacker -------------------------------------------------------------------------------------------------------------
          //Shrinkwrapper -------------------------------------------------------------------------------------------------------------
            ctShrinkwrapper = joinWord(resp.register[53],resp.register[52]);
              if(flagONS9===0){
                speedTempShrinkwrapper=ctShrinkwrapper;
                flagONS9=1;
            }
            if (secShrinkwrapper>=60){
                if(stopCountShrinkwrapper===0||flagStopShrinkwrapper==1){
                   flagPrintShrinkwrapper=1;
                    secShrinkwrapper=0;
                    speedShrinkwrapper=ctShrinkwrapper-speedTempShrinkwrapper;
                    speedTempShrinkwrapper=ctShrinkwrapper;
                }
                if(flagStopShrinkwrapper==1){
                    timeShrinkwrapper=Date.now();
                }
            }
            secShrinkwrapper++;
            if(ctShrinkwrapper>actualShrinkwrapper){
                stateShrinkwrapper=1;//RUN
                if(stopCountShrinkwrapper>=timeStop){
                    speedShrinkwrapper=0;
                    secShrinkwrapper=0;
                }
                timeShrinkwrapper=Date.now();
                stopCountShrinkwrapper=0;
                flagStopShrinkwrapper=0;


            }else if(ctShrinkwrapper==actualShrinkwrapper){
                if(stopCountShrinkwrapper===0){
                    timeShrinkwrapper=Date.now();
                }
                stopCountShrinkwrapper++;
                if(stopCountShrinkwrapper>=timeStop){
                    stateShrinkwrapper=2;//STOP
                    speedShrinkwrapper=0;
                    if(flagStopShrinkwrapper===0){
                        flagPrintShrinkwrapper=1;
                        secShrinkwrapper=0;
                    }
                    flagStopShrinkwrapper=1;
                }
            }
            if(stateShrinkwrapper==2){
                speedTempShrinkwrapper=ctShrinkwrapper;
            }

            actualShrinkwrapper=ctShrinkwrapper;
            if(stateShrinkwrapper==2){
                if(statesShrinkwrapper[5]==1){
                    stateShrinkwrapper=3;//Wait
                }else{
                    if(statesShrinkwrapper[4]==1){
                        stateShrinkwrapper=4;//Block
                    }
                }
            }
            Shrinkwrapper = {
                ST: stateShrinkwrapper,
                //CPQI: joinWord(resp.register[51],resp.register[50]),
                CPQO: joinWord(resp.register[53],resp.register[52]),
                //CPQR: joinWord(resp.register[49],resp.register[48]),
                SP: speedShrinkwrapper
            };
            if(flagPrintShrinkwrapper==1){
                for(var key in Shrinkwrapper){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Shrinkwrapper_L23.log","tt="+timeShrinkwrapper+",var="+key+",val="+Shrinkwrapper[key]+"\n");
                }
                flagPrintShrinkwrapper=0;
            }
          //Shrinkwrapper -------------------------------------------------------------------------------------------------------------
          //Taper -------------------------------------------------------------------------------------------------------------
            ctTaper = joinWord(resp.register[55],resp.register[54]);
              if(flagONS10===0){
                speedTempTaper=ctTaper;
                flagONS10=1;
            }
            if (secTaper>=60){
                if(stopCountTaper===0||flagStopTaper==1){
                   flagPrintTaper=1;
                    secTaper=0;
                    speedTaper=ctTaper-speedTempTaper;
                    speedTempTaper=ctTaper;
                }
                if(flagStopTaper==1){
                    timeTaper=Date.now();
                }
            }
            secTaper++;
            if(ctTaper>actualTaper){
                stateTaper=1;//RUN
                if(stopCountTaper>=timeStop){
                    speedTaper=0;
                    secTaper=0;
                }
                timeTaper=Date.now();
                stopCountTaper=0;
                flagStopTaper=0;


            }else if(ctTaper==actualTaper){
                if(stopCountTaper===0){
                    timeTaper=Date.now();
                }
                stopCountTaper++;
                if(stopCountTaper>=timeStop){
                    stateTaper=2;//STOP
                    speedTaper=0;
                    if(flagStopTaper===0){
                        flagPrintTaper=1;
                        secTaper=0;
                    }
                    flagStopTaper=1;
                }
            }
            if(stateTaper==2){
                speedTempTaper=ctTaper;
            }

            actualTaper=ctTaper;
            if(stateTaper==2){
                if(statesTaper[5]==1){
                    stateTaper=3;//Wait
                }else{
                    if(statesTaper[4]==1){
                        stateTaper=4;//Block
                    }
                }
            }
            Taper = {
                ST: stateTaper,
                //CPQI: joinWord(resp.register[51],resp.register[50]),
                CPQO: joinWord(resp.register[55],resp.register[54]),
                //CPQR: joinWord(resp.register[49],resp.register[48]),
                SP: speedTaper
            };
            if(flagPrintTaper==1){
                for(var key in Taper){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Taper_L23.log","tt="+timeTaper+",var="+key+",val="+Taper[key]+"\n");
                }
                flagPrintTaper=0;
            }
          //Taper -------------------------------------------------------------------------------------------------------------
          //Checkweigher2 -------------------------------------------------------------------------------------------------------------
            ctCheckweigher2 = joinWord(resp.register[57],resp.register[56]);
              if(flagONS11===0){
                speedTempCheckweigher2=ctCheckweigher2;
                flagONS11=1;
            }
            if (secCheckweigher2>=60){
                if(stopCountCheckweigher2===0||flagStopCheckweigher2==1){
                   flagPrintCheckweigher2=1;
                    secCheckweigher2=0;
                    speedCheckweigher2=ctCheckweigher2-speedTempCheckweigher2;
                    speedTempCheckweigher2=ctCheckweigher2;
                }
                if(flagStopCheckweigher2==1){
                    timeCheckweigher2=Date.now();
                }
            }
            secCheckweigher2++;
            if(ctCheckweigher2>actualCheckweigher2){
                stateCheckweigher2=1;//RUN
                if(stopCountCheckweigher2>=timeStop){
                    speedCheckweigher2=0;
                    secCheckweigher2=0;
                }
                timeCheckweigher2=Date.now();
                stopCountCheckweigher2=0;
                flagStopCheckweigher2=0;


            }else if(ctCheckweigher2==actualCheckweigher2){
                if(stopCountCheckweigher2===0){
                    timeCheckweigher2=Date.now();
                }
                stopCountCheckweigher2++;
                if(stopCountCheckweigher2>=timeStop){
                    stateCheckweigher2=2;//STOP
                    speedCheckweigher2=0;
                    if(flagStopCheckweigher2===0){
                        flagPrintCheckweigher2=1;
                        secCheckweigher2=0;
                    }
                    flagStopCheckweigher2=1;
                }
            }
            if(stateCheckweigher2==2){
                speedTempCheckweigher2=ctCheckweigher2;
            }

            actualCheckweigher2=ctCheckweigher2;
            if(stateCheckweigher2==2){
                if(statesCheckweigher2[5]==1){
                    stateCheckweigher2=3;//Wait
                }else{
                    if(statesCheckweigher2[4]==1){
                        stateCheckweigher2=4;//Block
                    }
                }
            }
            Checkweigher2 = {
                ST: stateCheckweigher2,
                CPQI: joinWord(resp.register[57],resp.register[56]),
                CPQO: joinWord(resp.register[59],resp.register[58]),
                CPQR: joinWord(resp.register[61],resp.register[60]),
                SP: speedCheckweigher2
            };
            if(flagPrintCheckweigher2==1){
                for(var key in Checkweigher2){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Checkweigher2_L23.log","tt="+timeCheckweigher2+",var="+key+",val="+Checkweigher2[key]+"\n");
                }
                flagPrintCheckweigher2=0;
            }
          //Checkweigher2 -------------------------------------------------------------------------------------------------------------
          //Paletizer -------------------------------------------------------------------------------------------------------------
            ctPaletizer = joinWord(resp.register[63],resp.register[62]);
              if(flagONS12===0){
                speedTempPaletizer=ctPaletizer;
                flagONS12=1;
            }
            if (secPaletizer>=60){
                if(stopCountPaletizer===0||flagStopPaletizer==1){
                   flagPrintPaletizer=1;
                    secPaletizer=0;
                    speedPaletizer=ctPaletizer-speedTempPaletizer;
                    speedTempPaletizer=ctPaletizer;
                }
                if(flagStopPaletizer==1){
                    timePaletizer=Date.now();
                }
            }
            secPaletizer++;
            if(ctPaletizer>actualPaletizer){
                statePaletizer=1;//RUN
                if(stopCountPaletizer>=timeStop){
                    speedPaletizer=0;
                    secPaletizer=0;
                }
                timePaletizer=Date.now();
                stopCountPaletizer=0;
                flagStopPaletizer=0;


            }else if(ctPaletizer==actualPaletizer){
                if(stopCountPaletizer===0){
                    timePaletizer=Date.now();
                }
                stopCountPaletizer++;
                if(stopCountPaletizer>=timeStop){
                    statePaletizer=2;//STOP
                    speedPaletizer=0;
                    if(flagStopPaletizer===0){
                        flagPrintPaletizer=1;
                        secPaletizer=0;
                    }
                    flagStopPaletizer=1;
                }
            }
            if(statePaletizer==2){
                speedTempPaletizer=ctPaletizer;
            }

            actualPaletizer=ctPaletizer;
            if(statePaletizer==2){
                if(statesPaletizer[5]==1){
                    statePaletizer=3;//Wait
                }else{
                    if(statesPaletizer[4]==1){
                        statePaletizer=4;//Block
                    }
                }
            }
            Paletizer = {
                ST: statePaletizer,
                CPQI: joinWord(resp.register[63],resp.register[62]),
                //CPQO: joinWord(resp.register[59],resp.register[58]),
                //CPQR: joinWord(resp.register[61],resp.register[60]),
                SP: speedPaletizer
            };
            if(flagPrintPaletizer==1){
                for(var key in Paletizer){
                    fs.appendFileSync("/home/oee/Pulse/BYD_L23_LOGS/pol_byd_Paletizer_L23.log","tt="+timePaletizer+",var="+key+",val="+Paletizer[key]+"\n");
                }
                flagPrintPaletizer=0;
            }
          //Paletizer -------------------------------------------------------------------------------------------------------------
          //EOL --------------------------------------------------------------------------------------------------------------------
          if(secEOL>=60){
            fs.appendFileSync("../BYD_L23_LOGS/pol_byd_EOL_L23.log","tt="+Date.now()+",var=EOL"+",val="+Paletizer.CPQI+"\n");
            secEOL=0;
          }
          secEOL++;
          //EOL --------------------------------------------------------------------------------------------------------------------
    });//END Client Read
};




function match(val1, arr) {
	for (let i in arr) {
		if (arr[i].itfOuter == val1)
			return true
	}
	return false
}

var assignment = function (val){
  var result;
  if(val<4095)
    result = "";
  else
    result = val;
    return result;
};

function hex2a(hex){
   var str = '';
   for (var i = 0; i < hex.length; i += 2)
   str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

var stateMachine = function (data){
	if(data[7]==1){
		return 1;//RUN
	}
	if(data[6]==1){
		return 2;//STOP
	}
	if(data[5]==1){
		return 3;//WAIT
	}
	if(data[4]==1){
		return 4;//BLOCK
	}
	return 2;
};

var counterState = function (actual,temp){
	if(actual!=temp){
		return 1;
	}else {
		return 2;
	}
};

var writedata = function (varJson,nameFile){
    var data;
    var timet=Date.now();
    for(var key in varJson){
        fs.appendFileSync("/home/pi/Pulse/BYD_L23_LOGS/"+nameFile,"tt="+timet+",var="+key+",val="+varJson[key]+"\n");
    }
};

var writedataBarcode = function (barcode,nameFile){
    var timet=Date.now();
    fs.appendFileSync("../BYD_L23_LOGS/"+nameFile,"tt="+timet+",var=bc"+",val="+barcode+"\n");
};

var joinWord = function (num1,num2){
    var bits="00000000000000000000000000000000";
    var  bin1=num1.toString(2),
         bin2=num2.toString(2),
         newNum = bits.split("");

        for(var i=0;i<bin1.length;i++){
            newNum[31-i]=bin1[(bin1.length-1)-i];
        }
        for(var j=0;j<bin2.length;j++){
            newNum[15-j]=bin2[(bin2.length-1)-j];
        }
        bits=newNum.join("");
        return parseInt(bits,2);
};
var switchData = function (num1,num2){
    var bits="00000000000000000000000000000000";
    var  bin1=num1.toString(2),
        bin2=num2.toString(2),
        newNum = bits.split("");

        for(var i=0;i<bin1.length;i++){
            newNum[15-i]=bin1[(bin1.length-1)-i];
        }
        for(var j=0;j<bin2.length;j++){
            newNum[31-j]=bin2[(bin2.length-1)-j];
        }
        bits=newNum.join("");

        return bits;
};

var stop = function () {
    ///This function clean data
    clearInterval(intId);
};

var shutdown = function () {
    ///Use function STOP and close connection
    stop();
    client.close();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


///*If client is connect call a function "DoRead"*/
client.on('connect', function(err) {
      setTimeout(function() {
      	mongoClient.connect('mongodb://localhost:27017',function(err, clientdb) {
      	if (err) throw err
      	var db = clientdb.db('BarcodeReaderQuality')
      		setInterval( function () {
      			db.collection('MasterData').find({'ean': eanGlobal}).toArray(function(err, resp) {
      				if (err) throw err
      				let expectedContent = resp
      					db.collection('actualData').findOne({},function(err,resp){
      						let isValid = match(itfOuterGlobal, expectedContent), state
      						if(isValid){
      							registerOutput = 11
      							let query = {$set: {date: 0, flag : false, du: eanGlobal, itfOuter: itfOuterGlobal} }
      							db.collection('actualData').updateOne({},query, function(err, succ){null})
      						}
      						else if (!resp.flag && !isValid){
      								registerOutput = 11
      								let query = {$set: {date: Date.now(), flag : true, du: eanGlobal, itfOuter: itfOuterGlobal} }
      								db.collection('actualData').updateOne({},query, function(err, succ){null})
      						} else if (resp.flag && resp.date < Date.now() - 5 * 60000) {
      								registerOutput = 200
                  }
                  client.writeSingleRegister(90,11).then(function(resp) {})
                  client.writeSingleCoil(2010,true).then(function(resp) {null})
                  client.writeSingleCoil(2011,true).then(function(resp) {null})
      					})
      			})
      		},1000)
      	})
      },30000)
    setInterval(function(){
        DoRead();
    }, 1000);
});

///*If client is in a error ejecute an acction*/
client.on('error', function (err) {
    fs.appendFileSync("error.log","ID 1: "+Date.now()+": "+err+"\n");
    //console.log('Client Error', err);
});
///If client try closed, this metodo try reconnect client to server
client.on('close', function () {
    //console.log('Client closed, stopping interval.');
    fs.appendFileSync("error.log","ID 2: "+Date.now()+": "+'Client closed, stopping interval.'+"\n");
    stop();
});

}catch(err){
    fs.appendFileSync("error.log","ID 3: "+Date.now()+": "+err+"\n");
}
