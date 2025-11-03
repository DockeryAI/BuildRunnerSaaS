```typescript
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { OpenRouterClient } from '@/lib/openrouter';
import { InsightCard } from './InsightCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface InsightData {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
}

interface DashboardProps {
  userId: string;
  filters?: {
    category?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

/**
 * PersonalizedInsightsDashboard component displays AI-generated insights
 * based on user data and specified filters
 * 
 * @param {DashboardProps} props - Component props
 * @returns {JSX.Element} Rendered dashboard component
 */
export const PersonalizedInsightsDashboard: React.FC<DashboardProps> = ({ 
  userId,
  filters
}) => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const openRouter = new OpenRouterClient();

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['insights', userId, filters],
    queryFn: async () => {
      try {
        const response = await openRouter.generateInsights({
          userId,
          filters: {
            category: filters?.category,
            dateRange: filters?.dateRange
          }
        });
        
        return response;
      } catch (err) {
        throw new Error('Failed to fetch insights');
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    if (data) {
      setInsights(data);
    }
    if (queryError) {
      setError((queryError as Error).message);
    }
  }, [data, queryError]);

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

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Your Personalized Insights
        </Typography>
        
        <Grid container spacing={3}>
          {insights.map((insight) => (
            <Grid item xs={12} md={6} lg={4} key={insight.id}>
              <InsightCard
                title={insight.title}
                content={insight.content}
                category={insight.category}
                timestamp={new Date(insight.timestamp)}
              />
            </Grid>
          ))}
        </Grid>

        {insights.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="textSecondary">
              No insights available for the selected filters.
            </Typography>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
};

/**
 * InsightCard sub-component to display individual insights
 */
interface InsightCardProps {
  title: string;
  content: string;
  category: string;
  timestamp: Date;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  content,
  category,
  timestamp
}) => {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        height: '100%'
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {category} • {timestamp.toLocaleDateString()}
      </Typography>
      <Typography variant="body1">
        {content}
      </Typography>
    </Box>
  );
};

export default PersonalizedInsightsDashboard;
```