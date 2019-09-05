const Web3 = require('web3');
//require('dotenv').config();
//const ropstenUrl = `https://ropsten.infura.io/v3/${process.env.ROPSTENINFURA}`;
//var web3 = new Web3(new Web3.providers.HttpProvider(ropstenUrl), null, { transactionConfirmationBlocks: 1 })
const config = require('../../config');
const Contract = config.duelContracts.rinkeby;
const Provider = require('../../providers');
let web3Providers = {
  rinkeby: null,
  mainnet: null
};

//console.log(web3)
//const Contract='0x744b02E544338D3e9C963f3EF32E9A76925d228E'

let testduel={

    "constant": true,
    "inputs": [
      {
        "name": "moveSet1",
        "type": "bytes32"
      },
      {
        "name": "moveSet2",
        "type": "bytes32"
      },
      {
        "name": "power1",
        "type": "uint256"
      },
      {
        "name": "power2",
        "type": "uint256"
      },
      {
        "name": "affinity1",
        "type": "uint256"
      },
      {
        "name": "affinity2",
        "type": "uint256"
      }
    ],
    "name": "resolveDuel",
    "outputs": [
      {
        "name": "power",
        "type": "int256"
      },
      {
        "name": "score",
        "type": "int256"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function",
    "signature": "0xb089894c"
  }
let validAffinity=  {
    "constant": true,
    "inputs": [
      {
        "name": "affinity",
        "type": "uint256"
      }
    ],
    "name": "isValidAffinity",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
let validMove=  {
    "constant": true,
    "inputs": [
      {
        "name": "moveSet",
        "type": "bytes32"
      }
    ],
    "name": "isValidMoveSet",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function",
    "signature": "0x1823fbbc"
  }
  let moveMask={
    "constant": true,
    "inputs": [],
    "name": "moveMask",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xbfd4279e"
  }
   async function SendWeb3Call(functionABI,inputarray,contract,web3){
    try{
     
     var DATA=web3.eth.abi.encodeFunctionCall(functionABI,inputarray)
    // console.log(DATA)
     
     const transactionObject = {
        to:contract,
        DATA,
       }
      // console.log(transactionObject)
    let ret= await web3.eth.call(transactionObject)
    //console.log(ret)
    return ret
      
  
    }catch(err){
      console.log(err)
    }
    
}

 function generateMoveSet(move1,move2,move3,move4,move5){
    return '0x0'+move1+'0'+move2+'0'+move3+'0'+move4+'0'+move5+'000000000000000000000000000000000000000000000000000000'
}

 function decodeMoveSet(Movebytes){
  let slice=Movebytes.slice(3,12)
  let moves=[Number(slice[0]),Number(slice[2]),Number(slice[4]),Number(slice[6]),Number(slice[8])]
  return moves
}

 async function SimulateDuel(moves1,moves2,power1,power2,affinity1,affinity2,web3){
    try{
        let MS1= generateMoveSet(moves1[0],moves1[1],moves1[2],moves1[2],moves1[3])
        //console.log(MS1)
        let MS2= generateMoveSet(moves2[0],moves2[1],moves2[2],moves2[2],moves2[3])
        
        let result =await SendWeb3Call(testduel,[MS1,MS2,power1,power2,affinity1,affinity2],Contract,web3)
        console.log('Raw Result (undecoded) =>', result);
        result=web3.eth.abi.decodeParameters(['int256', 'int256'], result);
        return result

        }catch(e){
            console.log('this is the error')
            console.log(e)
        }
    }
//SendWeb3Call(moveMask,[],'0x460e03F68656Dfa0D462B59602AD75d78392cE3C')
//SendWeb3Call(validAffinity,[100],Contract)

const construct = async function () {
  let web3 = web3Providers.rinkeby = await Provider.getWssWeb3Rinkeby();
  let duelSimulation = await SimulateDuel([2,4,3,4,2],[2,4,3,3,4],5,5,3,4,web3);
  console.log('Resolved Duel =>', [typeof duelSimulation, duelSimulation]);
  process.exit();
}

construct();