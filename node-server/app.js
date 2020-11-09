const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const cors = require('cors')
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./utils/CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildWallet } = require('./utils/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet');
const walletPath1 = path.join(__dirname, 'wallet1');
const org1UserId = 'appUserOrg1';
const org2UserId = 'appUserOrg2';

const express = require('express');
const { disconnect } = require('process');
const app = express()
const port = 4000

var contract = "";
var gateway = "";


async function initilize() {
    try {
        let ccp = buildCCPOrg1();
        console.log(ccp);
        let caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

        let wallet = await buildWallet(Wallets, walletPath);
        await enrollAdmin(caClient, wallet, mspOrg1);
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
        let gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        let network = await gateway.getNetwork(channelName);
        return [network.getContract(chaincodeName), gateway];
    }
    catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }

}

function disconnectGateWay(gateway) {
    gateway.disconnect();
}

app.use(cors())

app.get('/test', cors(), async (req, res) => {
    res.send("test");
});


app.get('/getAllMarbles', cors(), async (req, res) => {
    console.log('\n--> Get all marbles');
    let result = await contract.evaluateTransaction('getAllMarbles');
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
});

app.get('/getMarble', cors(), async (req, res) => {
    console.log('\n--> Get marble by ID');
    let result = await contract.evaluateTransaction('getMarbleByID', req.headers.id);
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
});

app.post('/sellMarble', cors(), async (req, res) => {
    console.log('\n--> Sell Marble');
    let result = await contract.submitTransaction('sellMarble', String(req.headers.id), String(req.headers.org));
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
});

app.post('/manufacture', cors(), async (req, res) => {
    console.log('\n--> Manufacture Marble');
    let result = await contract.submitTransaction('createNewMarble', String(req.headers.id));
    console.log(`*** Result: ${result.toString()}`);
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // next();
    res.send(JSON.parse(result.toString()));
});

async function switchToOrg1(){
    try {
        let ccp = buildCCPOrg1();
        console.log(ccp);
        let caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

        let wallet = await buildWallet(Wallets, walletPath);
        await enrollAdmin(caClient, wallet, mspOrg1);
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
        let gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        let network = await gateway.getNetwork(channelName);
        return [network.getContract(chaincodeName), gateway];
    }
    catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

async function switchToOrg2(){
    try {
        let ccp = buildCCPOrg2();
        console.log(ccp);
        let caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

        let wallet = await buildWallet(Wallets, walletPath1);
        await enrollAdmin(caClient, wallet, mspOrg2);
        await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
        let gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: org2UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        let network = await gateway.getNetwork(channelName);
        return [network.getContract(chaincodeName), gateway];
    }
    catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

app.post('/switchOrg', cors(), async (req, res) => {
    let init = []
    if(req.headers.org === 'Org1')
        init= await switchToOrg1();
    else if(req.headers.org === 'Org2')
        init = await switchToOrg2();
    contract = init[0];
    gateway = init[1];
    res.send(`Switched to ${req.headers.org}`);
});

app.listen(port, async () => {
    let init = await initilize();
    contract = init[0];
    gateway = init[1];
    console.log(`Example app listening at http://localhost:${port}`)
})