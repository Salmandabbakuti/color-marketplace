import { useState, useEffect } from 'react';
import { Button, TextField, Tooltip } from '@material-ui/core';
import { ethers, Contract } from 'ethers';
import Web3Modal from "web3modal";
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
      const contract = new Contract('0xe6678508Ca804Bc011672937e756692c89788D6a', abi, signer);
      resolve({ contract });
    });
  }

  useEffect(() => {
    initWeb3().then(async ({ contract }) => {
      setContract(contract);
      const colors = await contract.getAllColors();
      setColors(colors);
    }).catch((err) => {
      console.log('err:', err);
      setLogMessage(err);
    });
  }, []);

  const getMyColors = async () => {
    const myColors = await contract.getMyColors();
    setColors(myColors);
  };

  const getAllColors = async () => {
    const colors = await contract.getAllColors();
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
        <h1 className="marketplace-title">Color Marketplace</h1>
        <form>
          <h4 >Mint a new color</h4>
          <TextField type="color" onChange={(e) => setColorInput(e.target.value)}></TextField>
          <Button variant="contained" color="primary" onClick={() => mintColor(colorInput)}>Mint</Button>
        </form>
        <div>
          <Button variant="contained" color="secondary" onClick={getMyColors}>My Colors</Button>
          <Button variant="contained" color="primary" onClick={getAllColors}>All Colors</Button>
        </div>
        <div className="container text-center">
          {colors.length ? colors.map(({ tokenId, colorValue, owner }, i) => (
            <div key={i} className="token" style={{ backgroundColor: colorValue }}>
              <Tooltip title={<><em>TokenId: {tokenId.toString()}<br></br>Owner: {owner}</em></>} arrow>
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
