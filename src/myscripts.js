/********************************
            Imports
********************************/
// For IPFS
import { create } from 'ipfs-http-client';
// For json
import {Buffer} from 'buffer';
import fs from 'vite-plugin-fs/browser';
// For web3
import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

/********************************
      Connect to MetaMask
********************************/
const isMetaMaskInstalled = () => {
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
}

const getAccounts = async () => {
  const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
  window.account = account[0];
  $(".text-inf.adress").remove();
  $(".infoAccount").children("div.box-inf.adress").append('<span class="text-inf adress">Adress: '+ account[0] +'</span>');
}

const getNetwork = async () => {
  const networkId = await ethereum.request({ method: 'eth_chainId'});
  let netName = "";
  if(networkId == "0x1"){
    netName = "Ethereum Main Network (Mainnet)";
  }else if(networkId == "0x3"){
    netName = "Ropsten Test Network";
  }else if(networkId == "0x4"){
    netName = "Rinkeby Test Network";
  }else if(networkId == "0x5"){
    netName = "Goerli Test Network";
  }else if(networkId == "0x2a"){
    netName = "Kovan Test Network";
  }else if(networkId == "0xaa36a7"){
    netName = "Sepolia Test Network";
  }
  $(".text-inf.network").remove();
  $(".infoAccount").children("div.box-inf.network").append('<span class="text-inf network">Network: '+ networkId + ' - ' + netName +'</span>');
}

const handleNewAccountOrNetwork = () => {
  getAccounts();
  getNetwork();
  logout();
}

const galleryAdress = "0x9D8441b975F1DC3A64E1A8e9F401c8032365d250";
async function connectMetamask() {
  if(isMetaMaskInstalled()){
    try {
      await getAccounts();
      await getNetwork();
      ethereum.on('chainChanged', handleNewAccountOrNetwork);
      ethereum.on('accountsChanged', handleNewAccountOrNetwork);
      if(account.toLowerCase() != galleryAdress.toLocaleLowerCase()){
        if(!await isApprovedForAll(account, galleryAdress)){
          alert("It's neccesary to approve the gallery to access your collectibles");
          await setApprovalForAll(galleryAdress, true);
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }else{
    const onboarding = new MetaMaskOnboarding();
    onboarding.startOnboarding();
  }
}
connectMetamask();

/********************************
        Connect to IPFS
********************************/
function connectIPFS() { 
  const projectId = '2Ia3IA1M8Q9eXVApDoouMug93DL';
  const projectSecret = 'c7de6d7b566b4b35430811fe1fe59f73';

  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  const ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      timeout: 8000,
      headers: {
          authorization: auth
      }
  });
  window.ipfs = ipfs;
};

/***********************************
      Generate NFTS collection 
***********************************/
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send();
  return xmlHttp;
}

function emptyText() {
  var emptyCollection = document.querySelector(".title-container");
  var span = document.createElement("span");
  span.innerHTML = "There are no NFT minted until now";
  emptyCollection.appendChild(span);
}

async function recoverNFTs() {
  var nftsMetadata = [];

  var nextId = await getNextId();
  for(var i=0;i<nextId;i++){
    if(await ownerOf(i)){
      nftsMetadata.push(await tokenURI(i));
    }
  }
  return nftsMetadata;
}

async function fillCollection() {
  if(document.querySelector(".nft-collection")){
    var collection = document.querySelector(".nft-collection");
    if(await getNextId() == 0){
      emptyText();
    } else {
      var nftCollection = await recoverNFTs();

      for(var i=0;i<nftCollection.length;i++){
        if(nftCollection[i]){
          var response = httpGet(nftCollection[i]);
          if(response.statusText == "OK"){
            var nft = JSON.parse(response.responseText);
            collection.insertAdjacentHTML( 'beforeend', 
              '<div class="col-4">' + 
                '<div class="card text-center w-100" onclick="viewNft(this);">' + 
                  '<h5 class="card-title">' + nft.title + '</h5>' +
                  '<div class="card-id">' +
                    '<p class="card-id-number">' + nft.id +'</p>' +
                    '<hr class="hr-smashing">' +
                  '</div>' +
                  '<div class="card-body">'+ 
                    '<img src="' + nft.imageCid + '" class="card-img" alt="">' +
                  '</div>' + 
                  '<div class="card-autor">' +
                    '<hr class="hr-smashing">' +
                    '<p class="card-autor-name">' + nft.creator +'</p>' +
                  '</div>' +
                  '<p class="card-price">' + await getNftPrice(nft.id) + ' ETH</p>' + 
                '</div>' +
              '</div>'
            );
          }
        }else {
          console.log("Invalid CID for tokenID:" + i);
        }
      }
    }
  }
};
fillCollection();

async function fillUserCollection() {
  if(document.querySelector(".user-nft-collection")){
    var collection = document.querySelector(".user-nft-collection");
    getAccounts();
    if(await balanceOf() != 0 && await getNextId() == 0){
      emptyText();
    } else {
      var nftCollection = await recoverNFTs();

      for(var i=0;i<nftCollection.length;i++){
        if(nftCollection[i]){
          var response = httpGet(nftCollection[i]);
          if(response.statusText == "OK"){
            var nft = JSON.parse(response.responseText);
            if(nft.creator == getUsername()) {
              collection.insertAdjacentHTML( 'beforeend', 
                '<div class="col-4">' + 
                  '<div class="card text-center w-100">' + 
                    '<h5 class="card-title">' + nft.title + '</h5>' +
                    '<div class="card-id">' +
                      '<p class="card-id-number">' + nft.id +'</p>' +
                      '<hr class="hr-smashing">' +
                    '</div>' +
                    '<div class="card-body">'+ 
                      '<img src="' + nft.imageCid + '" class="card-img" alt="">' +
                    '</div>' + 
                    '<div class="card-autor">' +
                      '<hr class="hr-smashing">' +
                      '<p class="card-autor-name">' + nft.creator +'</p>' +
                    '</div>' +
                    '<p class="card-price">' + await getNftPrice(nft.id) + ' ETH <img src="../images/editIcon.png" height="20" width="20" onclick="editPrice('+nft.id.split("#").pop()+');"></p>' +
                    '<div class="card-sale">' +
                      '<p class="card-status">On sale?: ' + await isForSale(nft.id) + '</p>' +
                      '<button id="onSaleBtn" type="button" class="btn btn-secondary" onclick="changeOnSale('+ nft.id.split("#").pop() +');">Change</button>' +
                    '</div>' + 
                  '</div>' +
                '</div>'
              );
            }
          }
        }else {
          console.log("Invalid CID for tokenID:" + i);
        }
      }
    }
  }
};
fillUserCollection();

/***********************************
        Gallery View NFT Modal
***********************************/
const viewNft = async function(element){
  var nftId = element.getElementsByClassName("card-id-number")[0].innerHTML;
  var response = httpGet(await tokenURI(nftId.split("#").pop()));
  if(response.statusText == "OK"){
    var nft = JSON.parse(response.responseText);
    document.getElementById("viewNftTitle").innerHTML = nft.title;
    document.getElementById("viewNftImage").src = nft.imageCid;
    document.getElementById("viewNftId").innerHTML = nft.id;
    document.getElementById("viewNftDescription").innerHTML = nft.description != "" ? nft.description : "-";
    document.getElementById("viewNftCreator").innerHTML = nft.creator;
    document.getElementById("viewNftOwner").innerHTML = await ownerOf(nftId);
    document.getElementById("viewNftPrice").innerHTML = await getNftPrice(nft.id) + " ETH";
    document.getElementById("etherscan").href = "https://sepolia.etherscan.io/nft/0xcd4d30176cd1e667a8860f72743cf0fff4c8f853/" + nftId;
    console.log(nftId, await isForSale(nftId));
    if(await isForSale(nftId) == "false") {
      document.getElementById("buyBtn").classList.add("disabled");
    }
  }

  $('#viewNFT').modal('show');
}
window.viewNft = viewNft;

/***********************************
          Buy NFT modal 
***********************************/
function buyNftModal(){
  $('#buyNFT').modal('show');
}
window.buyNftModal = buyNftModal;

async function buyNft() {
  var nftId = document.getElementById("viewNftId").innerHTML.split("#").pop();
  await getAccounts();
  var owner = await ownerOf(nftId);
  if(account.toLowerCase() != owner.toLowerCase()) {
    var response = httpGet(await tokenURI(nftId));
    if(response.statusText == "OK"){
      var nft = JSON.parse(response.responseText);
      await myTransferFunction(owner, account, nft);
      window.location.reload();
    }
  } else {
    alert("This NFT is already yours");
    $('#buyNFT').modal('hide');
  }
}
window.buyNft = buyNft;

/***********************************
            Sell NFT
***********************************/
async function isForSale(tokenId){
  var nftPrices = JSON.parse(await fs.readFile("../nfts_onsale.json"));
  return nftPrices[tokenId];
}

const changeOnSale = async function(tokenId){
  var nftPrices = JSON.parse(await fs.readFile("../nfts_onsale.json"));
  tokenId = "#" + tokenId;
  if(!nftPrices[tokenId]){
    nftPrices[tokenId] = "false";
  }else{
    if(nftPrices[tokenId] == "true"){
      nftPrices[tokenId] = "false";
    } else {
      nftPrices[tokenId] = "true";
    }
  }

  await fs.writeFile("../nfts_onsale.json", JSON.stringify(nftPrices, null, 2));
  window.location.reload();
}

window.isForSale = isForSale;
window.changeOnSale = changeOnSale;

/***********************************
        Login & User cookie
***********************************/
function getUsername() {
  return document.cookie.split("=").pop();
}

const openLogin = function(){
  if(getUsername()){
    login();
  }else{
    $('#login').modal('show');
  }
}

function login() {
  $('#login').modal('hide');
  window.location.href = "./home.html";
}

function logout() {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/src;";
  window.location.href = "./gallery.html";
}

async function validateLogin() {
  var form = document.getElementById("formLogin");
  if(form.getElementsByTagName("span"))form.getElementsByTagName("span").remove;
  var username = document.querySelector("#login-username").value;
  var password = document.querySelector("#login-password").value;
  
  getAccounts();
  var userAccount = window.account.toLowerCase();
  var userDatabase = JSON.parse(await fs.readFile("../users.json"));
  var length = Object.keys(userDatabase).length;
  var validation = false;
  for(var i=0;i<length && !validation;i++){
    if(userDatabase[i].username != username || userDatabase[i].password != password){
      form.insertAdjacentHTML( 'beforeend', '<span>*User or password is not valid.</span>');
    }else if (userDatabase[i].account.toLowerCase() != userAccount){
      form.insertAdjacentHTML( 'beforeend', '<span>*You must select your correct Metamask account before login.</span>');
    }else{
      validation = true;
    }
  }
  return validation;
}

const submitLogin = async function(){
  if(await validateLogin()){
    window.username = document.querySelector("#login-username").value;
    document.cookie = "username="+window.username;
    login();
  }
  document.querySelector("#login-username").value = "";
  document.querySelector("#login-password").value = "";
}

window.openLogin = openLogin;
window.submitLogin = submitLogin;
window.logout = logout;

/***********************************
          NFT Price
***********************************/
function editPrice(tokenId) {
  document.getElementById("tokenId").value = tokenId;
  $('#editPrice').modal('show');
}

async function savePrice() {
  var tokenId = document.getElementById("tokenId").value;
  await setPrice(tokenId, web3.utils.toWei(document.querySelector("#nft-price").value, "ether"));
  alert("NFT #" + tokenId + " price changed successfully!");
  window.location.href = "./home.html";
}

async function getNftPrice(tokenId){
  var price = await getPrice(tokenId.split("#").pop());
  return web3.utils.fromWei(price, "ether");
}

window.editPrice = editPrice;
window.savePrice = savePrice;
window.getNftPrice = getNftPrice;

/***********************************
      New NFT form functions
***********************************/
const previewNFT = function(){
  $("#img-default").css("display", "none");
  var oFReader = new FileReader(); 
  oFReader.readAsDataURL(document.getElementById("nft-image").files[0]); 
  oFReader.onload = function (oFREvent) { 
    document.getElementById("nft-preview").src = oFREvent.target.result;
    $("#nft-preview").css("display", "block");
    $(".bi-x-lg").css("display", "inline-block");
  }; 
};

const quitNFT = function(){
  document.getElementById("nft-preview").src = "";
  document.getElementById("nft-image").value = "";
  $("#nft-preview").css("display", "none");
  $(".bi-x-lg").css("display", "none");
  $("#img-default").css("display", "flex");
}

window.previewNFT = previewNFT;
window.quitNFT = quitNFT;

/***********************************
          Create new NFT 
***********************************/
async function createNFT(){
  var imageIpfs = await ipfs.add(document.querySelector("#nft-image").files[0]);
  var imageCid = imageIpfs.cid.toString();

  var nftMetadata = {
    id: "#" + await getNextId(),
    imageCid: "https://nft-gallery.infura-ipfs.io/ipfs/" + imageCid,
    title: await document.querySelector("#nft-title").value,
    description: await document.querySelector("#nft-description").value,
    creator: await getUsername(),
  };

  var nftMetadataIpfs = await ipfs.add(JSON.stringify(nftMetadata));
  var nftMetadataCid = nftMetadataIpfs.cid.toString();
  var tokenUri = "https://nft-gallery.infura-ipfs.io/ipfs/" + nftMetadataCid;
  var price = web3.utils.toWei(document.querySelector("#nft-price").value, "ether");

  await getAccounts();
  await mint(account, tokenUri, price);
  changeOnSale(await getNextId() - 1);
}

async function validateForm(){
  var image = document.querySelector("#nft-image").files[0];
  var title = document.querySelector("#nft-title").value;
  var price = document.querySelector("#nft-price").value;
  
  let correct = true;
  if(image == null){
    correct = false;
  }
  if(title == null || title == ''){
    correct = false;
  }
  if(price == null || price < 0){
    correct = false;
  }
  return correct;
}

const submitNFT = async function(){
  if(await validateForm()){
    connectIPFS();
    await createNFT();
    alert("NFT created successfully");
    document.getElementById("formCreateNFT").reset();
    quitNFT();
    window.location.href = "./home.html";
  }else{
    alert("Image, title and price are required");
    document.getElementById("formCreateNFT").reset();
    quitNFT();
  }
}
window.submitNFT = submitNFT;

/***********************************
        Home Page functions 
***********************************/
if(window.location.href.split("/").pop() == 'home.html'){
  var username = getUsername();
  $(".text-inf.username").remove();
  $(".infoAccount").children("div.box-inf.username").append('<span class="text-inf username">Username: '+ username +'</span>');
}