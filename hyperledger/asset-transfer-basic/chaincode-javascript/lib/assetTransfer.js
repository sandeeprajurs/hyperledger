/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
// const ClientIdentity = require('fabric-shim').ClientIdentity;

class AssetTransfer extends Contract {

    async createNewMarble(ctx, id, org) {
        let color = ""
        let marble = {}
        if(org === "Org1")
            color = "red"
        else if(org === "Org2")
            color = "blue"

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

    async buyMarble(ctx, id, newOwner) {
        let marble = await this.getMarbleByID(ctx, id); 
        if(marble.currentOwner === newOwner)
            throw new Error(`Marble with id:${id} is already purchased`);
        marble.currentOwner = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(marble)));
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
