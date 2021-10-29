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
import SearchBar from "material-ui-search-bar";
import "./Transaction.css";
import Spinner from '../spinner';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

interface Column {
  id: "name" | "url" | "locate" | "mint" | "royalty" | "collection" | "price" | "updateAuthority";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}
const columns: readonly Column[] = [
  { id: "name", label: "Name", minWidth: 150 },
  { id: "url", label: "Image"},
  { id: "locate", label: "Locate", minWidth: 150 },
  { id: "mint", label: "Mint", minWidth: 100 },
  {
    id: "royalty",
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
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [sortId, setSortId] = React.useState("");
  const [filterRows, setFilterRows] = React.useState<any>();
  const [sortDirection, setSortDirection] = React.useState(-1);
  const rows = props.rows;

  const [searched, setSearched] = React.useState<string>("");
  const requestSearch = (searchedVal: string) => {
    const filteredRows = rows.filter((row:any) => {
      return row.name.toLowerCase().includes(searchedVal.toLowerCase())
        || row.mint.toLowerCase().includes(searchedVal.toLowerCase())
        || row.collection.toLowerCase().includes(searchedVal.toLowerCase())
        || row.updateAuthority.toLowerCase().includes(searchedVal.toLowerCase())
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

  const sortHandler = (e:any) => {
    let id = e.target.getAttribute("id");
    let sortedRows = filterRows;
    if(id === sortId) {
      setSortDirection(-1 * sortDirection);
      sortedRows.reverse();
    } else if(rows.length > 0) {
      setSortDirection(-1);
      if(typeof(rows[0][id]) === "number") {
        sortedRows.sort(function (a:any, b:any) {
          return a[id] - b[id];
        });
      } else {
        sortedRows.sort(function (a:any, b:any) {
          if(a[id] === "" || b[id] === "") {
            return 0;
          }
          let nameA = a[id].toUpperCase(); 
          let nameB = b[id].toUpperCase(); 
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
      }
    }
    setSortId(id);
    const arr:any = [...sortedRows];
    setFilterRows(arr);                                  
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
      <Paper className="main">
        <SearchBar
          className="searchbar"
          value={searched}
          onChange={(searchVal) => search(searchVal)}
          onCancelSearch={() => cancelSearch()}
        />
        <TableContainer className="table-container">
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    id={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth}}
                    onClick={sortHandler}
                    className="table-header"
                    sx={{ textAlign: 'center' }}
                  >
                    {column.label}
                    <ArrowUpwardIcon 
                      className={column.id === sortId && sortDirection === -1 ? "icon sort" : "icon before"} 
                    />
                    <ArrowDownwardIcon 
                      className={column.id === sortId && sortDirection === 1 ? "icon sort" : "icon before"} 
                    />
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
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell id="name">{row.name}</TableCell>
                        <TableCell id="img"><img src={row.url} alt="img"  style={{width:50, height: 50}}/></TableCell>
                        <TableCell id="locate">{row.locate}</TableCell>
                        <TableCell id="mint">{row.mint}</TableCell>
                        <TableCell id="royalty">{row.royalty}%</TableCell>
                        <TableCell id="collection">{row.collection}</TableCell>
                        <TableCell id="last">{row.price ? row.price + " sol" : "No history"}</TableCell>
                        <TableCell id="creator">{row.updateAuthority}</TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filterRows ? filterRows.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
  );
}
