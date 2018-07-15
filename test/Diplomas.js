'use strict';
import {assertEquals} from './helpers/asserts';
import expectThrow from './helpers/expectThrow';
//https://stackoverflow.com/questions/18338890/are-there-any-sha-256-javascript-implementations-that-are-generally-considered-t
import * as sjcl from './helpers/sjcl';

//import Web3 from './helpers/web3.min';
//import { hexToBytes } from './helpers/hexToBytes';
//var web3 = new Web3();
//var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");
//console.log(web3.utils.hexToBytes('0x000000ea'));
//console.log(hexToBytes('0x000000ea'));

const Diploma = artifacts.require('Diploma.sol');

contract('Diploma testing', function (accounts) {

    it('init', async function () {
        const contract = await Diploma.new({from: accounts[0]});
        var numberOfIssuers = parseFloat (await contract.getNumberOfIssuers());
        assert.equal(numberOfIssuers,0);
    });

    it('add and remove admins', async function () {
        const owner = accounts[0];
        const contract = await Diploma.new({from: owner});

        let isAdmin = await contract.isAdmin(owner);
        assert.equal(isAdmin,true);

        await contract.removeAdmin(owner);
        isAdmin = await contract.isAdmin(owner);
        assert.equal(isAdmin,false);

        await contract.addAdmin(accounts[1]);
        isAdmin = await contract.isAdmin(accounts[1]);
        assert.equal(isAdmin,true);

        isAdmin = await contract.isAdmin(accounts[2]);
        assert.equal(isAdmin,false);

        await contract.removeAdmin(accounts[1]);
        isAdmin = await contract.isAdmin(accounts[1]);
        assert.equal(isAdmin,false);

        await expectThrow(contract.addAdmin("0x0000000000000000000000000000000000000000",{from: owner}));
    });

//    it('add issuer', async () => {
    it('register issuer', async function () {
        const contract = await Diploma.new({from: accounts[0]});
        const issName = "Stanford"
        const issDomain = "stanford.edu"
        const { logs } = await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'eNewIssuerRegistered');

        assert.equal(await contract.getIssuerName(accounts[1]), issName);

        let [name,domain] = await contract.getIssuerData(accounts[1]);
        assert.equal(name, issName);
        assert.equal(domain, issDomain);

        let issList = await contract.getIssuersList();
        assert.equal(issList[0], accounts[1]);

        let numberOfIssuers = parseFloat(await contract.getNumberOfIssuers());
        assert.equal(numberOfIssuers,1);
    });

    it('register issuer - check that only admins can', async function () {
        const owner = accounts[0];
        const contract = await Diploma.new({from: owner});
        const issName = "Stanford";
        const issDomain = "stanford.edu";
        // admin can:
        let newAdmin = accounts[3];
        await contract.addAdmin(newAdmin);
        await contract.registerIssuer(accounts[1],issName,issDomain,{from: newAdmin});
        assert.equal(await contract.getIssuerName(accounts[1]), issName);
        // not admin cannot:
        let notAdmin = accounts[2];
        await expectThrow(contract.registerIssuer(accounts[1],issName,issDomain,{from: notAdmin}));
    });

    it('register a few issuers', async function () {
        const contract = await Diploma.new({from: accounts[0]});
        let issName = "Stanford";
        let issDomain = "stanford.edu";
        await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        assert.equal(await contract.getIssuerName(accounts[1]), issName);

        issName = "Harvard";
        issDomain = "harvard.edu";
        await contract.registerIssuer(accounts[2],issName,issDomain,{from: accounts[0]});
        assert.equal(await contract.getIssuerName(accounts[2]), issName);

        let numberOfIssuers = parseFloat(await contract.getNumberOfIssuers());
        assert.equal(numberOfIssuers,2);
    });

    it('register diploma', async () => {
        const contract = await Diploma.new({from: accounts[0]});
        const issName = "Stanford";
        const issDomain = "stanford.edu";
        await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        let diplomaData = "Ivan Ivanov;01/06/2018;SF0289112";
        //let diplomaHash = await contract.registerDiploma(diplomaData,{from: accounts[1]});
        //console.log(diplomaHash);
        const { logs } = await contract.registerDiploma(diplomaData,{from: accounts[1]});
        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'eNewDiplomaRegistered');
        assert.equal(logs[0].args._issuer, accounts[1]);
        // solidity and linux 'echo -n 'Ivan Ivanov;01/06/2018;SF0289112' | sha256sum' gives the same
        assert.equal(logs[0].args._diplomaHash, "0xb842ac17c9a2e7b7725dbef4b8996e876fe2a4a2ec439d948c86bc0b2fe9423f");
    });

    it('register diploma - check that only issuer can', async function () {
        const contract = await Diploma.new({from: accounts[0]});
        const issName = "Stanford";
        const issDomain = "stanford.edu";
        const { logs } = await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        let diplomaData = "Ivan Ivanov;01/06/2018;SF0289112";
        await expectThrow(contract.registerDiploma(diplomaData,{from: accounts[2]}));
        await expectThrow(contract.registerDiploma(diplomaData,{from: accounts[0]}));
    });

    it('check diploma - anybody can do', async function () {
        const contract = await Diploma.new({from: accounts[0]});
        const issName = "Stanford";
        const issDomain = "stanford.edu";
        const { logs } = await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        let diplomaData = "Ivan Ivanov;01/06/2018;SF0289112";
        await contract.registerDiploma(diplomaData,{from: accounts[1]});
        let resIssuer = await contract.checkDiploma(diplomaData,{from: accounts[2]});
        assert.equal(resIssuer,accounts[1]);
        assert.equal(await contract.getIssuerName(resIssuer), issName);
    });

    it('check not valid diploma', async function () {
        const contract = await Diploma.new({from: accounts[0]});
        const issName = "Stanford";
        const issDomain = "stanford.edu";
        const { logs } = await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        let diplomaData = "Ivan Ivanov;01/06/2018;SF0289112";
        let resIssuer = await contract.checkDiploma(diplomaData,{from: accounts[2]});
        assert.equal(resIssuer,"0x0000000000000000000000000000000000000000");
    });

    it('register diploma by hash', async () => {
        const contract = await Diploma.new({from: accounts[0]});
        const issName = "Stanford";
        const issDomain = "stanford.edu";
        await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        let diplomaData = "Ivan Ivanov;01/06/2018;SF0289112";
        // 0xb842ac17c9a2e7b7725dbef4b8996e876fe2a4a2ec439d948c86bc0b2fe9423f
        let diplomaHash = "0x" + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(diplomaData));
        const { logs } = await contract.registerDiplomaByHash(diplomaHash,{from: accounts[1]});
        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'eNewDiplomaRegistered');
        assert.equal(logs[0].args._issuer, accounts[1]);
        assert.equal(logs[0].args._diplomaHash, "0xb842ac17c9a2e7b7725dbef4b8996e876fe2a4a2ec439d948c86bc0b2fe9423f");
    });

    it('check diploma by hash - anybody can do', async function () {
        const contract = await Diploma.new({from: accounts[0]});
        const issName = "Stanford";
        const issDomain = "stanford.edu";
        const { logs } = await contract.registerIssuer(accounts[1],issName,issDomain,{from: accounts[0]});
        let diplomaData = "Ivan Ivanov;01/06/2018;SF0289112";
        // 0xb842ac17c9a2e7b7725dbef4b8996e876fe2a4a2ec439d948c86bc0b2fe9423f
        let diplomaHash = "0x" + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(diplomaData));
        await contract.registerDiplomaByHash(diplomaHash,{from: accounts[1]});
        let resIssuer = await contract.checkDiplomaByHash(diplomaHash,{from: accounts[2]});
        assert.equal(resIssuer,accounts[1]);
        assert.equal(await contract.getIssuerName(resIssuer), issName);
    });

});