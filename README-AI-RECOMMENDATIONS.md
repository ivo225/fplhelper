# AI Recommendations Feature

This document provides instructions on how to set up and use the AI recommendations feature for the FPL Analytics application.

## Overview

The AI recommendations feature uses Next.js API routes and the Deepseek AI API to generate intelligent FPL recommendations, including:

1. **Captain Picks**: Top 5 captain choices with reasoning and predicted points
2. **Transfer Suggestions**: Players to buy and sell based on form, fixtures, and potential
3. **Differential Picks**: Low-ownership players that could provide a competitive edge

## Setup Instructions

### 1. Supabase Database Setup

Run the table creation script to set up all necessary tables in Supabase:

```bash
node scripts/create-tables.js
```

This will create the following tables:
- `players`: Player data from the FPL API
- `teams`: Team data from the FPL API
- `fixtures`: Fixture data from the FPL API
- `events`: Gameweek data from the FPL API
- `captain_recommendations`: AI-generated captain recommendations
- `transfer_recommendations`: AI-generated transfer recommendations
- `differential_recommendations`: AI-generated differential recommendations

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://swmhulpiceqcelyjyyzj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWh1bHBpY2VxY2VseWp5eXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTgzNDAsImV4cCI6MjA1NzA5NDM0MH0.CPd5nsCXpHDSjKywELpVwAn3YG4iqs6GQcFqB3PWLa8
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bWh1bHBpY2VxY2VseWp5eXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTgzNDAsImV4cCI6MjA1NzA5NDM0MH0.CPd5nsCXpHDSjKywELpVwAn3YG4iqs6GQcFqB3PWLa8
DEEPSEEK_API_KEY=sk-4cc79be2639c40f19123237042897f4a
API_KEY=your-secure-api-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Replace `your-secure-api-key` with a secure random string you generate.

### 3. Data Synchronization

To keep your Supabase database in sync with the FPL API, run:

```bash
node scripts/sync-fpl-data.js
```

This will fetch the latest data from the FPL API and store it in your Supabase database.

### 4. Generating Recommendations

To generate AI recommendations, run:

```bash
node scripts/trigger-ai-recommendations.js [type]
```

Where `[type]` can be:
- `all`: Generate all types of recommendations (default)
- `captains`: Generate only captain recommendations
- `transfers`: Generate only transfer recommendations
- `differentials`: Generate only differential recommendations

## Architecture

The AI recommendations feature uses the following architecture:

1. **Data Collection**: FPL data is fetched from the FPL API and stored in Supabase
2. **Next.js API Route**: A serverless API route processes the data and calls the Deepseek AI API
3. **AI Processing**: The Deepseek AI API analyzes the data and generates recommendations
4. **Storage**: Recommendations are stored in Supabase tables
5. **Frontend**: The Next.js frontend fetches and displays the recommendations

## Troubleshooting

### Missing Tables

If you encounter errors about missing tables, run the migration script:

```bash
node scripts/supabase-migration.js
```

### API Route Errors

If the API route fails, check the server logs in your Next.js development server or deployment platform.

### API Key Issues

If you encounter authentication errors, make sure your API key is correctly set in your `.env.local` file and that you're including it in the request headers.

### Database Relationship Issues

If you encounter an error like `Could not find a relationship between 'players' and 'team' in the schema cache` or `Could not find a relationship between 'transfer_recommendations' and 'player_id' in the schema cache`, this is because the Supabase schema doesn't have explicit foreign key relationships defined. The API routes have been updated to handle this by:

1. Fetching players and teams separately
2. Manually joining the data in memory using the player_id and team ID

This approach avoids the need for explicit database relationships while still providing the necessary data structure for the AI recommendations. This fix has been applied to:

- The AI recommendations generation API route (`/api/ai-recommendations/generate`)
- The frontend API routes for displaying recommendations:
  - `/api/recommendations/captains`
  - `/api/recommendations/transfers`
  - `/api/recommendations/differentials`

For the frontend API routes, we've completely removed the reliance on Supabase's built-in join functionality and instead:
1. Fetch the recommendations with just their basic fields (including player_id)
2. Fetch all players separately
3. Fetch all teams separately
4. Manually join the data in memory by matching player_id and team ID

### Duplicate Player Entries

If you see duplicate player entries in the recommendations, this could be due to two issues:

1. **Database Duplicates**: Running the AI recommendations generation script multiple times can create multiple entries for the same players in the same gameweek. The API routes have been updated to:
   - Explicitly select only the fields we need instead of using the wildcard selector
   - Properly handle the player and team data to avoid duplication

2. **Frontend Handling**: The frontend components have been updated to filter out duplicates by:
   - Identifying duplicates by player_id
   - Keeping only the most recent recommendation for each player
   - Re-sorting the filtered recommendations by rank or confidence score

This ensures that each player appears only once in the recommendations, even if there are multiple entries in the database.

## Customization

### Modifying Prompts

To customize the AI prompts, edit the API route code in `src/app/api/ai-recommendations/generate/route.ts`.

### Changing Recommendation Criteria

You can modify the criteria for recommendations by adjusting the data preparation and prompt generation in the API route.

## Scheduled Updates

To keep recommendations up-to-date, set up a CRON job to trigger the API route periodically:

```bash
0 0 * * * node /path/to/your/app/scripts/trigger-ai-recommendations.js all
```

This will generate all recommendations daily at midnight.

### Vercel Cron Jobs (if deployed to Vercel)

If your application is deployed to Vercel, you can use Vercel Cron Jobs to trigger the API route:

1. Create a file at `src/app/api/cron/update-recommendations/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.API_KEY;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai-recommendations/generate?type=all`, {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate recommendations: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Recommendations updated successfully',
      data
    });
  } catch (error) {
    console.error('Error updating recommendations:', error);
    return NextResponse.json({ error: 'Failed to update recommendations' }, { status: 500 });
  }
}
```

2. Add a cron configuration to your `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-recommendations",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This will trigger the API route daily at midnight.

## Generating Recommendations

After setting up the database and syncing FPL data, you can generate AI recommendations using the provided scripts:

### Running the Recommendation Scripts

To generate recommendations, use the `trigger-ai-recommendations.js` script:

```bash
# Generate all types of recommendations
node scripts/trigger-ai-recommendations.js all

# Generate only captain recommendations
node scripts/trigger-ai-recommendations.js captains

# Generate only transfer recommendations
node scripts/trigger-ai-recommendations.js transfers

# Generate only differential recommendations
node scripts/trigger-ai-recommendations.js differentials
```

The script will call the API route with the appropriate parameters and display the results in the console. The recommendations will also be stored in the Supabase database for use in the web application.

### Scheduling Recommendations

For production use, you may want to schedule these scripts to run automatically after each gameweek update. You can use cron jobs or a scheduling service like GitHub Actions to run the scripts at regular intervals.

## Personalized Transfer Recommendations

The AI Recommendations feature now supports personalized transfer suggestions based on a user's actual FPL team. This is implemented through:

1. A form in the Transfer Recommendations component where users can enter their FPL ID
2. An API route (`/api/fpl/user-team`) that fetches the user's current team from the FPL API
3. Enhanced transfer recommendations that consider the user's team:
   - "Players to Sell" recommendations are filtered to only include players in the user's team
   - "Players to Buy" recommendations exclude players already in the user's team

This personalization makes the transfer suggestions more relevant and actionable for each user.

### How to Use

1. Navigate to the AI Recommendations page
2. Click on the "Transfer Suggestions" tab
3. Enter your FPL ID in the form (you can find this in the URL when you visit your FPL team page)
4. Click "Get Recommendations" to see personalized suggestions tailored to your team

The system will display your current team at the top of the page and filter the recommendations to show only relevant players to buy or sell. 