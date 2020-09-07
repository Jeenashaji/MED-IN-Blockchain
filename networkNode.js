const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain=require('./blockchain');
const{v4:uuid} = require('uuid');
const { request } = require('express');
const { json } = require('body-parser');

const port = process.argv[2];
const rp=require('request-promise');
const requestPromise = require('request-promise');

const nodeAddress=uuid().split('-').join('');

const bitcoin=new Blockchain(); 



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


//////////////////fetch entire Blockchain//////////////////////
app.get('/blockchain', function(req,res){
    res.send(bitcoin);
});


////////////////////create new transcation/////////////////////
app.post('/transaction', function(req,res){
  const newTransaction=req.body;
  const blockIndex=bitcoin.addTransactionToPendingTransactions(newTransaction);
  res.json({note:'Transaction will be added in block ${blockIndex}.'});
  
});



app.post('/transaction/broadcast',function(req,res){
    const newTransaction=bitcoin.createNewTransaction(req.body.sender,req.body.recipient,req.body.transactionId,req.body.public_id,req.body.discharge_code,req.body.amount,req.body.claim_status,req.body.payment_status);
    bitcoin.addTransactionToPendingTransactions(newTransaction);
    const requestPromises=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl +'/transaction',
            method:'POST',
            body:newTransaction,
            json:true
        };
        requestPromises.push(rp(requestOptions));

    });
    Promise.all(requestPromises)
    .then(data=>{
        res.json({note:'transaction created and broadcasted'});
    });
});
    



//////////////////mine a new block/////////////////////////
app.get('/mine', function(req,res){
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData={
        transactions:bitcoin.pendingTransactions,
        index:lastBlock['index'] + 1
    };
    const nonce=bitcoin.proofOfWork(previousBlockHash,currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce);
    bitcoin.createNewTransaction(12.5,"00",nodeAddress);
    const newBlock =bitcoin.createNewBlock(nonce,previousBlockHash,blockHash);
    const requestPromises=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl + '/receive-new-block',
            method:'POST',
            body:{newBlock:newBlock},
            json:true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data=>{
        const requestOptions={
            uri:bitcoin.currentNodeUrl +'/transaction/broadcast',
            method:'POST',
            body:{
                amount:12.5,
                sender:"00",
                recipient:nodeAddress
            },
            json:true
        };
        return rp(requestOptions);
    })
    .then(data=>{
        res.json({
            note:"New block mined successfully and broadcasted successfully",
            block:newBlock
        });
    });

});


app.post('/receive-new-block',function(req,res){
    const newBlock=req.body.newBlock;
    const lastBlock=bitcoin.getLastBlock();
    const correctHash=lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex=lastBlock['index'] + 1 === newBlock['index'];

    if(correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions=[];
        res.json({
            note:'new Block received and accepted',
            newBlock:newBlock
        });

    }else{
        res.json({
            note:'new Block rejected',
            newBlock:newBlock
        });
    }
});


///////////////////////register a node and broadcast it the network////////////////////////
app.post('/register-and-broadcast-node',function(req,res)
{
    const newNodeUrl=req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl)==-1) bitcoin.networkNodes.push(newNodeUrl);
    const regNodesPromises=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>
        {
            const requestOptions=
            {
                uri:networkNodeUrl + '/register-node',
                method:'POST',
                body:{newNodeUrl:newNodeUrl},
                json:true

        };
        regNodesPromises.push(rp(requestOptions));

    });
    Promise.all(regNodesPromises)
    .then(data=>
        {
            const bulkRegisterOptions={
            uri: newNodeUrl + '/register-nodes-bulk',
            method:'POST',
            body:{allNetworkNodes:[...bitcoin.networkNodes,bitcoin.currentNodeUrl]},
            json:true
        };
        return rp(bulkRegisterOptions);
    })
    .then(data=>{
        res.json({note:'new node registered with network successfully'});
    });

    
});

////////////////register a node with the network//////////////
app.post('/register-node',function(req,res){
    const newNodeUrl=req.body.newNodeUrl;
    const nodeNotAlreadyPresent=bitcoin.networkNodes.indexOf(newNodeUrl)==-1;
    const notCurrentNode=bitcoin.currentNodeUrl != newNodeUrl;

    if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    res.json({note:'new node registered successfully '});


});
/////////////////////register multiple nodes at once////////////////////
app.post('/register-nodes-bulk',function(req,res){
    const allNetworkNodes=req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl=>{
        const nodeNotAlreadyPresent=bitcoin.networkNodes.indexOf(networkNodeUrl)==-1;
        const notCurrentNode=bitcoin.currentNodeUrl!=networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);

    });
    res.json({note:"Bulk registration successful"});
});



app.listen(port,function() {
    console.log('Listening on port 3001...');
});