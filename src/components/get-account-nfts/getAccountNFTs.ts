import { decodeMetadata, getMetadataAccount } from "../../helper/Metadata.service";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import BLOCK_SIZE from "../../env";

const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

const GetAccountNFT = async (address: any) => {
  let publicKey = new PublicKey(address);
  let connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  let response = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });
  
  let mints = await Promise.all(
    response.value
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

  nftMetadata.map((meta:any) => {
    response.value.map((res:any) => {
      if(meta.mint == res.account.data.parsed.info.mint) {
        meta["uiAmount"] = res.account.data.parsed.info.tokenAmount.uiAmount;
      }
    })
  })
  
  return nftMetadata;
};

export default GetAccountNFT;