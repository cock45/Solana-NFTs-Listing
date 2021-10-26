import React from "react";
import { Typography, Box, Tabs, Tab } from "@material-ui/core";
import TextField from "@mui/material/TextField";
import "./App.css";
import Transactions from  "./Transactions";
import Accounts from "./Accounts";

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
  const [addr, setAddr] = React.useState("");
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleKeyDown = (eve:any) => {
    if(eve.key === 'Enter') {
      console.log(addr)
    }
  }

  const handleInputChange = (eve:any) => {
    setAddr(eve.target.value);
  };

  return (
    <div className="App">
      <Typography variant="h3">Transition details</Typography>
      <Box>
        <TextField 
          id="outlined-search"
          label="Search Address"
          type="search"
          sx={{ float:"right", marginRight:'122px', marginBottom:'30px' }}
          value={addr}
          onChange = {handleInputChange} 
          onKeyDown = {handleKeyDown}
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
            <Tab label="Collections" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Transactions publicKey={addr}/>
        </TabPanel>
      </Box>
    </div>
  );
}

export default App;
