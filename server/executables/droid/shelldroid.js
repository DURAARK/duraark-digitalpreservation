var terminal = require('child_process').spawn('bash'); //swith for cmd on windows?


terminal.stdout.on('data', function(data) {
    var nettoString = String(data).trim(); //convert Object to string and then remove whitespace.
    var arr = []
    var jsonarray = [];

    if (nettoString.length > 0) {
        arr = nettoString.split(",");
        var jsonobject = {
            "key": arr[0],
            "value": arr[1]
        };
        jsonarray.push(jsonobject);
        console.log(JSON.stringify(jsonarray)); //this is not debugging, this is the actual only output from a successful run of this program
    }
});

terminal.on('exit', function(code) {
    //console.log('child process exited with code ' + code);
});

setTimeout(function() {
    // process.argv.forEach(function(val, index, array) {
    //     console.log(index + ': ' + val);
    // });

    var file_path = process.argv[2].replace(/\\/g, '/');
    // var aCommand = "java -jar ./server/executables/droid/droid-command-line-6.2.0-SNAPSHOT.jar -q -R -Nr d:/Projekte/duraark/devspace/projects/workbench-app/server/uploads/3c9a30924d2d8632ef9a33f315cfc344.png -Ns ./server/executables/droid/DROID_SignatureFile_V74.xml";
    var aCommand = "java -jar ./server/executables/droid/droid-command-line-6.2.0-SNAPSHOT.jar -q -R -Nr " + file_path + " -Ns ./server/executables/droid/DROID_SignatureFile_V74.xml";

    // console.log('aCommand: ' + aCommand);

    terminal.stdin.write(aCommand + "\n");
    terminal.stdin.end();
}, 10);