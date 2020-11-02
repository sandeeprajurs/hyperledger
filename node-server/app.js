const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./utils/CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildWallet } = require('./utils/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser99';
const org2UserId = 'appUser101';

const express = require('express');
const { disconnect } = require('process');
const app = express()
const port = 3000

let contract = "";
let gateway = "";


async function initilize() {
    try {
        const ccp = buildCCPOrg2();
        console.log(ccp);
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

        const wallet = await buildWallet(Wallets, walletPath);
        await enrollAdmin(caClient, wallet, mspOrg2);
        await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');
        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: org2UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        const network = await gateway.getNetwork(channelName);
        return [network.getContract(chaincodeName), gateway];
    }
    catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }

}

function disconnectGateWay(gateway) {
    gateway.disconnect();
}

app.get('/getAllMarbles', async (req, res) => {
    console.log('\n--> Get all marbles');
    let result = await contract.evaluateTransaction('getAllMarbles');
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
});

app.get('/getMarble', async (req, res) => {
    console.log('\n--> Get marble by ID');
    let result = await contract.evaluateTransaction('getMarbleByID', req.headers.id);
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
});

app.post('/sellMarble', async (req, res) => {
    console.log('\n--> Sell Marble');
    let result = await contract.submitTransaction('sellMarble', req.headers.id, req.headers.org);
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
})

app.post('/manufacture', async (req, res) => {
    console.log('\n--> Manufacture Marble');
    let result = await contract.submitTransaction('createNewMarble', req.headers.id);
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
});

app.listen(port, async () => {
    let init = await initilize();
    contract = init[0];
    gateway = init[1];
    console.log(`Example app listening at http://localhost:${port}`)
})