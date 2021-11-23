import { useState, useEffect } from 'react';
import { Button, TextField, Tooltip } from '@material-ui/core';
import { ethers, Contract } from 'ethers';
import Web3Modal from "web3modal";
import ethLogo from './ethLogo.svg';
import './App.css';
import { abi } from './artifacts/contracts/ColorToken.sol/ColorToken.json';

function App() {
  const [contract, setContract] = useState(null);
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [logMessage, setLogMessage] = useState('');

  const initWeb3 = async () => {
    return new Promise(async (resolve, reject) => {
      const web3Modal = new Web3Modal({
        network: "ropsten",
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const { chainId } = await provider.getNetwork();
      console.log('chainId:', chainId);
      if (chainId !== 3) reject('Wrong network. Please switch to Ropsten Test network');
      const signer = provider.getSigner();
      const contract = new Contract('0x3e043ccb3970A97eD8115aD40A26686cF4424F0b', abi, signer);
      resolve({ contract });
    });
  }

  useEffect(() => {
    initWeb3().then(async ({ contract }) => {
      setContract(contract);
      const colors = await contract.getAllColors();
      console.log('colors:', colors);
      // const newColors = colors.map(({ tokenId, colorValue, owner }) => ({ tokenId: tokenId.toString(), colorValue, owner }));
      // console.log('colors:', newColors);
      setColors(colors);
    }).catch((err) => {
      console.log('err:', err);
      setLogMessage(err);
    });
  }, []);

  const getMyColors = async () => {
    const myColors = await contract.getMyColors();
    console.log('myColors:', myColors);
    setColors(myColors);
  };

  const getAllColors = async () => {
    const colors = await contract.getAllColors();
    // const newColors = colors.map(({ tokenId, colorValue, owner }) => ({ tokenId: tokenId.toString(), colorValue, owner }));
    console.log('all colors:', colors);
    setColors(colors);
  };

  const mintColor = async (colorValue) => {
    if (!colorValue) return;
    console.log('mintColor:', colorValue);
    contract.mintColor(colorValue).then((tx) => {
      tx.wait().then(() => {
        setLogMessage(`Color '${colorValue}' minted successfully`);
      });
    }).catch((err) => setLogMessage(err.message));
  };


  return (
    <div className="App">
      <header className="App-header">
        <img src={ethLogo} className="App-logo" alt="logo" />
        <h1 className="App-title">Color Marketplace</h1>
        <form>
          <h4 style={{ color: 'black', textAlign: 'center' }}>Mint a new color</h4>
          <TextField placeholder="Enter color value. ie #b3ffcc" type="color" onChange={(e) => setColorInput(e.target.value)}></TextField>
          <Button variant="contained" color="primary" onClick={() => mintColor(colorInput)}>Mint</Button>
        </form>
        <div>
          <Button variant="contained" color="secondary" onClick={getMyColors}>Get My Colors</Button>
          <Button variant="contained" color="primary" onClick={getAllColors}>Get All Colors</Button>
        </div>
        <div className="container text-center">
          {colors.length ? colors.map(({ tokenId, colorValue, owner }, i) => (
            <div key={i} className="token" style={{ backgroundColor: colorValue }}>
              <Tooltip title={<><em>TokenId: {tokenId.toString()}<br></br> Token Owner: {owner}</em></>}>
                <div>{colorValue}</div>
              </Tooltip>
            </div>

          )) :
            <p>No items in the Market.!</p>
          }
        </div>
      </header>
      <p className="App-title">{logMessage}</p>
    </div >
  );
}

export default App;
