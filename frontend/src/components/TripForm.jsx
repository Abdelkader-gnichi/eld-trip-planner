import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { tripService } from '../services/api';

const TripForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_hours: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For the cycle hours, ensure it's a valid number
    if (name === 'current_cycle_hours') {
      const numValue = parseFloat(value);
      if (numValue >= 0 && numValue <= 11) {
        setFormData({ ...formData, [name]: numValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const trip = await tripService.createTrip(formData);
      setLoading(false);
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setLoading(false);
      setError('Error creating trip. Please check your inputs and try again.');
      console.error('Error creating trip:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Plan Your Trip
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="current_location"
                label="Current Location"
                value={formData.current_location}
                onChange={handleChange}
                placeholder="e.g., Los Angeles, CA"
                helperText="Enter your current city and state"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="pickup_location"
                label="Pickup Location"
                value={formData.pickup_location}
                onChange={handleChange}
                placeholder="e.g., Phoenix, AZ"
                helperText="Enter the city and state for pickup"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="dropoff_location"
                label="Dropoff Location"
                value={formData.dropoff_location}
                onChange={handleChange}
                placeholder="e.g., Dallas, TX"
                helperText="Enter the city and state for dropoff"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                type="number"
                name="current_cycle_hours"
                label="Current Hours Driven in Cycle"
                InputProps={{ inputProps: { min: 0, max: 11, step: 0.5 } }}
                value={formData.current_cycle_hours}
                onChange={handleChange}
                helperText="Enter hours already driven in your current cycle (0-11)"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Plan Trip'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TripForm;