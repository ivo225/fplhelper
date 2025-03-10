'use client';

import React from 'react';
import Card from '@/components/ui/Card';

export default function SchemaIssueState() {
  return (
    <Card className="mb-6">
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-2">Database Schema Issue</h3>
        <p>There appears to be an issue with the database schema for transfer recommendations. The system couldn't determine which column contains player IDs.</p>
        <p className="mt-2">Please contact the administrator to update the database schema.</p>
      </div>
    </Card>
  );
}
