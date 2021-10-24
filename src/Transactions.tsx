import * as React from "react";
import { useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
// import GetAccountNFT from "./get-account-nfts/getAccountNFTs";
import SearchBar from "material-ui-search-bar";
import "./Transaction.css";

import Spinner from './components/spinner';
import { height } from "@mui/system";
// import { trackPromise } from 'react-promise-tracker';

interface Column {
  id: "name" | "img" | "mint" | "sellerFeeBasisPoints" | "collection" | "price" | "updateAuthority";
  //   id: "updateAuthority" ;
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}
const columns: readonly Column[] = [
  { id: "name", label: "Name", minWidth: 150 },
  { id: "img", label: "Image"},
  { id: "mint", label: "Mint", minWidth: 100 },
  {
    id: "sellerFeeBasisPoints",
    label: "Royalty",
    minWidth: 100,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  { id: "collection", label: "Collection", minWidth: 150},
  { id: "price", label: "Last Price", minWidth: 150},
  {
    id: "updateAuthority",
    label: "Creator",
    minWidth: 150,
    format: (value: number) => value.toLocaleString("en-US"),
  },
];
  
export default function Transactions(props:any) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // const [url, setURL] = React.useState("");
  // const [rows, setRows] = React.useState<any>();
  const rows = props.rows;

  const [filterRows, setFilterRows] = React.useState<any>();

  const [searched, setSearched] = React.useState<string>("");
  const requestSearch = (searchedVal: string) => {
    const filteredRows = rows.filter((row:any) => {
      return row.data.name.toLowerCase().includes(searchedVal.toLowerCase())
        || row.mint.toLowerCase().includes(searchedVal.toLowerCase())
    });
    setFilterRows(filteredRows);
  };

  const cancelSearch = () => {
    setSearched("");
    requestSearch('');
  };

  const search = (searchVal:any) => {
    setSearched(searchVal);
    requestSearch(searchVal);
  }

  useEffect(() => {
    setFilterRows(rows);
  },[rows]);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
      <Paper sx={{ width: "90%", overflow: "hidden", margin: "auto" }}>
        <SearchBar
          value={searched}
          onChange={(searchVal) => search(searchVal)}
          onCancelSearch={() => cancelSearch()}
        />
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <Spinner />
              {filterRows &&
                filterRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row: any, index: number) => {
                    let value:any;
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell key="name">{row.name}</TableCell>
                        <TableCell key="img"><img src={row.url}  style={{width:50, height: 50}}/></TableCell>
                        <TableCell key="mint">{row.mint}</TableCell>
                        <TableCell key="royalty">{row.data.sellerFeeBasisPoints/100}%</TableCell>
                        <TableCell key="collection">{row.collection}</TableCell>
                        <TableCell key="last">{row.price ? row.price + " sol" : "No history"}</TableCell>
                        <TableCell key="creator">{row.updateAuthority}</TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows ? rows.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
  );
}
