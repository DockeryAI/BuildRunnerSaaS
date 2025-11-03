```typescript
import React, { useState, useCallback } from 'react';
import { 
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface representing a build group
 */
interface BuildGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
}

/**
 * Props for the BuildGroupManagement component
 */
interface BuildGroupManagementProps {
  initialGroups?: BuildGroup[];
  onGroupsChange?: (groups: BuildGroup[]) => void;
}

/**
 * Component for managing build groups
 */
export const BuildGroupManagement: React.FC<BuildGroupManagementProps> = ({
  initialGroups = [],
  onGroupsChange
}) => {
  const [groups, setGroups] = useState<BuildGroup[]>(initialGroups);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<BuildGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: ''
  });

  /**
   * Handles changes to form inputs
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Opens dialog for creating/editing a group
   */
  const openDialog = useCallback((group?: BuildGroup) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description,
        members: group.members.join(', ')
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        description: '',
        members: ''
      });
    }
    setIsDialogOpen(true);
  }, []);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(() => {
    try {
      const newGroup: BuildGroup = {
        id: editingGroup?.id || uuidv4(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        members: formData.members.split(',').map(m => m.trim()).filter(Boolean)
      };

      if (!newGroup.name) {
        throw new Error('Group name is required');
      }

      setGroups(prev => {
        const newGroups = editingGroup
          ? prev.map(g => (g.id === editingGroup.id ? newGroup : g))
          : [...prev, newGroup];
        
        onGroupsChange?.(newGroups);
        return newGroups;
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving build group:', error);
      // Could add toast notification here
    }
  }, [formData, editingGroup, onGroupsChange]);

  /**
   * Deletes a build group
   */
  const deleteGroup = useCallback((id: string) => {
    try {
      setGroups(prev => {
        const newGroups = prev.filter(g => g.id !== id);
        onGroupsChange?.(newGroups);
        return newGroups;
      });
    } catch (error) {
      console.error('Error deleting build group:', error);
    }
  }, [onGroupsChange]);

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Typography variant="h5">Build Groups</Typography>
        <Button 
          variant="contained" 
          onClick={() => openDialog()}
        >
          Create New Group
        </Button>
      </Box>

      <List>
        {groups.map(group => (
          <ListItem
            key={group.id}
            secondaryAction={
              <Box>
                <IconButton onClick={() => openDialog(group)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => deleteGroup(group.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
            sx={{ 
              border: '1px solid #ddd',
              borderRadius: 1,
              marginBottom: 1
            }}
          >
            <Box>
              <Typography variant="subtitle1">{group.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {group.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Members: {group.members.join(', ')}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingGroup ? 'Edit Build Group' : 'Create Build Group'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="name"
              label="Group Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              name="members"
              label="Members (comma-separated)"
              value={formData.members}
              onChange={handleInputChange}
              fullWidth
              helperText="Enter member names separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingGroup ? 'Save Changes' : 'Create Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuildGroupManagement;
```