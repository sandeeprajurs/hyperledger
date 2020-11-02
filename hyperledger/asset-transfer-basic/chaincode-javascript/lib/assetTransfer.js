/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

class AssetTransfer extends Contract {

    async createNewMarble(ctx, id) {
        let cid = new ClientIdentity(ctx.stub); 
        let color = ""
        let org = ""
        let marble = {}
        let marbleJSON = await ctx.stub.getState(id);
        if(marbleJSON.length !== 0)
            return JSON.stringify(`The marble with id: ${id} already exist`);
        
        if(cid.getMSPID() === "Org1MSP"){
            color = "red"
            org = "Org1"
        }   
        else if(cid.getMSPID() === "Org2MSP"){
            color = "blue"
            org = "Org2"
        }

        marble = {
            id: id,
            marbleName: `${id}_${color}`,
            color: color,
            manufacturedBy: org,
            currentOwner: org
        }
        ctx.stub.putState(id, Buffer.from(JSON.stringify(marble)));
        return JSON.stringify(marble);
    }

    async getMarbleByID(ctx, id) {
        const marbleJSON = await ctx.stub.getState(id);
        if(!marbleJSON || marbleJSON.length === 0)
            throw new Error(`The marble ${id} does not exist`);
        return JSON.parse(marbleJSON);
    }

    async sellMarble(ctx, id, newOwner) {
        let org = { "Org1MSP": "Org1", "Org2MSP": "Org2" };
        let cid = new ClientIdentity(ctx.stub); 
        let mspid = cid.getMSPID();
        let marble = await this.getMarbleByID(ctx, id); 
        if(marble.currentOwner === newOwner){
            return JSON.stringify(`Cant sell Marble to same organization`);
        }
        if(marble.currentOwner === org[mspid]){
            marble.currentOwner = newOwner;
            ctx.stub.putState(id, Buffer.from(JSON.stringify(marble)));
            return JSON.stringify(marble);
        }
        else{
            return JSON.stringify(`Marble with id:${id} is not present with ${org[mspid]}`);
        }
    }

    async getAllMarbles(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;
