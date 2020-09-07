const Blockchain = require('./blockchain');

const bitcoin = new Blockchain;



bitcoin.createNewBlock(2389,'OINA90SDNF90N','90ANSD9FN009N');

bitcoin.createNewTransaction(100,'ALEXSD89F9W0N90A','JENN0AN09N09A9');

bitcoin.createNewBlock(123123,'09IOANSDFN0','OIHNJ909A0S9NF');

const previousBlockhash = 'OINAJVHJHDHDJFJHGDJHD';
const currentBlockData = [
    {
        amount: 10,
        sender: 'HDJFBSHGFBNDGBFGHDJHF',
        recipient: 'DHJFGDHJGFGFDHFGHFG'
    },
    {
        amount: 100,
        sender: 'DSKDSDJFBNDGBFGHDJHF',
        recipient: 'JSNBHNDVSVGSFGDHGFHDGF'
    },
    {
        amount: 30,
        sender: 'HDJFBSHJDFHDFHDDHFJU',
        recipient: 'DHJSDDKJHJDHDDDFSDGF'
    }
];

console.log(bitcoin.proofOfWork(previousBlockhash,currentBlockData));
 
console.log(bitcoin.hashBlock(previousBlockhash,currentBlockData,194449));

console.log(bitcoin);