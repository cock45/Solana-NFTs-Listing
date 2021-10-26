import { decodeMetadata, getMetadataAccount } from "../../helper/Metadata.service";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import sendData from '../../Transactions'
import * as web3 from '@solana/web3.js';
import { textChangeRangeIsUnchanged } from "typescript";

import { ConfirmedTransaction, ConfirmedTransactionMeta, Transaction } from '@solana/web3.js';
import { SignalWifiOffSharp } from "@material-ui/icons";
import { resolve } from "dns";
import BLOCK_SIZE from "../../env";
import { connect } from "http2";

const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

const GetAccountNFT = async (address: any) => {
  const program_id = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  let publicKey = new PublicKey(address);
  let connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  let response = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });
  
  let mints = await Promise.all(
    response.value
        // .filter(
        //   (accInfo) =>
        //     accInfo.account.data.parsed.info.tokenAmount.uiAmount !== 0
        // )
        .map((accInfo) =>
          getMetadataAccount(accInfo.account.data.parsed.info.mint)
        )
  );
  let mintPubkeys = mints.map((m) => new PublicKey(m));
  let multipleAccounts:any = [];
  for(let i = 0; i <= mintPubkeys.length/BLOCK_SIZE; i++) {
    let mintPubkeysTemp = mintPubkeys.slice(i*BLOCK_SIZE, (i+1)*BLOCK_SIZE-1);
    let temp = await connection.getMultipleAccountsInfo(mintPubkeysTemp);
    multipleAccounts = multipleAccounts.concat(temp);
  }
  
  let nftMetadata = multipleAccounts
    .filter((account:any) => account !== null)
    .map((account:any) => decodeMetadata(account!.data));
  
  return nftMetadata;
};
export default GetAccountNFT;
