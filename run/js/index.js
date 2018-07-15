if (typeof web3 !== 'undefined'){
  web3 = new Web3(web3.currentProvider);
}
else {
  alert('You have to install MetaMask !');
}

const contractABI = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"issuersList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numberOfDiplomas","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numberOfAdmins","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"Owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_admin","type":"address"}],"name":"eNewAdminAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_admin","type":"address"}],"name":"eAdminRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_issuer","type":"address"},{"indexed":false,"name":"_issuerName","type":"string"},{"indexed":false,"name":"_issuerWebDomain","type":"string"}],"name":"eNewIssuerRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_issuer","type":"address"}],"name":"eIssuerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_issuer","type":"address"},{"indexed":false,"name":"_diplomaHash","type":"bytes32"}],"name":"eNewDiplomaRegistered","type":"event"},{"constant":false,"inputs":[{"name":"_admin","type":"address"}],"name":"addAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_admin","type":"address"}],"name":"removeAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_candidate","type":"address"}],"name":"isAdmin","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_issuer","type":"address"},{"name":"_issuerName","type":"string"},{"name":"_issuerWebDomain","type":"string"}],"name":"registerIssuer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_issuer","type":"address"}],"name":"getIssuerName","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_issuer","type":"address"}],"name":"getIssuerData","outputs":[{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getIssuersList","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getNumberOfIssuers","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_diplomaData","type":"string"}],"name":"registerDiploma","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_diplomaData","type":"string"}],"name":"checkDiploma","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_diplomaHash","type":"bytes32"}],"name":"registerDiplomaByHash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_diplomaHash","type":"bytes32"}],"name":"checkDiplomaByHash","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}];
const contractAddress = "0x492972459d2e766258fe1fe40f87084f26da8f4b"; //rinkeby
//const contractAddress = "0xdc3a3ad9cbb3689a2f509766f840a93e22dfdb0f"; //ganache
const contractInstance = web3.eth.contract(contractABI).at(contractAddress);

//events
let onNewAdminAdded = contractInstance.eNewAdminAdded();
let onAdminRemoved = contractInstance.eAdminRemoved();
let onNewIssuerRegistered = contractInstance.eNewIssuerRegistered();
let onIssuerRemoved = contractInstance.eIssuerRemoved();
let onNewDiplomaRegistered = contractInstance.eNewDiplomaRegistered();

function ready(callback){
    // in case the document is already rendered
    if (document.readyState!='loading') callback();
    // modern browsers
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
    // IE <= 8
    else document.attachEvent('onreadystatechange', function(){
        if (document.readyState=='complete') callback();
    });
}

ready(function(){
    console.log("Ready");

/*    web3.eth.getAccounts(function(err,accounts){
        if(!err) document.getElementById("rd_issuer").innerHTML = accounts[0];
        else document.getElementById("rd_issuer").innerHTML = err.message;
    });
*/
    if(typeof(window.web3.eth.defaultAccount) == "undefined"){
        alert("Please unlock Metamask and refresh the page!");
        return;
    }

    document.getElementById("rd_issuer").value = window.web3.eth.defaultAccount;

    contractInstance.getNumberOfIssuers(function(err,res){
        if(!err) document.getElementById("numberOfIssuers").innerHTML = res;
        else document.getElementById("numberOfIssuers").innerHTML = err.message;
    });

    contractInstance.numberOfDiplomas(function(err,res){
        if(!err) document.getElementById("numberOfDiplomas").innerHTML = res;
        else document.getElementById("numberOfDiplomas").innerHTML = err.message;
    });

    contractInstance.Owner(function(err,res){
        if(!err) {
            document.getElementById("contractOwner").innerHTML = res;
            document.getElementById("_admin").value = res;
        }
        else document.getElementById("contractOwner").innerHTML = err.message;
    });

    var addAdmin = document.getElementById("addAdmin");
    addAdmin.onclick = function() {
        let _admin = document.getElementById("_admin").value;
        elem = document.getElementById("adminResult");
        elem.innerHTML = "Please wait...";
        contractInstance.addAdmin(_admin,
            {from: web3.eth.accounts[0]},function(err, res){
            if(!err) elem.innerHTML = "New admin is added";
            else elem.innerHTML = "Error:" + err.message;
        });
    }

    var removeAdmin = document.getElementById("removeAdmin");
    removeAdmin.onclick = function() {
        let _admin = document.getElementById("_admin").value;
        elem = document.getElementById("adminResult");
        elem.innerHTML = "Please wait...";
        contractInstance.removeAdmin(_admin,
            {from: web3.eth.accounts[0]},function(err, res){
            if(!err) elem.innerHTML = "Admin is removed";
            else elem.innerHTML = "Error:" + err.message;
        });
    }

    var checkIfAdmin = document.getElementById("checkIfAdmin");
    checkIfAdmin.onclick = function() {
        let _admin = document.getElementById("_admin").value;
        elem = document.getElementById("adminResult");
        elem.innerHTML = "Please wait...";
        contractInstance.isAdmin(_admin,
            {from: web3.eth.accounts[0]},function(err, res){
            if(!err) elem.innerHTML = res;
            else elem.innerHTML = "Error:" + err.message;
        });
    }

    var registerIssuer = document.getElementById("registerIssuer");
    registerIssuer.onclick = function() {
        let _issuer = document.getElementById("_issuer").value;
        let _issuerName = document.getElementById("_issuerName").value;
        let _issuerWebDomain = document.getElementById("_issuerWebDomain").value;
        /* function registerIssuer(address _issuer, string _issuerName, string _issuerWebDomain) */
        elem = document.getElementById("registerIssuerResult");
        registerIssuer.disabled = true;
        document.getElementById("registerIssuerHref").hidden = false;
        //https://ethereum.stackexchange.com/questions/9636/whats-the-proper-way-to-wait-for-a-transaction-to-be-mined-and-get-the-results
        contractInstance.registerIssuer(_issuer,_issuerName,_issuerWebDomain,
            {from: web3.eth.accounts[0]},function(err, res){
            if(!err) {
                //elem.innerHTML = "Please wait...";
                console.log(res);
                document.getElementById("registerIssuerHref").href = 'https://rinkeby.etherscan.io/tx/' + res;
                onNewIssuerRegistered.watch(function(err2, res2) {
                    if(!err2) {
                        elem.innerHTML = "New issuer is registered";
                        //document.getElementById("yourResult").innerHTML = res2.args["result"];
                        onNewIssuerRegistered.stopWatching();
                        registerIssuer.disabled = false;
                        document.getElementById("registerIssuerHref").hidden = true;
                    }
                    else {
                        elem.innerHTML = "Error:" + err2.message;
                        registerIssuer.disabled = false;
                        document.getElementById("registerIssuerHref").hidden = true;
                    }
                });
            }
            else {
                elem.innerHTML = "Error:" + err.message;
                registerIssuer.disabled = false;
                document.getElementById("registerIssuerImg").hidden = true;
            }
        });
    }

    var registerDiploma = document.getElementById("registerDiploma");
    registerDiploma.onclick = function(){
        let rd_studentName = document.getElementById("rd_studentName").value;
        let rd_diplomaID = document.getElementById("rd_diplomaID").value;
        let rd_diplomaDate = document.getElementById("rd_diplomaDate").value;
        let _diplomaData = rd_studentName + ';' + rd_diplomaID + ';' + rd_diplomaDate;
        console.log(_diplomaData);
        /* function registerDiploma(string _diplomaData) onlyIssuer public returns (bytes32) { */
        elem = document.getElementById("registerDiplomaResult");
        elem.innerHTML = "Please wait...";
        contractInstance.registerDiploma(_diplomaData,function(err,res){
            if(!err) elem.innerHTML = "New diploma is registered";
            else elem.innerHTML = "Error:" + err.message;
        });
    };

    var checkDiploma = document.getElementById("checkDiploma");
    checkDiploma.onclick = function(){
        let cd_studentName = document.getElementById("cd_studentName").value;
        let cd_diplomaID = document.getElementById("cd_diplomaID").value;
        let cd_diplomaDate = document.getElementById("cd_diplomaDate").value;
        let _diplomaData = cd_studentName + ';' + cd_diplomaID + ';' + cd_diplomaDate;
        console.log(_diplomaData);
        /* function checkDiploma(string _diplomaData) public view returns (address) */
        elem = document.getElementById("checkDiplomaResult");
        elem.innerHTML = "Please wait...";
        contractInstance.checkDiploma(_diplomaData,function(err,res){
            if(!err) {
                if (res == "0x0000000000000000000000000000000000000000") elem.innerHTML = "Diploma is NOT registered";
                else elem.innerHTML = "Diploma is registered by " + res;
            }
            else elem.innerHTML = "Error:" + err.message;
        });
    };

    contractInstance.getIssuersList({from: web3.eth.accounts[0]},function(err,res){
        if(!err) {
            for (let elem of res) {
                elemIssuersList = document.getElementById("issuersList");
                //elemIssuersList.innerHTML += elem + '<br />';
                contractInstance.getIssuerName(elem,function(err,res){
                    if(!err) {
                        elemIssuersList.innerHTML += res + ' (' + String(elem).substring(0,6) + '...)' + '<br />';
                    }
                    else elemIssuersList.innerHTML += ' (' + String(elem).substring(0,6) + ')' + "Error:" + err.message + '<br />';
                });
            }
        }
        else {
            console.log(err.message);
        }
    });

});