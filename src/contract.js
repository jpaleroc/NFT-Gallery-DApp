import Web3 from 'web3';
import contractAbi from '../contracts/JPNFTGallery_abi.json';

const contractAddress = "0xCd4d30176cd1e667A8860f72743Cf0FFf4c8f853";
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractAbi, contractAddress);
const private_key = "d882722c5cd2bb9e717e1fd77380632afe2cc26d399603a51f7e331384507dde";
const galleryAccount = web3.eth.accounts.privateKeyToAccount(private_key);

/*
  call() se utiliza para obtener informacion sin gastos de wei, y en send se usa con el atributo from de la cuenta desde la cual se llama
  y es utilizado cuando hace falta modificar el smart contract (ej: mint, burn, transfer, etc)
*/

async function getName() {
  if(contract) {
    try {
      return await contract.methods.name().call();
    }catch (err){
      console.log(err);
    }
  }
}

async function getSymbol() {
  if(contract) {
    try {
      return await contract.methods.symbol().call();
    }catch (err){
      console.log(err);
    }
  }
}

async function getNextId() {
  if(contract) {
    try {
      return await contract.methods.getNextId().call();
    }catch (err){
      console.log(err);
    }
  }
}

async function balanceOf(adress) {
  if(contract) {
    try {
      return await contract.methods.balanceOf(adress).call();
    }catch (err){
      console.log(err);
    }
  }
}

async function ownerOf(tokenId) {
  if(contract) {
    try {
      return await contract.methods.ownerOf(tokenId).call();
    }catch (err){
      console.log(err);
    }
  }
}

async function creatorOf(tokenId) {
  if(contract) {
    try {
      return await contract.methods.creatorOf(tokenId).call();
    }catch (err){
      console.log(err);
    }
  }
}

async function tokenURI(tokenId) {
  if(contract) {
    try {
      return await contract.methods.tokenURI(tokenId).call();
    }catch (err){
      console.log(err);
    }
  }
}

async function mint(to, tokenUri) {
  if(contract){
    try{
      await contract.methods.mint(to, tokenUri).send({from: to});
    }catch (err){
      console.log(err);
    }
  }
}

async function burn(tokenId) {
  if(contract) {
    try {
      const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await contract.methods.burn(tokenId).send({from: account[0]});
    }catch (err){
      console.log(err);
    }
  }
}

async function setApprovalForAll(operator, bool) {
  if(contract) {
    try {
      const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await contract.methods.setApprovalForAll(operator, bool).send({from: account[0]});
    }catch (err){
      console.log(err);
    }
  }
}

async function isApprovedForAll(owner, operator) {
  if(contract) {
    try {
      return await contract.methods.isApprovedForAll(owner, operator).call();
    }catch (err){
      console.log(err);
    }
  }
}

async function transferFrom(from, to, tokenId) {
  if(contract) {
    try {
      const functionAbi = contract.methods.transferFrom(from, to, tokenId).encodeABI();
      const txObject = {
        nonce: web3.utils.toHex(await web3.eth.getTransactionCount(galleryAccount.address)),
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
        to: contractAddress,
        data: functionAbi
      };
      const signedTx = await web3.eth.accounts.signTransaction(txObject, private_key);
      web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, txHash) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Transaction hash:', txHash);
        }
      });
    }catch (err){
      console.log(err);
    }
  }
}

async function buyNFT(receiver, owner, tokenId, amount) {
  try {
    var amountToSend = web3.utils.toWei(amount, "ether");
    var payment = false;
    var royalties = false;
    await web3.eth.sendTransaction({ from: receiver, to: owner, value: amountToSend*0.9 })
    .on('receipt', receipt => {
      console.log('Transaction successful:', receipt);
      payment = true;
    })
    .on('error', error => {
      console.error('Transaction failed:', error);
      payment = false;
    });
    await web3.eth.sendTransaction({ from: receiver, to: await creatorOf(tokenId), value: amountToSend*0.1 })
    .on('receipt', receipt => {
      console.log('Transaction successful:', receipt);
      royalties = true;
    })
    .on('error', error => {
      console.error('Transaction failed:', error);
      royalties = false;
    });
    return (payment && royalties);
  }catch (err){
    console.log(err);
  }
}

async function myTransferFunction(owner, receiver, nftMetadata) {
  if(contract) {
    try {
      var tokenId = nftMetadata.id.split("#").pop();
      var price = await getNftPrice(nftMetadata.id);
      var payed = await buyNFT(receiver, owner, tokenId, price);
      if(payed){
        await transferFrom(owner, receiver, tokenId);
        alert("NFT with tokenId " + nftMetadata.id + "bought successfuly");
      } else {
        alert("Something went wrong with the transactions");
      }   
    }catch (err){
      console.log(err);
    }
  }
}

window.getName = getName;
window.getSymbol = getSymbol;
window.getNextId = getNextId;
window.balanceOf = balanceOf;
window.ownerOf = ownerOf;
window.creatorOf = creatorOf;
window.tokenURI = tokenURI;
window.mint = mint;
window.burn = burn;
window.setApprovalForAll = setApprovalForAll;
window.isApprovedForAll = isApprovedForAll;
window.transferFrom = transferFrom;
window.myTransferFunction = myTransferFunction;