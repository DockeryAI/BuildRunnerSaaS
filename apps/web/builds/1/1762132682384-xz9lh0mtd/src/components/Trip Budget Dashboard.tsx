```typescript
import React, { useState, useEffect } from 'react';
import { InstagramAPI } from '../services/instagram-api';
import { 
  Box,
  Card, 
  Typography,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';
import { TripBudgetChart } from './TripBudgetChart';
import { BudgetBreakdown } from './BudgetBreakdown';

/** 
 * Interface for budget data structure
 * @interface
 */
interface BudgetData {
  totalBudget: number;
  spent: number;
  remaining: number;
  categories: {
    [key: string]: {
      allocated: number;
      spent: number;
    };
  };
}

/**
 * Interface for Instagram post data
 * @interface
 */
interface InstagramPost {
  id: string;
  caption: string;
  mediaUrl: string;
  timestamp: string;
}

/**
 * Trip Budget Dashboard Component
 * Displays budget overview, spending breakdown and related Instagram posts
 * @component
 */
export const TripBudgetDashboard: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch budget data
        const budgetResponse = await fetch('/api/budget');
        const budgetJson = await budgetResponse.json();
        setBudgetData(budgetJson);

        // Fetch Instagram posts
        const instagram = new InstagramAPI();
        const posts = await instagram.getRecentPosts();
        setInstagramPosts(posts);

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!budgetData) {
    return (
      <Alert severity="info">
        No budget data available
      </Alert>
    );
  }

  const spendingPercentage = Math.round((budgetData.spent / budgetData.totalBudget) * 100);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trip Budget Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <TripBudgetChart 
              totalBudget={budgetData.totalBudget}
              spent={budgetData.spent}
              remaining={budgetData.remaining}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget Summary
            </Typography>
            <Typography>
              Total Budget: ${budgetData.totalBudget.toLocaleString()}
            </Typography>
            <Typography>
              Spent: ${budgetData.spent.toLocaleString()} ({spendingPercentage}%)
            </Typography>
            <Typography>
              Remaining: ${budgetData.remaining.toLocaleString()}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget Breakdown
            </Typography>
            <BudgetBreakdown categories={budgetData.categories} />
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Trip Photos
            </Typography>
            <Grid container spacing={2}>
              {instagramPosts.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <img 
                    src={post.mediaUrl} 
                    alt={post.caption}
                    style={{ 
                      width: '100%', 
                      height: 200, 
                      objectFit: 'cover' 
                    }}
                  />
                  <Typography variant="caption">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TripBudgetDashboard;
```