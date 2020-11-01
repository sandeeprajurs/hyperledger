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
const org2UserId = 'appUser100';

const express = require('express');
const { disconnect } = require('process');
const app = express()
const port = 3000


async function initilize() {
    try {
        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

        const wallet = await buildWallet(Wallets, walletPath);
        await enrollAdmin(caClient, wallet, mspOrg1);
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org2UserId, 'org1.department1');
        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
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
    let init = await initilize();
    let contract = init[0];
    let gateway = init[1];
    console.log('\n--> Get all marbles');
    let result = await contract.evaluateTransaction('getAllMarbles');
    console.log(`*** Result: ${result.toString()}`);
    disconnectGateWay(gateway);
    res.send(JSON.parse(result.toString()));
});

app.get('/getMarble', async (req, res) => {
    let init = await initilize();
    let contract = init[0];
    let gateway = init[1];
    console.log('\n--> Get marble by ID');
    let result = await contract.evaluateTransaction('getMarbleByID', req.headers.id);
    console.log(`*** Result: ${result.toString()}`);
    disconnectGateWay(gateway);
    res.send(JSON.parse(result.toString()));
});

app.post('/buyMarble', async (req, res) => {
    let init = await initilize();
    let contract = init[0];
    let gateway = init[1];
    console.log('\n--> Buy Marble');
    await contract.submitTransaction('buyMarble', req.headers.id, req.headers.org);
    let result = await contract.submitTransaction('getMarbleByID', req.headers.id);
    disconnectGateWay(gateway);
    console.log(`*** Result: ${result.toString()}`);
    res.send(JSON.parse(result.toString()));
})

app.post('/manufacture', async (req, res) => {
    let init = await initilize();
    let contract = init[0];
    let gateway = init[1];
    console.log('\n--> Manufacture Marble');
    let result = await contract.submitTransaction('createNewMarble', req.headers.id, req.headers.org);
    console.log(`*** Result: ${result.toString()}`);
    disconnectGateWay(gateway);
    res.send(JSON.parse(result.toString()));
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})