const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const{v4:uuid} = require('uuid');


function Blockchain()
{
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl=currentNodeUrl;
    this.networkNodes=[];
    this.createNewBlock(100,'0','0');

};


Blockchain.prototype.createNewBlock = function(nonce,previousBlockHash,hash)
{
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
};


Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];

};



Blockchain.prototype.createNewTransaction = function(sender,recipient,transactionId,public_id,discharge_code,amount,claim_status,payment_status){
    const newTransaction = {
    
        sender: sender,
        recipient: recipient,
        transactionId:uuid().split('-').join(''),
        public_id:public_id,
        discharge_code:discharge_code,
        amount: amount,
        claim_status:claim_status,
        payment_status:payment_status
        
        
    };
    //this.pendingTransactions.push(newTransaction);
    
   // return this.getLastBlock()['index']+1;
   return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj)
{
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index'] + 1;

};

Blockchain.prototype.hashBlock = function(previousBlockhash,currentBlockData,nonce)
{
    const dataAsString = previousBlockhash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
};


Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData)
{
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
    while(hash.substring(0,4) != '0000'){
        nonce++;
        hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
        
       
    }
    return nonce;
};


module.exports = Blockchain;
