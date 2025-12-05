/**
 * Vendor Console Home Page
 * 
 * Placeholder for vendor functionality
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function VendorHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Vendor Console</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your vendor services and assignments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vendor console functionality will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

