import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WorkIcon from '@mui/icons-material/Work';
import HotelIcon from '@mui/icons-material/Hotel';

const ELDLogs = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No ELD logs available for this trip.
      </Typography>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ELD Logs
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {logs.map((log, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Log Date: {new Date(log.log_date).toLocaleDateString()}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Starting and Ending Locations */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Starting Location:</strong> {log.starting_location}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Ending Location:</strong> {log.ending_location}
              </Typography>
            </Grid>
          </Grid>

          {/* Driving Periods */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
              <strong>Driving Periods:</strong>
            </Typography>
            {log.driving_periods.length > 0 ? (
              <List>
                {log.driving_periods.map((period, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${period[0]} - ${period[1]}`}
                      secondary={`Duration: ${calculateDuration(period[0], period[1])}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No driving periods recorded.
              </Typography>
            )}
          </Box>

          {/* On-Duty Periods */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <WorkIcon color="primary" sx={{ mr: 1 }} />
              <strong>On-Duty Periods:</strong>
            </Typography>
            {log.on_duty_periods.length > 0 ? (
              <List>
                {log.on_duty_periods.map((period, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${period[0]} - ${period[1]}`}
                      secondary={`Duration: ${calculateDuration(period[0], period[1])}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No on-duty periods recorded.
              </Typography>
            )}
          </Box>

          {/* Off-Duty Periods */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <HotelIcon color="primary" sx={{ mr: 1 }} />
              <strong>Off-Duty Periods:</strong>
            </Typography>
            {log.off_duty_periods.length > 0 ? (
              <List>
                {log.off_duty_periods.map((period, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${period[0]} - ${period[1]}`}
                      secondary={`Duration: ${calculateDuration(period[0], period[1])}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No off-duty periods recorded.
              </Typography>
            )}
          </Box>

          {/* Sleeper Berth Periods */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <HotelIcon color="primary" sx={{ mr: 1 }} />
              <strong>Sleeper Berth Periods:</strong>
            </Typography>
            {log.sleeper_berth_periods.length > 0 ? (
              <List>
                {log.sleeper_berth_periods.map((period, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${period[0]} - ${period[1]}`}
                      secondary={`Duration: ${calculateDuration(period[0], period[1])}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No sleeper berth periods recorded.
              </Typography>
            )}
          </Box>

          <Divider sx={{ mt: 2, mb: 2 }} />
        </Box>
      ))}
    </Paper>
  );
};

// Helper function to calculate duration between two times
const calculateDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diff = end - start; // Difference in milliseconds
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export default ELDLogs;