import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <LocalShippingIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ELD Trip Planner
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
          >
            New Trip
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/trips"
          >
            Trip History
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;