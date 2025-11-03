```typescript
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Therapist } from '../types/therapist';
import { openRouterClient } from '../api/openRouterClient';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
  margin: '0 auto'
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2)
}));

interface TherapistFormData {
  name: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
}

/**
 * TherapistManagementDashboard Component
 * Provides interface for managing therapist data including CRUD operations
 * @returns JSX.Element
 */
export const TherapistManagementDashboard: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TherapistFormData>({
    name: '',
    email: '',
    specialization: '',
    yearsOfExperience: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTherapists();
  }, []);

  /**
   * Fetches therapist data from the API
   */
  const fetchTherapists = async () => {
    try {
      const response = await openRouterClient.get('/therapists');
      setTherapists(response.data);
    } catch (err) {
      setError('Failed to fetch therapists');
      console.error(err);
    }
  };

  /**
   * Handles form input changes
   * @param event Change event from form input
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles therapist addition
   */
  const handleAddTherapist = async () => {
    try {
      await openRouterClient.post('/therapists', formData);
      await fetchTherapists();
      setIsAddDialogOpen(false);
      setSuccess('Therapist added successfully');
      setFormData({
        name: '',
        email: '',
        specialization: '',
        yearsOfExperience: 0
      });
    } catch (err) {
      setError('Failed to add therapist');
      console.error(err);
    }
  };

  /**
   * Handles therapist deletion
   * @param id Therapist ID to delete
   */
  const handleDeleteTherapist = async (id: string) => {
    try {
      await openRouterClient.delete(`/therapists/${id}`);
      await fetchTherapists();
      setSuccess('Therapist deleted successfully');
    } catch (err) {
      setError('Failed to delete therapist');
      console.error(err);
    }
  };

  return (
    <DashboardContainer>
      <StyledCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Therapist Management</Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add Therapist
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Years of Experience</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {therapists.map((therapist) => (
                <TableRow key={therapist.id}>
                  <TableCell>{therapist.name}</TableCell>
                  <TableCell>{therapist.email}</TableCell>
                  <TableCell>{therapist.specialization}</TableCell>
                  <TableCell>{therapist.yearsOfExperience}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteTherapist(therapist.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledCard>

      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add New Therapist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="specialization"
            label="Specialization"
            type="text"
            fullWidth
            value={formData.specialization}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="yearsOfExperience"
            label="Years of Experience"
            type="number"
            fullWidth
            value={formData.yearsOfExperience}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTherapist} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default TherapistManagementDashboard;
```