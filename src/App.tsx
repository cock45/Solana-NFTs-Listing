import React from "react";
import { Typography, Box, Tabs, Tab } from "@material-ui/core";
import TextField from "@mui/material/TextField";
import "./App.css";
import Transactions from "./Transactions";

import GetAccountNFT from "./components/get-account-nfts/getAccountNFTs";
import { trackPromise } from 'react-promise-tracker';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { couldStartTrivia } from "typescript";
import BLOCK_SIZE from "./env";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function App() {
  const [value, setValue] = React.useState(0);
  const [addrInputs, setAddrInputs] = React.useState("");
  const [data, setData] = React.useState([]);
  const [metadata, setMetadata] = React.useState<any>();
  const [savedAddr, saveAddr] = React.useState("");

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

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
        if (temp.length == BLOCK_SIZE || signCount == signLen) {
          signature.push(temp);
          temp = [];
        }
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
        
        if(meta.uiAmount == 1) {
          current_owner = addr;
        }

        if (instruction.length > 0) {

          // get Current Owner
          if(current_owner != addr && thisBlockNo > last_owner_slot) {
            instruction.map((ists: any) => {
              ists.instructions.map((item: any) => {
                if (item.hasOwnProperty("parsed")) {
                  if (item.parsed.type === "initializeAccount") {
                    current_owner = item.parsed.info.owner;
                    last_owner_slot = thisBlockNo;
                  }
                }
              })
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
              })
              if (lamCount > 2) {
                price = thisPrice / LAMPORTS_PER_SOL;
                lastBlockNo = thisBlockNo;
              }
            })
          }
          // get Price End
        }
      })
      
      metaTemp["price"] = parseFloat(price.toPrecision(2));
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (current_owner == addr) {
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
      if (addrInputs.length == 44 && addrInputs !== savedAddr) {
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
      <Typography variant="h3">NFT details</Typography>
      <Box>
        <TextField
          id="outlined-search"
          label="Search Address"
          type="search"
          sx={{ marginLeft: '-100px', marginTop: '60px', minWidth: '500px' }}
          value={addrInputs}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </Box>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="NFT List" {...a11yProps(0)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Transactions publicKey={addrInputs} rows={data} />
        </TabPanel>
      </Box>
    </div>
  );
}

export default App;
