import React from "react";
import { Typography, Box} from "@material-ui/core";
import TextField from "@mui/material/TextField";
import "./App.css";
import Transactions from "./components/Transaction/Transactions";
import GetAccountNFT from "./components/get-account-nfts/getAccountNFTs";
import { trackPromise } from 'react-promise-tracker';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BLOCK_SIZE from "./env";

function App() {
  const [addrInputs, setAddrInputs] = React.useState("");
  const [data, setData] = React.useState([]);
  const [savedAddr, saveAddr] = React.useState("");

  const handleInputChange = (e: any) => {
    setAddrInputs(e.target.value);
  }

  async function fetchWithTimeout(uri: any, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000);
    const response = await fetch(uri, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  }

  const getURI = async (metadata: any) => {
    try {
      const response = await fetchWithTimeout(
        metadata.data.uri,
        {
          method: "GET",
        },
      );
      const uri = await response.json();
      return uri;
    } catch {
      return metadata;
    }
  };

  const viewNFTs = async (addr: string) => {
    let newData: any = [];

    let connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    const metadata = await GetAccountNFT(addr);

    for (let metaId in metadata) {
      const meta = metadata[metaId];
      let metaTemp: any = [];
      ///////////////////////////////////   URI ///////////////////////////////////////////////////
      let uri = await getURI(meta);
      if (!uri.name) {
        continue;
      }
      metaTemp["name"] = uri.name;
      metaTemp["mint"] = meta.mint;
      metaTemp["url"] = uri.image;
      metaTemp["royalty"] = meta.data.sellerFeeBasisPoints / 100;
      metaTemp["updateAuthority"] = meta.updateAuthority;
      if (uri.hasOwnProperty("collection")) {
        metaTemp["collection"] = uri.collection.name;
      } else if (uri.name.indexOf("#") > -1) {
        metaTemp["collection"] = uri.name.split("#")[0];
      } else {
        metaTemp["collection"] = "Single";
      }
      ////////////////////////    Transactions    //////////////////////////////////////////////////////////////////////////////////////////////
      const signature: any = [];
      let txs: any = [];
      const pubKey = new PublicKey(meta.mint);

      const signs = await connection.getConfirmedSignaturesForAddress2(pubKey);
      let temp: any = [];
      const signLen = signs.length;
      let signCount: number = 0;
      signs.map((sign) => {
        signCount++;
        temp.push(sign.signature);
        if (temp.length === BLOCK_SIZE || signCount === signLen) {
          signature.push(temp);
          temp = [];
        }
        return 0;
      })

      for (let x in signature) {
        const tx = await connection.getParsedConfirmedTransactions(signature[x]);
        txs = [...txs, ...tx];
      }
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////   Price  ////////////////////////////////////////////////////////////////////////////////
      let price = 0;
      let thisBlockNo = 0;
      let lastBlockNo = 0;
      let current_owner = "";
      let last_owner_slot = 0;

      let instruction: any = [];
      txs.map((tx: any) => {
        let thisPrice = 0;
        thisBlockNo = tx.slot;
        instruction = tx.meta.innerInstructions;
        
        if(meta.uiAmount === 1) {
          current_owner = addr;
        }

        if (instruction.length > 0) {

          // get Current Owner
          if(current_owner !== addr && thisBlockNo > last_owner_slot) {
            instruction.map((ists: any) => {
              ists.instructions.map((item: any) => {
                if (item.hasOwnProperty("parsed")) {
                  if (item.parsed.type === "initializeAccount") {
                    current_owner = item.parsed.info.owner;
                    last_owner_slot = thisBlockNo;
                  }
                }
                return 0;
              })
              return 0;
            })
          }
          // get Current Owner End

          // get Price
          if (thisBlockNo > lastBlockNo) {
            instruction.map((ists: any) => {
              let lamCount = 0;
              ists.instructions.map((item: any) => {
                if (item.hasOwnProperty("parsed")) {
                  if (item.parsed.info.hasOwnProperty("lamports")) {
                    if (item.parsed.info.lamports > 0) {
                      lamCount++;
                      thisPrice += parseInt(item.parsed.info.lamports);
                    }
                  }
                }
                return lamCount;
              })
              if (lamCount > 1) {
                price = thisPrice / LAMPORTS_PER_SOL;
                lastBlockNo = thisBlockNo;
              }
              return lastBlockNo;
            })
          }
          // get Price End
        }
        return current_owner;
      })
      
      metaTemp["price"] = parseFloat(price.toPrecision(2));
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (current_owner === addr) {
        if(meta.uiAmount > 0) {
          metaTemp["locate"] = "In your Wallet";
        } else {
          metaTemp["locate"] = "On Marketplace";
        }
        newData.push(metaTemp);
        const arr: any = [...newData];
        setData(arr);
      }
    }

    const newMetadata = newData.filter((value: any, index: Number, arr: any) => {
      return value.hasOwnProperty("url");
    });

    return newMetadata;
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      if (addrInputs.length === 44 && addrInputs !== savedAddr) {
        const addr = addrInputs;
        saveAddr(addr);
        setData([]);
        trackPromise(
          viewNFTs(addr).then((data: any) => {
            setData(data);
          })
        )
      } else if (addrInputs.length < 44) {
        alert("Wallet address length is too short!");
      } else if (addrInputs.length > 44) {
        alert("Wallet address length is too long!");
      }
    }
  }

  return (
    <div className="App">
      <Typography variant="h3">NFT Details</Typography>
      <Box>
        <TextField
          id="outlined-search"
          label="Search Address"
          type="search"
          sx={{ marginTop: '50px', minWidth: '600px' }}
          value={addrInputs}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </Box>
      <Box sx={{ width: "100%" }}>
        <Transactions publicKey={addrInputs} rows={data} />
      </Box>
    </div>
  );
}

export default App;
